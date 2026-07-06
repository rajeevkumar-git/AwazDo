-- =============================================================================
-- AwazDo — Seed Data
-- Populates: tenants, departments, complaint_categories
-- Run AFTER schema.sql
-- =============================================================================

-- ─────────────────────────────────────────────
-- 1. TENANTS
-- ─────────────────────────────────────────────
INSERT INTO tenants (id, slug, name, state, city_hindi, plan, config) VALUES
(
    'a1b2c3d4-0000-0000-0000-000000000001',
    'delhi',
    'Delhi MCD',
    'Delhi',
    'दिल्ली',
    'free',
    '{"max_media_mb": 10, "default_lang": "hi", "wards_count": 250, "helpline": "1800-111-DELHI"}'
),
(
    'a1b2c3d4-0000-0000-0000-000000000002',
    'ghaziabad',
    'Ghaziabad Nagar Nigam',
    'Uttar Pradesh',
    'गाज़ियाबाद',
    'free',
    '{"max_media_mb": 10, "default_lang": "hi", "wards_count": 100, "helpline": "1800-111-GZB"}'
)
ON CONFLICT (slug) DO NOTHING;


-- ─────────────────────────────────────────────
-- 2. DEPARTMENTS — Delhi
-- ─────────────────────────────────────────────
INSERT INTO departments (id, tenant_id, name, name_hi, sla_hours) VALUES
-- Roads & Infrastructure
('d0000001-0000-0000-0001-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Roads & Infrastructure', 'सड़क एवं अवसंरचना', 72),
-- Water Supply
('d0000001-0000-0000-0001-000000000002', 'a1b2c3d4-0000-0000-0000-000000000001', 'Water Supply', 'जल आपूर्ति', 24),
-- Sanitation & Waste
('d0000001-0000-0000-0001-000000000003', 'a1b2c3d4-0000-0000-0000-000000000001', 'Sanitation & Solid Waste', 'स्वच्छता एवं ठोस अपशिष्ट', 12),
-- Electricity
('d0000001-0000-0000-0001-000000000004', 'a1b2c3d4-0000-0000-0000-000000000001', 'Electricity & Street Lights', 'बिजली एवं स्ट्रीट लाइट', 24),
-- Parks & Horticulture
('d0000001-0000-0000-0001-000000000005', 'a1b2c3d4-0000-0000-0000-000000000001', 'Parks & Horticulture', 'पार्क एवं बागवानी', 48),
-- Health
('d0000001-0000-0000-0001-000000000006', 'a1b2c3d4-0000-0000-0000-000000000001', 'Public Health', 'सार्वजनिक स्वास्थ्य', 48),
-- Anti-Corruption
('d0000001-0000-0000-0001-000000000007', 'a1b2c3d4-0000-0000-0000-000000000001', 'Anti-Corruption Cell', 'भ्रष्टाचार निरोधक प्रकोष्ठ', 24)
ON CONFLICT (tenant_id, name) DO NOTHING;


-- ─────────────────────────────────────────────
-- 3. DEPARTMENTS — Ghaziabad
-- ─────────────────────────────────────────────
INSERT INTO departments (id, tenant_id, name, name_hi, sla_hours) VALUES
('d0000002-0000-0000-0002-000000000001', 'a1b2c3d4-0000-0000-0000-000000000002', 'Roads & Infrastructure', 'सड़क एवं अवसंरचना', 72),
('d0000002-0000-0000-0002-000000000002', 'a1b2c3d4-0000-0000-0000-000000000002', 'Water Supply', 'जल आपूर्ति', 24),
('d0000002-0000-0000-0002-000000000003', 'a1b2c3d4-0000-0000-0000-000000000002', 'Sanitation & Solid Waste', 'स्वच्छता एवं ठोस अपशिष्ट', 12),
('d0000002-0000-0000-0002-000000000004', 'a1b2c3d4-0000-0000-0000-000000000002', 'Electricity & Street Lights', 'बिजली एवं स्ट्रीट लाइट', 24),
('d0000002-0000-0000-0002-000000000005', 'a1b2c3d4-0000-0000-0000-000000000002', 'Parks & Horticulture', 'पार्क एवं बागवानी', 48),
('d0000002-0000-0000-0002-000000000006', 'a1b2c3d4-0000-0000-0000-000000000002', 'Public Health', 'सार्वजनिक स्वास्थ्य', 48),
('d0000002-0000-0000-0002-000000000007', 'a1b2c3d4-0000-0000-0000-000000000002', 'Anti-Corruption Cell', 'भ्रष्टाचार निरोधक प्रकोष्ठ', 24)
ON CONFLICT (tenant_id, name) DO NOTHING;


