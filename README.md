# 🌱 AgriAI — AI-Enabled Agricultural Data Analytics Platform for Crop Yield Prediction

A full-stack agricultural data analytics platform for Tamil Nadu, providing district-personalized
rainfall, soil, and crop insights built entirely on **historical data, transparent rule-based
analytics, and scenario simulation** — not machine learning.

---

## 📖 Project Overview

AgriAI helps farmers, researchers, and government officials explore historical agricultural data
(rainfall, soil composition, crop yield, production) for districts across Tamil Nadu, and run
transparent "what-if" climate scenarios to understand potential impacts on crop yield.

Although the project title references "Crop Yield Prediction," the platform **deliberately does
not use any machine learning model** (no Random Forest, Decision Tree, Linear Regression, CNN, or
any trained model). All estimation is done through documented, rule-based arithmetic on real
historical MongoDB records. Every derived result is clearly labeled as either:

- **"Historical Yield"** — a real recorded value from the dataset, or
- **"Analytics-Based Estimate"** — a rule-based calculation (e.g. Soil Health Score), or
- **"Scenario Simulation"** — a transparent what-if adjustment (e.g. Climate Simulator)

No confidence scores are ever fabricated.

## 🎯 Problem Statement

Farmers and agricultural planners often lack easy access to consolidated historical data on
rainfall, soil health, and crop performance for their specific district. Existing tools are either
too generic (state/national-level only) or require technical expertise to interpret raw datasets.

## 🎯 Objectives

- Provide **district-personalized** agricultural dashboards driven entirely by real MongoDB data.
- Allow administrators to **upload, validate, and import** Excel/CSV agricultural datasets.
- Offer **transparent, rule-based analytics** (soil health scoring, scenario simulation) instead of
  opaque ML predictions.
- Provide a **GPS-based location detector** for automatic district identification and insights.
- Include an **AI Farming Assistant** that works with or without an external AI API key.

## ✨ Features

- Separate **User** and **Admin** login experiences with JWT authentication and bcrypt password hashing
- Role-based access control (users cannot access admin pages, and vice versa)
- Professional **registration modal** with mandatory district selection
- **District-personalized dashboard** — automatically filtered to the user's registered district
- **GPS "Detect My Location"** button (only triggers on explicit click) with a Leaflet map and
  offline district-boundary matching (or a real reverse-geocoding API, if configured server-side)
- **Historical Analytics** with Line, Bar, Area, and Donut charts across Rainfall, Crop Yield,
  Production, Temperature, Humidity, and Soil tabs
- **Crop Analytics** with crop/district/year comparison
- **Rainfall Analytics** with year-wise and district-wise breakdowns
- **Soil Health** scoring (Analytics-Based Estimate, not ML)
- **Climate Change Simulator** — rule-based what-if scenario tool (Scenario Simulation)
- **AI Farming Assistant** — grounded in real MongoDB data; works with a rule-based fallback if no
  AI API key is configured
- **Prediction / Scenario History** — every simulation you run is saved and viewable later
- **Reports** — export PDF and CSV summaries
- **Admin Dataset Upload** — Excel/CSV → Backend → Parse → Validate → Preview → Import → MongoDB,
  with detection of missing districts/crops, invalid years, invalid rainfall, duplicates, and
  invalid numeric values
- **Admin Dashboard** with platform-wide stats, user management, and upload history

## 🧠 Innovation

The core innovation is **automatic district personalization**: the moment a user registers with a
district (e.g. Coimbatore), their dashboard, filters, and Smart Agri Insight automatically scope to
that district's historical rainfall, soil, and crop data — no manual filtering required. Combined
with the transparent, ML-free analytics approach, the platform stays fully explainable end-to-end.

## 🛠 Technology Stack

**Frontend:** React, Vite, React Router, Axios, Recharts, Leaflet / React Leaflet, modern CSS
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Multer, XLSX, csv-parser
**Database:** MongoDB (local or Atlas)

## 🏗 Architecture

