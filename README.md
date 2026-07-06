# 🇮🇳 AwazDo — अपनी आवाज़ दो
> **"Give your voice to the city / शहर को अपनी आवाज़ दो"**

AwazDo is a **multi-tenant, multi-channel, zero-investment SaaS civic grievance resolution platform** designed specifically for municipal authorities and citizens in India, starting with a pilot in **Delhi (MCD)** and **Ghaziabad (GNN)**. 

It acts as an intelligent routing and accountability layer that connects citizens directly with their ward representatives and local junior engineers.

---

## 🌟 Key Features

- **🌐 Vernacular-First Ingestion**: Fully bilingual UI (Hindi & English) designed to work seamlessly on low-cost mobile screens.
- **📍 GPS Auto-Tagging**: Accurate lat/lng coordinates captured automatically via HTML5 Geolocation API, avoiding manual address entry issues.
- **⚡ Spatial Routing (PostGIS)**: Automatically maps the coordinates of the grievance to the exact municipal ward boundary using `ST_Within` polygon queries, auto-assigning the correct department and officer.
- **🔍 Smart Deduplication**: Features a geohash pre-filter and Haversine distance calculator to detect nearby matching open issues (e.g. the same broken water main reported by 10 people), automatically linking them as child tickets under one "Master Ticket" to avoid resource wastage.
- **🔑 Frictionless Mock OTP Auth**: Supabase Phone OTP-based login which prints OTP directly to the developer terminal for zero-cost, quick local testing.
- **🔒 RLS & Tenant Isolation**: Secure database isolation per city (Delhi/Ghaziabad) using PostgreSQL Row-Level Security policies.
- **🔄 Keep-Alive Cron Engine**: Includes a GitHub Actions automation workflow that pings the database every 5 days to prevent Supabase's free-tier project suspension.

---

## 🛠️ Zero-Cost Technical Stack

AwazDo is architected to run entirely on **industry-grade free tiers** to enable zero-investment pilot deployment:

- **Frontend Hosting**: [Cloudflare Pages](https://pages.cloudflare.com/) (Unlimited bandwidth, commercial use allowed)
- **Database & Storage**: [Supabase](https://supabase.com/) (Free PostgreSQL 16 + PostGIS + Blob Storage + Auth)
- **Caching**: [Upstash Redis](https://upstash.com/) (500,000 commands/month free)
- **Maps**: Leaflet.js + OpenStreetMap (No API keys required, completely free tile-map rendering)
- **CI/CD & Keep-Alive**: GitHub Actions (Unlimited minutes for public repositories)

---

## 📁 Directory Structure

```
awazdo/
├── supabase/
│   ├── schema.sql        # Database tables, triggers, and PostGIS queries
│   ├── seed.sql          # Delhi + Ghaziabad departments, wards, and categories
│   └── keep-alive.yml    # GitHub Actions cron ping workflow
├── src/
│   ├── app/
│   │   ├── [city]/       # City-specific landing dashboards (Delhi/Ghaziabad)
│   │   ├── api/          # Mock Auth, Wards lookup, and Complaints endpoints
│   │   ├── track/        # Grievance search and status timeline pages
│   │   └── globals.css   # Premium dark theme and map style definitions
│   ├── components/
│   │   └── MapView.tsx   # Leaflet dark map renderer
│   └── lib/
│       ├── categories.ts # Category lists with translations and icons
│       └── types.ts      # TypeScript interfaces
└── .env.local.example    # Configuration template
```

---

## 🚀 Quick Local Setup

### 1. Prerequisites
Ensure you have **Node.js 18+** installed.

### 2. Set Up the Project
Clone the repository, enter the directory, and install dependencies:
```bash
cd awazdo
npm install --legacy-peer-deps
```

### 3. Configure Supabase Database
1. Create a free project on [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of `supabase/schema.sql` and run it to initialize all tables, indexes, and PostGIS spatial triggers.
4. Paste the contents of `supabase/seed.sql` and run it to populate mock departments, categories, and wards.

### 4. Configure Environment Variables
Copy the env template:
```bash
cp .env.local.example .env.local
```
Open `.env.local` and enter your project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 How to Test Grievance Submission
1. Select a city from the homepage (e.g. **Delhi**).
2. Click **File a Complaint / शिकायत दर्ज करें**.
3. Select a category (e.g. **Roads & Footpaths / सड़कें और फुटपाथ**) and subcategory.
4. Input details, tap **GPS Auto-Tag** to mock location, and click continue.
5. Input your phone number and request OTP. 
6. **Check your terminal console!** The mock OTP code will print directly in your logs for copy-pasting.
7. Enter the code and submit. You will receive a unique Ticket ID (e.g. `AWZ-2026-48210`) to track.
