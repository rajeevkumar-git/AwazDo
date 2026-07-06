# 🇮🇳 AwazDo — अपनी आवाज़ दो

> *"Give your voice to the city / शहर को अपनी आवाज़ दो"*

**AwazDo** is a multi-tenant, multi-channel, zero-investment SaaS civic grievance resolution platform designed specifically for municipal authorities and citizens in India. Starting with a pilot in **Delhi (MCD)** and **Ghaziabad (GNN)**, it acts as an intelligent routing and accountability layer that connects citizens directly with their ward representatives and local junior engineers.

---

## 🌟 Key Features

* **🌐 Vernacular-First Ingestion:** Fully bilingual UI (Hindi & English) designed to work seamlessly on low-cost mobile screens.
* **📍 GPS Auto-Tagging:** Accurate latitude/longitude coordinates captured automatically via HTML5 Geolocation API, avoiding manual address entry issues.
* **⚡ Spatial Routing (PostGIS):** Automatically maps the coordinates of the grievance to the exact municipal ward boundary using `ST_Within` polygon queries, auto-assigning the correct department and officer.
* **🔍 Smart Deduplication:** Features a geohash pre-filter and Haversine distance calculator to detect nearby matching open issues (e.g., the same broken water main reported by 10 people), automatically linking them as child tickets under one "Master Ticket" to avoid resource wastage.
* **🔑 Frictionless Mock OTP Auth:** Supabase Phone OTP-based login which prints the OTP directly to the developer terminal for zero-cost, quick local testing.
* **🔒 RLS & Tenant Isolation:** Secure database isolation per city (Delhi/Ghaziabad) using PostgreSQL Row-Level Security policies.
* **🔄 Keep-Alive Cron Engine:** Includes a GitHub Actions automation workflow that pings the database every 5 days to prevent Supabase's free-tier project suspension.

---

## 🛠️ Zero-Cost Technical Stack

AwazDo is architected to run entirely on industry-grade free tiers to enable zero-investment pilot deployment:

| Layer | Technology | Key Benefits |
| --- | --- | --- |
| **Frontend Hosting** | Cloudflare Pages | Unlimited bandwidth, commercial use allowed. |
| **Database & Storage** | Supabase | Free PostgreSQL 16 + PostGIS + Blob Storage + Auth. |
| **Caching** | Upstash Redis | 500,000 commands/month free. |
| **Maps** | Leaflet.js + OpenStreetMap | No API keys required, completely free tile-map rendering. |
| **CI/CD & Keep-Alive** | GitHub Actions | Unlimited minutes for public repositories. |