-- ─────────────────────────────────────────────
-- 4. COMPLAINT CATEGORIES
-- ─────────────────────────────────────────────
INSERT INTO complaint_categories (category, category_hi, sub_category, sub_cat_hi, dept_hint, icon) VALUES

-- Roads
('roads', 'सड़क',      'Pothole',                    'गड्ढा',                'Roads & Infrastructure', '🕳️'),
('roads', 'सड़क',      'Road Damage',                'सड़क क्षति',           'Roads & Infrastructure', '🚧'),
('roads', 'सड़क',      'Footpath Encroachment',       'फुटपाथ अतिक्रमण',     'Roads & Infrastructure', '⚠️'),
('roads', 'सड़क',      'Broken Divider',              'टूटा डिवाइडर',         'Roads & Infrastructure', '🚦'),
('roads', 'सड़क',      'Speed Breaker Issue',         'स्पीड ब्रेकर समस्या', 'Roads & Infrastructure', '🛤️'),

-- Water Supply
('water_supply', 'जल आपूर्ति', 'No Water Supply',         'पानी नहीं आ रहा',     'Water Supply', '💧'),
('water_supply', 'जल आपूर्ति', 'Dirty Water',             'गंदा पानी',            'Water Supply', '🚿'),
('water_supply', 'जल आपूर्ति', 'Leaking Pipe',            'लीक पाइप',             'Water Supply', '🔧'),
('water_supply', 'जल आपूर्ति', 'Low Water Pressure',      'कम पानी प्रेशर',       'Water Supply', '📉'),
('water_supply', 'जल आपूर्ति', 'Borewell Issue',          'बोरवेल समस्या',        'Water Supply', '⛏️'),

-- Sanitation
('sanitation', 'स्वच्छता',    'Garbage Not Collected',   'कूड़ा नहीं उठा',       'Sanitation & Solid Waste', '🗑️'),
('sanitation', 'स्वच्छता',    'Open Defecation',         'खुले में शौच',          'Sanitation & Solid Waste', '🚽'),
('sanitation', 'स्वच्छता',    'Blocked Drain',           'नाला जाम',             'Sanitation & Solid Waste', '🚫'),
('sanitation', 'स्वच्छता',    'Overflowing Sewage',      'सीवर ओवरफ्लो',         'Sanitation & Solid Waste', '💩'),
('sanitation', 'स्वच्छता',    'Illegal Dumping',         'अवैध कचरा डंपिंग',     'Sanitation & Solid Waste', '⛔'),

-- Electricity
('electricity', 'बिजली',      'Power Outage',            'बिजली गुल',            'Electricity & Street Lights', '⚡'),
('electricity', 'बिजली',      'Broken Street Light',     'टूटी स्ट्रीट लाइट',   'Electricity & Street Lights', '💡'),
('electricity', 'बिजली',      'Dangerous Wire',          'खतरनाक तार',           'Electricity & Street Lights', '🔌'),
('electricity', 'बिजली',      'No Street Light',         'स्ट्रीट लाइट नहीं',   'Electricity & Street Lights', '🌑'),
('electricity', 'बिजली',      'Transformer Issue',       'ट्रांसफार्मर खराब',    'Electricity & Street Lights', '🏭'),

-- Parks
('parks', 'पार्क',            'Broken Equipment',        'टूटे उपकरण',           'Parks & Horticulture', '🛝'),
('parks', 'पार्क',            'Overgrown Vegetation',    'झाड़ियाँ बढ़ी हुई',    'Parks & Horticulture', '🌿'),
('parks', 'पार्क',            'Encroachment in Park',    'पार्क में अतिक्रमण',  'Parks & Horticulture', '🏗️'),
('parks', 'पार्क',            'Dirty Park',              'गंदा पार्क',            'Parks & Horticulture', '🧹'),