```
Browser (React + Vite SPA)
        │  Axios (JWT Bearer token)
        ▼
Express REST API (Node.js)
        │  Mongoose ODM
        ▼
MongoDB (Users, AgriculturalData, UploadHistory, LocationHistory, Scenario)
```

The AI Farming Assistant and Climate Simulator both retrieve real records from MongoDB first, then
either forward that context to an AI API (if `ANTHROPIC_API_KEY` is set) or fall back to a
deterministic rule-based response generator — the app is fully functional either way.

## 📁 Folder Structure

```
AI-Agri-Analytics/
│
├── client/                     # React + Vite frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── components/         # Sidebar, Topbar, StatCard, FiltersBar, RegisterModal, etc.
│       ├── pages/               # UserLogin, AdminLogin, Dashboard, Analytics pages, admin/*
│       ├── services/            # api.js, authService.js, agriService.js
│       ├── layouts/             # DashboardLayout
│       ├── context/             # AuthContext
│       ├── App.jsx
│       ├── App.css
│       ├── main.jsx
│       └── index.css
│
├── server/                      # Node/Express backend
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   ├── config/db.js
│   ├── controllers/             # auth, dashboard, agriculture, analytics, admin, location, ai, simulation, history
│   ├── models/                  # User, AgriculturalData, UploadHistory, LocationHistory, Scenario
│   ├── routes/
│   ├── middleware/              # auth (JWT + role), upload (Multer), errorHandler
│   ├── services/                # analyticsService (rule-based), aiService, excelService
│   ├── utils/                   # validators, districtGeocode
│   ├── seed/seedData.js
│   └── uploads/                 # runtime file storage (gitignored)
│
├── README.md
└── .gitignore
```

## 🗄 MongoDB Setup

**Option A — Local MongoDB**

Install MongoDB Community Server and ensure it's running on `mongodb://127.0.0.1:27017`.

**Option B — MongoDB Atlas**

Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), create a database
user, allow your IP, and copy the connection string.

## 🔑 Environment Variables

**server/.env** (copy from `server/.env.example`):

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://127.0.0.1:27017/agri_analytics
# or: mongodb+srv://<user>:<password>@cluster0.mongodb.net/agri_analytics

JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d

ADMIN_EMAIL=admin@agriai.com
ADMIN_PASSWORD=Admin@123

# Optional — leave blank to use the rule-based AI fallback
ANTHROPIC_API_KEY=

CLIENT_URL=http://localhost:5173

# Optional — leave blank to use the offline district-boundary matcher
GEOCODING_API_KEY=
```

**client/.env** (copy from `client/.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

> Never commit a real `.env` file. Only `.env.example` files (with placeholder values) are
> included in this project.

## 💻 Backend Installation

```bash
cd server
npm install
cp .env.example .env      # then edit .env with your own values
npm run seed               # optional: loads demo Tamil Nadu district data + admin account
npm run dev                 # starts the API on http://localhost:5000
```

## 💻 Frontend Installation

```bash
cd client
npm install
cp .env.example .env
npm run dev                 # starts the app on http://localhost:5173
```

## ▶️ How to Run (Full Stack)

1. Start MongoDB (local service or confirm your Atlas cluster is reachable).
2. In one terminal: `cd server && npm install && npm run seed && npm run dev`
3. In a second terminal: `cd client && npm install && npm run dev`
4. Open `http://localhost:5173` in your browser.

## 🔐 Admin Login Setup

Running `npm run seed` in `server/` automatically creates a default admin account using the
`ADMIN_EMAIL` / `ADMIN_PASSWORD` values from your `.env` file (defaults:
`admin@agriai.com` / `Admin@123`). Change these before any real deployment. Log in via the
**"Login as Admin"** toggle on the login screen.

## 👤 User Registration

Click **"Register Here"** on the login page. District selection is mandatory — it's what powers
the automatic dashboard personalization. Fill in name, email, mobile, password, state, district,
village/town, preferred language, and user type, then submit. You'll be logged in immediately.

## 📤 Dataset Upload (Admin)

