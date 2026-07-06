-- =============================================================================
-- AwazDo Civic Grievance Platform — Complete Supabase PostgreSQL Schema
-- DB: Supabase (PostgreSQL 16 + PostGIS)
-- Multi-tenant: schema-level isolation via tenant_id on every row
-- Auth: Supabase Auth (phone OTP)
-- Pilot cities: Delhi (250 wards) + Ghaziabad (100 wards)
-- =============================================================================

-- ─────────────────────────────────────────────
-- 0. EXTENSIONS
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS postgis;          -- Spatial queries + geometry types
CREATE EXTENSION IF NOT EXISTS postgis_topology; -- Optional: topology support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- gen_random_uuid() fallback
CREATE EXTENSION IF NOT EXISTS pg_trgm;          -- Trigram indexes for fuzzy search

-- ─────────────────────────────────────────────
-- 1. CUSTOM TYPES / ENUMS
-- ─────────────────────────────────────────────

-- Complaint lifecycle statuses
CREATE TYPE complaint_status AS ENUM (
    'submitted',   -- Citizen has filed, awaiting triage
    'acknowledged',-- Officer confirmed receipt
    'in_progress', -- Active work underway
    'resolved',    -- Issue fixed, pending citizen confirmation
    'closed',      -- Citizen confirmed OR auto-closed after SLA
    'rejected',    -- Invalid / duplicate / out-of-scope
    'escalated'    -- Pushed up the chain
);

-- Severity scale (1 = critical, 5 = low)
CREATE TYPE complaint_severity AS ENUM ('1','2','3','4','5');

-- Notification delivery channels
CREATE TYPE notification_channel AS ENUM ('sms', 'whatsapp', 'push', 'email', 'ivr');

-- Complaint submission channels
CREATE TYPE submission_channel AS ENUM ('web', 'app', 'whatsapp', 'ivr', 'offline');

-- Officer roles
CREATE TYPE officer_role AS ENUM ('field_worker', 'supervisor', 'dept_head', 'admin');

-- Subscription plans for tenants
CREATE TYPE tenant_plan AS ENUM ('free', 'starter', 'pro', 'enterprise');


-- ─────────────────────────────────────────────
-- 2. HELPER: updated_at trigger function
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


-- ─────────────────────────────────────────────
-- 3. TENANTS
-- ─────────────────────────────────────────────
CREATE TABLE tenants (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT        NOT NULL UNIQUE,                     -- URL-safe identifier e.g. "delhi"
    name        TEXT        NOT NULL,                            -- Display name e.g. "Delhi MCD"
    state       TEXT        NOT NULL,                            -- Indian state name
    city_hindi  TEXT,                                            -- City name in Hindi script
    plan        tenant_plan NOT NULL DEFAULT 'free',
    config      JSONB       NOT NULL DEFAULT '{}',               -- Feature flags, SLA overrides, branding
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  tenants              IS 'One row per city/municipality deployment of AwazDo.';
COMMENT ON COLUMN tenants.config       IS 'Arbitrary JSON: e.g. {"max_media_mb":10,"default_lang":"hi","logo_url":"..."}';

CREATE INDEX idx_tenants_slug ON tenants (slug);

CREATE TRIGGER set_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ─────────────────────────────────────────────
-- 4. DEPARTMENTS
-- ─────────────────────────────────────────────
CREATE TABLE departments (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID    NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        TEXT    NOT NULL,        -- English name
    name_hi     TEXT,                   -- Hindi name
    head_name   TEXT,                   -- Current department head full name
    head_phone  TEXT,                   -- Head's contact number
    sla_hours   INTEGER NOT NULL DEFAULT 48,   -- Default SLA in hours
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, name)
);

COMMENT ON TABLE  departments          IS 'Municipal departments responsible for complaint categories.';
COMMENT ON COLUMN departments.sla_hours IS 'Hours within which complaints should be resolved. Overridable per complaint.';

CREATE INDEX idx_departments_tenant ON departments (tenant_id);