-- Health
('health', 'स्वास्थ्य',       'Stray Animals',           'आवारा जानवर',          'Public Health', '🐕'),
('health', 'स्वास्थ्य',       'Mosquito Breeding',       'मच्छर पनपना',          'Public Health', '🦟'),
('health', 'स्वास्थ्य',       'Dead Animal',             'मृत जानवर',            'Public Health', '☠️'),
('health', 'स्वास्थ्य',       'Food Adulteration',       'मिलावटी खाना',         'Public Health', '🍽️'),
('health', 'स्वास्थ्य',       'Hospital Complaint',      'अस्पताल शिकायत',       'Public Health', '🏥'),

-- Corruption
('corruption', 'भ्रष्टाचार',  'Bribery',                 'रिश्वत',               'Anti-Corruption Cell', '💸'),
('corruption', 'भ्रष्टाचार',  'Extortion',               'जबरन वसूली',           'Anti-Corruption Cell', '😤'),
('corruption', 'भ्रष्टाचार',  'Work Not Done After Payment', 'पैसे लेकर काम नहीं', 'Anti-Corruption Cell', '❌'),
('corruption', 'भ्रष्टाचार',  'Fake Inspection',         'फर्जी निरीक्षण',       'Anti-Corruption Cell', '🕵️'),

-- Drainage
('drainage', 'नाला',          'Clogged Drain',           'बंद नाला',             'Sanitation & Solid Waste', '🌊'),
('drainage', 'नाला',          'Waterlogging',            'जलभराव',               'Roads & Infrastructure', '🌧️'),
('drainage', 'नाला',          'Broken Manhole',          'टूटा मैनहोल',          'Roads & Infrastructure', '🕳️'),

-- Noise
('noise', 'शोर',              'Loudspeaker Nuisance',    'लाउडस्पीकर उपद्रव',   NULL, '📢'),
('noise', 'शोर',              'Construction Noise',      'निर्माण शोर',          NULL, '🏗️'),
('noise', 'शोर',              'Industrial Noise',        'औद्योगिक शोर',         NULL, '🏭'),

-- Encroachment
('encroachment', 'अतिक्रमण',  'Road Encroachment',       'सड़क अतिक्रमण',        'Roads & Infrastructure', '🚧'),
('encroachment', 'अतिक्रमण',  'Public Land Grab',        'सार्वजनिक जमीन कब्जा', 'Anti-Corruption Cell', '⛔'),
('encroachment', 'अतिक्रमण',  'Illegal Construction',    'अवैध निर्माण',          'Roads & Infrastructure', '🏗️'),

-- Street Lights (standalone)
('street_lights', 'स्ट्रीट लाइट', 'Non-Functional Light', 'बंद स्ट्रीट लाइट', 'Electricity & Street Lights', '🔦'),
('street_lights', 'स्ट्रीट लाइट', 'New Light Needed',     'नई लाइट चाहिए',     'Electricity & Street Lights', '💡'),

-- Animals
('animals', 'जानवर',          'Stray Dog Attack',        'आवारा कुत्ते का हमला', 'Public Health', '🐕'),
('animals', 'जानवर',          'Cattle on Road',          'सड़क पर मवेशी',         NULL, '🐄'),
('animals', 'जानवर',          'Monkey Menace',           'बंदर उपद्रव',           'Public Health', '🐒'),

-- Other
('other', 'अन्य',             'General Complaint',       'सामान्य शिकायत',       NULL, '📋'),
('other', 'अन्य',             'Suggestion',              'सुझाव',                NULL, '💬'),
('other', 'अन्य',             'Appreciation',            'प्रशंसा',               NULL, '👏')

ON CONFLICT (category, sub_category) DO NOTHING;