1. Log in as admin → **Dataset Upload**.
2. Select a `.xlsx`, `.xls`, or `.csv` file and click **Upload & Validate**.
3. Review the Total / Valid / Invalid row counts and the preview tables.
4. Click **Import Valid Records** to save the valid rows to MongoDB. Invalid rows are skipped and
   listed with the reason (missing district/crop, invalid year, invalid rainfall, duplicate, or
   invalid numeric value).

### Excel/CSV Format

Required columns: `year`, `state`, `district`, `crop`, `rainfall`
Optional columns: `season`, `temperature`, `humidity`, `soilType`, `nitrogen`, `phosphorus`,
`potassium`, `ph`, `area`, `production`, `yield`

Column headers are matched case-insensitively and with spaces stripped (e.g. "Soil Type" and
"soiltype" both map correctly).

## 📍 GPS Setup

No external configuration is required by default — the app uses an offline district-boundary
matcher for several Tamil Nadu districts. Location is **only** requested from the browser after
the user explicitly clicks **"Detect My Location"**; there is no background/continuous tracking
unless the user clicks **"Start Location"**, and it can be stopped anytime with **"Stop Location"**.

To use a real reverse-geocoding provider instead, set `GEOCODING_API_KEY` in `server/.env` and
wire up the provider call in `server/controllers/locationController.js` (the integration point is
commented). The API key is never exposed to the frontend.

## 🤖 AI Setup

The AI Farming Assistant works out of the box using a rule-based fallback grounded in real MongoDB
data — no API key required. To enable richer natural-language answers, set `ANTHROPIC_API_KEY` in
`server/.env`. If the AI call fails for any reason, the app automatically falls back to the
rule-based responder so the feature never breaks.

## 📚 API Documentation

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/admin-login` | Admin login | Public |
| GET | `/api/auth/me` | Current user profile | User/Admin |
| GET | `/api/dashboard` | Personalized dashboard cards + insight | User/Admin |
| GET | `/api/agriculture` | Filtered agricultural records | User/Admin |
| GET | `/api/agriculture/filters` | Available filter options | User/Admin |
| GET | `/api/agriculture/district/:district` | Records for a district | User/Admin |
| GET | `/api/analytics/rainfall` | Rainfall analytics | User/Admin |
| GET | `/api/analytics/crop` | Crop analytics | User/Admin |
| GET | `/api/analytics/soil` | Soil health analytics | User/Admin |
| POST | `/api/admin/upload` | Upload + validate a dataset file | Admin |
| POST | `/api/admin/import` | Import validated rows into MongoDB | Admin |
| GET | `/api/admin/users` | List registered users | Admin |
| GET | `/api/admin/uploads` | Upload history | Admin |
| GET | `/api/admin/dashboard` | Admin dashboard cards | Admin |
| POST | `/api/location` | Detect district from lat/lng | User/Admin |
| GET | `/api/location/insights/:district` | Location-based insight | User/Admin |
| POST | `/api/ai/ask` | Ask the AI Farming Assistant | User/Admin |
| POST | `/api/simulation` | Run a climate scenario simulation | User/Admin |
| GET | `/api/history` | Scenario simulation history | User/Admin |

All protected routes require an `Authorization: Bearer <token>` header.

## 🧯 Troubleshooting

- **"MongoDB connection error"** — confirm MongoDB is running locally, or that `MONGO_URI` in
  `server/.env` points to a reachable Atlas cluster and your IP is allowlisted.
- **CORS errors in the browser console** — ensure `CLIENT_URL` in `server/.env` matches the URL
  the frontend is actually running on (default `http://localhost:5173`).
- **"Invalid file format" on upload** — only `.xlsx`, `.xls`, and `.csv` are accepted.
- **Empty dashboard / "No sufficient historical data"** — run `npm run seed` in `server/` to load
  demo data, or upload a dataset as an admin.
- **Location permission denied** — the browser blocked geolocation; check your browser's site
  permissions and retry.
- **AI Assistant always uses rule-based answers** — this is expected unless `ANTHROPIC_API_KEY` is
  set in `server/.env`; the app is designed to work fully either way.

---

*This project was built for academic/college project demonstration purposes. Demo/seed data is
clearly labeled and does not represent verified real-world agricultural statistics.*