CREATE TRIGGER set_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ─────────────────────────────────────────────
-- 5. WARDS (with PostGIS geometry)
-- ─────────────────────────────────────────────
CREATE TABLE wards (
    id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID    NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    ward_number  INTEGER NOT NULL,
    ward_name    TEXT    NOT NULL,
    ward_name_hi TEXT,
    zone         TEXT,                  -- Zone / circle grouping within city
    geom         GEOMETRY(MULTIPOLYGON, 4326),   -- Ward boundary in WGS-84
    dept_id      UUID    REFERENCES departments(id) ON DELETE SET NULL,  -- Primary dept for this ward
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, ward_number)
);

COMMENT ON TABLE  wards      IS 'Administrative wards. Geometries loaded from GeoJSON shapefiles.';
COMMENT ON COLUMN wards.geom IS 'Ward boundary polygon in WGS-84 (EPSG:4326). Used for spatial complaint routing.';

-- GiST spatial index for fast ST_Within / ST_Contains queries
CREATE INDEX idx_wards_geom     ON wards USING GIST (geom);
CREATE INDEX idx_wards_tenant   ON wards (tenant_id);

CREATE TRIGGER set_wards_updated_at
    BEFORE UPDATE ON wards
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ─────────────────────────────────────────────
-- 6. CITIZENS (mirrors auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE citizens (
    id              UUID    PRIMARY KEY,   -- = auth.uid() set by Auth trigger
    phone           TEXT    UNIQUE NOT NULL,
    name            TEXT,
    preferred_lang  TEXT    NOT NULL DEFAULT 'hi',   -- BCP-47: 'hi', 'en', 'ur'
    tenant_id       UUID    NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    ward_id         UUID    REFERENCES wards(id) ON DELETE SET NULL,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  citizens           IS 'Citizen profiles linked 1-to-1 with Supabase Auth users.';
COMMENT ON COLUMN citizens.id        IS 'Matches auth.uid() — set automatically on first sign-in via trigger.';

CREATE INDEX idx_citizens_tenant ON citizens (tenant_id);
CREATE INDEX idx_citizens_ward   ON citizens (ward_id);
CREATE INDEX idx_citizens_phone  ON citizens (phone);

CREATE TRIGGER set_citizens_updated_at
    BEFORE UPDATE ON citizens
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Auto-create citizen row when new Auth user signs up via phone OTP
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.citizens (id, phone, created_at)
    VALUES (
        NEW.id,
        NEW.phone,
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();


-- ─────────────────────────────────────────────
-- 7. COMPLAINT CATEGORIES (lookup table)
-- ─────────────────────────────────────────────
CREATE TABLE complaint_categories (
    id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    category     TEXT  NOT NULL UNIQUE,    -- e.g. 'roads'
    category_hi  TEXT,                     -- Hindi: 'सड़क'
    sub_category TEXT  NOT NULL,
    sub_cat_hi   TEXT,
    dept_hint    TEXT,                     -- Suggested department name
    icon         TEXT,                     -- emoji or icon key
    UNIQUE (category, sub_category)
);

COMMENT ON TABLE complaint_categories IS 'Master list of complaint types used for routing and analytics.';


-- ─────────────────────────────────────────────
-- 8. COMPLAINTS
-- ─────────────────────────────────────────────

-- Ticket ID sequence per tenant per year  (AWZ-YYYY-NNNNN)
CREATE SEQUENCE IF NOT EXISTS complaint_ticket_seq START 10001 INCREMENT 1;

CREATE TABLE complaints (
    id           UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id    TEXT            NOT NULL UNIQUE,   -- Human-readable e.g. AWZ-2025-10001
    citizen_id   UUID            NOT NULL REFERENCES citizens(id) ON DELETE RESTRICT,
    tenant_id    UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Deduplication: if this complaint is a duplicate, master_id points to the canonical one
    master_id    UUID            REFERENCES complaints(id) ON DELETE SET NULL,

    -- Classification
    category     TEXT            NOT NULL,
    sub_category TEXT,
    severity     INTEGER         NOT NULL DEFAULT 3 CHECK (severity BETWEEN 1 AND 5),
    status       complaint_status NOT NULL DEFAULT 'submitted',

    -- Content
    title        TEXT            NOT NULL,
    description  TEXT,

    -- Location (PostGIS)
    location     GEOMETRY(POINT, 4326),  -- Exact GPS drop-pin in WGS-84
    geohash      TEXT,                   -- Geohash-7 (~76m precision) for clustering
    address_text TEXT,                   -- Reverse-geocoded human address

    -- Routing
    ward_id      UUID            REFERENCES wards(id) ON DELETE SET NULL,
    dept_id      UUID            REFERENCES departments(id) ON DELETE SET NULL,

    -- Media (Supabase Storage object keys, not full URLs)
    media_before TEXT[]          DEFAULT '{}',   -- Photos/videos before fix
    media_after  TEXT[]          DEFAULT '{}',   -- Photos/videos after fix

    -- Meta
    channel      submission_channel NOT NULL DEFAULT 'web',
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    resolved_at  TIMESTAMPTZ,            -- Set when status -> resolved/closed
    due_at       TIMESTAMPTZ,            -- SLA deadline (created_at + dept.sla_hours)

    -- Soft validation
    CONSTRAINT valid_category CHECK (
        category IN (
            'roads', 'water_supply', 'sanitation', 'electricity', 'parks',
            'health', 'corruption', 'encroachment', 'street_lights',
            'drainage', 'noise', 'animals', 'other'
        )
    )
);

COMMENT ON TABLE  complaints            IS 'Core table: every civic grievance filed on AwazDo.';
COMMENT ON COLUMN complaints.ticket_id  IS 'Format: AWZ-YYYY-NNNNN. Auto-generated by trigger.';
COMMENT ON COLUMN complaints.master_id  IS 'Self-referential FK for dedup clustering. NULL = canonical.';
COMMENT ON COLUMN complaints.location   IS 'PostGIS POINT (longitude, latitude) in EPSG:4326.';
COMMENT ON COLUMN complaints.geohash    IS 'Geohash level-7 for fast bounding-box cluster queries.';
COMMENT ON COLUMN complaints.media_before IS 'Array of Supabase Storage keys for pre-fix evidence.';

-- ── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_complaints_tenant       ON complaints (tenant_id);
CREATE INDEX idx_complaints_citizen      ON complaints (citizen_id);
CREATE INDEX idx_complaints_ward         ON complaints (ward_id);
CREATE INDEX idx_complaints_dept         ON complaints (dept_id);
CREATE INDEX idx_complaints_status       ON complaints (status);
CREATE INDEX idx_complaints_created_at   ON complaints (created_at DESC);
CREATE INDEX idx_complaints_master       ON complaints (master_id) WHERE master_id IS NOT NULL;
CREATE INDEX idx_complaints_geohash      ON complaints (geohash) WHERE geohash IS NOT NULL;

-- GiST spatial index on complaint GPS point (critical for ward routing)
CREATE INDEX idx_complaints_location     ON complaints USING GIST (location) WHERE location IS NOT NULL;

-- Composite indexes for common dashboard queries
CREATE INDEX idx_complaints_tenant_status  ON complaints (tenant_id, status);
CREATE INDEX idx_complaints_tenant_created ON complaints (tenant_id, created_at DESC);
CREATE INDEX idx_complaints_ward_status    ON complaints (ward_id, status);

-- ── Triggers ────────────────────────────────────────────────────────────────
CREATE TRIGGER set_complaints_updated_at
    BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Auto-generate ticket_id in AWZ-YYYY-NNNNN format
CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_year TEXT;
    v_seq  BIGINT;
BEGIN
    v_year := TO_CHAR(NOW(), 'YYYY');
    v_seq  := NEXTVAL('complaint_ticket_seq');
    NEW.ticket_id := 'AWZ-' || v_year || '-' || LPAD(v_seq::TEXT, 5, '0');
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_ticket_id
    BEFORE INSERT ON complaints
    FOR EACH ROW
    WHEN (NEW.ticket_id IS NULL OR NEW.ticket_id = '')
    EXECUTE FUNCTION generate_ticket_id();

-- Auto-set due_at from department SLA when complaint is inserted
CREATE OR REPLACE FUNCTION set_complaint_due_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_sla INTEGER;
BEGIN
    IF NEW.dept_id IS NOT NULL AND NEW.due_at IS NULL THEN
        SELECT sla_hours INTO v_sla FROM departments WHERE id = NEW.dept_id;
        NEW.due_at := NOW() + (v_sla || ' hours')::INTERVAL;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_due_at
    BEFORE INSERT ON complaints
    FOR EACH ROW EXECUTE FUNCTION set_complaint_due_at();

-- Auto-set resolved_at when status transitions to resolved or closed
CREATE OR REPLACE FUNCTION set_resolved_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.status IN ('resolved', 'closed') AND OLD.status NOT IN ('resolved', 'closed') THEN
        NEW.resolved_at := NOW();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_resolved_at
    BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION set_resolved_at();

-- Auto-route complaint to ward using spatial lookup when location is provided
CREATE OR REPLACE FUNCTION auto_route_complaint_ward()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_ward_id UUID;
BEGIN
    IF NEW.location IS NOT NULL AND NEW.ward_id IS NULL THEN
        SELECT id INTO v_ward_id
        FROM wards
        WHERE tenant_id = NEW.tenant_id
          AND ST_Within(NEW.location, geom)
        LIMIT 1;
        NEW.ward_id := v_ward_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_route_ward
    BEFORE INSERT ON complaints
    FOR EACH ROW EXECUTE FUNCTION auto_route_complaint_ward();


-- ─────────────────────────────────────────────
-- 9. OFFICERS
-- ─────────────────────────────────────────────
CREATE TABLE officers (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL,
    phone       TEXT        NOT NULL,
    dept_id     UUID        REFERENCES departments(id) ON DELETE SET NULL,
    ward_id     UUID        REFERENCES wards(id) ON DELETE SET NULL,
    role        officer_role NOT NULL DEFAULT 'field_worker',
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, phone)
);

COMMENT ON TABLE officers IS 'Municipal officers who action complaints. Linked to dept + ward.';

CREATE INDEX idx_officers_tenant ON officers (tenant_id);
CREATE INDEX idx_officers_dept   ON officers (dept_id);
CREATE INDEX idx_officers_ward   ON officers (ward_id);

CREATE TRIGGER set_officers_updated_at
    BEFORE UPDATE ON officers
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ─────────────────────────────────────────────
-- 10. ESCALATIONS
-- ─────────────────────────────────────────────
CREATE TABLE escalations (
    id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id  UUID    NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    level         INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),  -- 1=dept, 2=zone, 3=city, 4=state, 5=court
    escalated_to  UUID    REFERENCES officers(id) ON DELETE SET NULL,
    escalated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason        TEXT,
    resolved      BOOLEAN NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE escalations IS 'Audit trail of all escalation events for a complaint.';

CREATE INDEX idx_escalations_complaint ON escalations (complaint_id);
CREATE INDEX idx_escalations_officer   ON escalations (escalated_to);


-- ─────────────────────────────────────────────
-- 11. COMPLAINT VOTES (Community Upvoting)
-- ─────────────────────────────────────────────
CREATE TABLE complaint_votes (
    id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id  UUID    NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    citizen_id    UUID    NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
    voted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (complaint_id, citizen_id)   -- One vote per citizen per complaint
);

COMMENT ON TABLE complaint_votes IS 'Citizens upvote duplicate/similar complaints to signal community priority.';

CREATE INDEX idx_votes_complaint ON complaint_votes (complaint_id);
CREATE INDEX idx_votes_citizen   ON complaint_votes (citizen_id);


-- ─────────────────────────────────────────────
-- 12. NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE notifications (
    id            UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id    UUID                 NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
    complaint_id  UUID                 REFERENCES complaints(id) ON DELETE SET NULL,
    channel       notification_channel NOT NULL,
    message       TEXT                 NOT NULL,
    message_hi    TEXT,                -- Hindi version of the message
    sent_at       TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    status        TEXT                 NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read'))
);

COMMENT ON TABLE notifications IS 'All outbound notifications sent to citizens (SMS, WhatsApp, Push, IVR).';

CREATE INDEX idx_notifications_citizen   ON notifications (citizen_id);
CREATE INDEX idx_notifications_complaint ON notifications (complaint_id);
CREATE INDEX idx_notifications_sent_at   ON notifications (sent_at DESC);
CREATE INDEX idx_notifications_status    ON notifications (status) WHERE status IN ('pending', 'failed');


-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Philosophy:
--   • Citizens can read their own data and public complaint data within their tenant
--   • Officers can read/update complaints in their department + ward
--   • Tenant admins (via service_role or custom claims) can manage their tenant
--   • All cross-tenant access is blocked

ALTER TABLE tenants          ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE wards            ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizens         ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints       ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE officers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_votes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;

-- ── Helper: get current citizen's tenant_id ──────────────────────────────────
CREATE OR REPLACE FUNCTION current_citizen_tenant()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT tenant_id FROM public.citizens WHERE id = auth.uid()
$$;

-- ── tenants: public read, no write ───────────────────────────────────────────
CREATE POLICY "tenants_public_read"
    ON tenants FOR SELECT
    USING (TRUE);

-- ── departments: readable within same tenant ─────────────────────────────────
CREATE POLICY "departments_tenant_read"
    ON departments FOR SELECT
    USING (tenant_id = current_citizen_tenant());

-- ── wards: readable within same tenant ───────────────────────────────────────
CREATE POLICY "wards_tenant_read"
    ON wards FOR SELECT
    USING (tenant_id = current_citizen_tenant());

-- ── complaint_categories: global public read ─────────────────────────────────
CREATE POLICY "categories_public_read"
    ON complaint_categories FOR SELECT
    USING (TRUE);

-- ── citizens: own profile only ───────────────────────────────────────────────
CREATE POLICY "citizens_read_own"
    ON citizens FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "citizens_update_own"
    ON citizens FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "citizens_insert_own"
    ON citizens FOR INSERT
    WITH CHECK (id = auth.uid());

-- ── complaints: citizens can CRUD their own; read all within tenant ───────────
CREATE POLICY "complaints_read_own_tenant"
    ON complaints FOR SELECT
    USING (tenant_id = current_citizen_tenant());

CREATE POLICY "complaints_insert_own"
    ON complaints FOR INSERT
    WITH CHECK (
        citizen_id = auth.uid()
        AND tenant_id = current_citizen_tenant()
    );

CREATE POLICY "complaints_update_own"
    ON complaints FOR UPDATE
    USING (citizen_id = auth.uid())
    WITH CHECK (citizen_id = auth.uid());

-- ── officers: readable within same tenant ────────────────────────────────────
CREATE POLICY "officers_tenant_read"
    ON officers FOR SELECT
    USING (tenant_id = current_citizen_tenant());

-- ── escalations: read if the complaint belongs to citizen's tenant ────────────
CREATE POLICY "escalations_read"
    ON escalations FOR SELECT
    USING (
        complaint_id IN (
            SELECT id FROM complaints WHERE tenant_id = current_citizen_tenant()
        )
    );

-- ── complaint_votes: citizens manage their own votes ─────────────────────────
CREATE POLICY "votes_read"
    ON complaint_votes FOR SELECT
    USING (TRUE);

CREATE POLICY "votes_insert_own"
    ON complaint_votes FOR INSERT
    WITH CHECK (citizen_id = auth.uid());

CREATE POLICY "votes_delete_own"
    ON complaint_votes FOR DELETE
    USING (citizen_id = auth.uid());

-- ── notifications: citizens read their own ───────────────────────────────────
CREATE POLICY "notifications_read_own"
    ON notifications FOR SELECT
    USING (citizen_id = auth.uid());


-- =============================================================================
-- VIEWS (convenience for dashboards)
-- =============================================================================

-- Complaint list with vote count + department name
CREATE OR REPLACE VIEW complaint_summary AS
SELECT
    c.id,
    c.ticket_id,
    c.tenant_id,
    c.citizen_id,
    c.category,
    c.sub_category,
    c.severity,
    c.status,
    c.title,
    c.address_text,
    c.geohash,
    c.channel,
    c.created_at,
    c.due_at,
    c.resolved_at,
    d.name        AS dept_name,
    d.name_hi     AS dept_name_hi,
    w.ward_number,
    w.ward_name,
    w.ward_name_hi,
    COUNT(DISTINCT cv.id) AS vote_count
FROM complaints c
LEFT JOIN departments     d  ON d.id  = c.dept_id
LEFT JOIN wards           w  ON w.id  = c.ward_id
LEFT JOIN complaint_votes cv ON cv.complaint_id = c.id
GROUP BY c.id, d.name, d.name_hi, w.ward_number, w.ward_name, w.ward_name_hi;

COMMENT ON VIEW complaint_summary IS 'Denormalised complaint view for listings and maps.';