-- ─────────────────────────────────────────────
-- 5. SAMPLE WARDS (Delhi — first 5 for reference)
-- Real geometry would be loaded from GeoJSON shapefile
-- ─────────────────────────────────────────────
INSERT INTO wards (id, tenant_id, ward_number, ward_name, ward_name_hi, zone) VALUES
('w0000001-0001-0001-0001-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 1,   'Adarsh Nagar',     'आदर्श नगर',    'North'),
('w0000001-0001-0001-0001-000000000002', 'a1b2c3d4-0000-0000-0000-000000000001', 2,   'Alipur',           'अलीपुर',       'North'),
('w0000001-0001-0001-0001-000000000003', 'a1b2c3d4-0000-0000-0000-000000000001', 3,   'Ambedkar Nagar',   'अम्बेडकर नगर', 'South'),
('w0000001-0001-0001-0001-000000000004', 'a1b2c3d4-0000-0000-0000-000000000001', 4,   'Anand Parbat',     'आनंद पर्वत',  'Central'),
('w0000001-0001-0001-0001-000000000005', 'a1b2c3d4-0000-0000-0000-000000000001', 5,   'Aravali',          'अरावली',       'South')
ON CONFLICT (tenant_id, ward_number) DO NOTHING;

-- Ghaziabad sample wards
INSERT INTO wards (id, tenant_id, ward_number, ward_name, ward_name_hi, zone) VALUES
('w0000002-0002-0002-0002-000000000001', 'a1b2c3d4-0000-0000-0000-000000000002', 1,  'Kavi Nagar',       'कवि नगर',      'Zone 1'),
('w0000002-0002-0002-0002-000000000002', 'a1b2c3d4-0000-0000-0000-000000000002', 2,  'Vijay Nagar',      'विजय नगर',     'Zone 1'),
('w0000002-0002-0002-0002-000000000003', 'a1b2c3d4-0000-0000-0000-000000000002', 3,  'Vasundhara',       'वसुंधरा',      'Zone 2'),
('w0000002-0002-0002-0002-000000000004', 'a1b2c3d4-0000-0000-0000-000000000002', 4,  'Indirapuram',      'इंदिरापुरम',   'Zone 2'),
('w0000002-0002-0002-0002-000000000005', 'a1b2c3d4-0000-0000-0000-000000000002', 5,  'Raj Nagar',        'राज नगर',      'Zone 3')
ON CONFLICT (tenant_id, ward_number) DO NOTHING;


-- ─────────────────────────────────────────────
-- 6. SAMPLE OFFICERS (Delhi — one per department)
-- ─────────────────────────────────────────────
INSERT INTO officers (id, tenant_id, name, phone, dept_id, role) VALUES
('o0000001-0001-0001-0001-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Ramesh Kumar',   '+919810000001', 'd0000001-0000-0000-0001-000000000001', 'dept_head'),
('o0000001-0001-0001-0001-000000000002', 'a1b2c3d4-0000-0000-0000-000000000001', 'Sunita Sharma',  '+919810000002', 'd0000001-0000-0000-0001-000000000002', 'dept_head'),
('o0000001-0001-0001-0001-000000000003', 'a1b2c3d4-0000-0000-0000-000000000001', 'Anil Gupta',     '+919810000003', 'd0000001-0000-0000-0001-000000000003', 'dept_head'),
('o0000001-0001-0001-0001-000000000004', 'a1b2c3d4-0000-0000-0000-000000000001', 'Priya Singh',    '+919810000004', 'd0000001-0000-0000-0001-000000000004', 'dept_head'),
('o0000001-0001-0001-0001-000000000005', 'a1b2c3d4-0000-0000-0000-000000000001', 'Vijay Yadav',    '+919810000005', 'd0000001-0000-0000-0001-000000000005', 'dept_head'),
('o0000001-0001-0001-0001-000000000006', 'a1b2c3d4-0000-0000-0000-000000000001', 'Meena Rawat',    '+919810000006', 'd0000001-0000-0000-0001-000000000006', 'dept_head'),
('o0000001-0001-0001-0001-000000000007', 'a1b2c3d4-0000-0000-0000-000000000001', 'Deepak Verma',   '+919810000007', 'd0000001-0000-0000-0001-000000000007', 'dept_head')
ON CONFLICT (tenant_id, phone) DO NOTHING;