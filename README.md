# MediCare AI+

> Real-time IoT health monitoring, EHR management, ML risk prediction, and AI-powered patient care — all in one platform.

---

## Overview

MediCare AI+ is a full-stack healthcare platform built with Next.js 16, Convex, and a pretrained ML risk engine. It connects ESP32 wearable sensors to a live dashboard, giving patients, doctors, hospitals, and admins a unified view of health data with sub-5-second emergency alerting.

---

## Features

### Patient
- **Live Vitals** — Real-time heart rate and SpO₂ streamed from ESP32 via Blynk webhooks
- **ML Risk Score** — Logistic regression model predicts Low / Medium / High risk from vitals + conditions
- **AI Health Chatbot** — Personalised answers using Gemini / OpenAI, grounded in the patient's own EHR
- **Lab Report Upload** — Upload PDF or image reports; AI summarises them in plain English
- **Medication Tracker** — Track active medications, log taken/missed doses, view adherence rate
- **Prescriptions** — View prescriptions issued by doctors with print support
- **Appointments** — Book appointments with doctors, choose date/time/type (in-person, video, phone)
- **Consultations** — Real-time chat with assigned doctor, image sharing, receive prescriptions in-chat
- **Emergency Dashboard** — View active and historical emergency alerts
- **Health Records (EHR)** — View and edit medical history, allergies, medications, emergency contact

### Doctor
- **Patient Overview** — See all assigned patients with risk labels and base vitals
- **Consultations** — Real-time chat with patients, send prescriptions inline
- **Write Prescription** — Full prescription writer with drug search (2,000 Indian medications), lab test ordering
- **Appointments** — Confirm, cancel, and complete patient appointments
- **Emergency Alerts** — Acknowledge and resolve active emergencies
- **Lab Reports** — View patient-uploaded reports and AI summaries

### Hospital Admin
- **Staff Management** — View all doctors assigned to the hospital
- **Patient Overview** — See all patients with risk levels
- **Emergency Dashboard** — Monitor active emergencies across the hospital

### Platform Admin
- **User Approvals** — Approve or reject hospital and doctor registrations with expandable profiles
- **User Management** — View all users by role, delete accounts
- **Platform Settings** — Configure emergency thresholds, notification preferences, view audit log
- **Global Search** — Cmd+K search across patients, users, and pages

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16.2.1 (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS 4, Framer Motion |
| Backend / DB | Convex (real-time, serverless) |
| Auth | bcryptjs (12 rounds), session storage + HTTP-only cookies |
| ML Model | Logistic Regression (multinomial, 12 features, ~87.4% accuracy) |
| AI Chatbot | Google Gemini 1.5 Flash / OpenAI GPT-3.5-turbo (with mock fallback) |
| IoT | ESP32 + MAX30102 sensor → Blynk → webhook |
| Charts | Recharts |
| Icons | Lucide React |
| PWA | next-pwa |

---

## ML Risk Engine

The ML model runs at `/api/ml/predict` and is called automatically whenever sensor data arrives.

**Architecture:** Multinomial Logistic Regression with feature engineering  
**Accuracy:** ~87.4% on held-out test set  
**Classes:** Low (0–35%), Medium (35–70%), High (70–100%)

### Features (12 total)
| Feature | Description |
|---|---|
| `hr_norm` | Heart rate normalised to [0,1] over range 40–180 BPM |
| `spo2_norm` | SpO₂ normalised to [0,1] over range 80–100% |
| `age_norm` | Age normalised to [0,1] over range 0–100 years |
| `hr_high` | Binary: HR > 100 BPM |
| `hr_low` | Binary: HR < 60 BPM |
| `spo2_low` | Binary: SpO₂ < 95% |
| `has_diabetes` | Binary: patient has diabetes |
| `has_copd` | Binary: patient has COPD / asthma / pulmonary condition |
| `has_hypertension` | Binary: patient has hypertension |
| `has_cardiac` | Binary: patient has cardiac / atrial condition |
| `hr_spo2_interaction` | `hr_norm × (1 − spo2_norm)` — captures combined stress |
| `age_risk_factor` | `age_norm × avg(condition flags)` — age-weighted comorbidity |

### Clinical Override Rules
Hard rules applied after softmax to enforce clinical safety:
- SpO₂ < 90% or HR > 130 or HR < 45 → **Force High** (85% probability)
- SpO₂ < 93% with COPD or cardiac condition → **High** (80%)
- SpO₂ < 93% with HR > 100 → **High** (75%)
- SpO₂ ≥ 97% and HR 60–90 → **Boost Low**

### Example Predictions
```
Patient: Rajesh Kumar (COPD, Hypertension, Atrial Fibrillation)
  HR: 105 BPM  |  SpO₂: 91%  |  Age: 60
  → High Risk  |  Score: 82%  |  Confidence: 85%

Patient: Ananya Patel (Type 2 Diabetes, Hypertension)
  HR: 88 BPM   |  SpO₂: 94%  |  Age: 45
  → Medium Risk |  Score: 55%  |  Confidence: 91%

Patient: Neal Jain (Asthma)
  HR: 72 BPM   |  SpO₂: 98%  |  Age: 28
  → Low Risk    |  Score: 18%  |  Confidence: 90%
```

---

## Project Structure

```
MediCare AI+/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── login/                      # Login page
│   │   ├── signup/                     # Multi-step registration
│   │   ├── forgot-password/            # Password reset
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              # Auth guard + sidebar
│   │   │   ├── page.tsx                # Role-based overview
│   │   │   ├── vitals/                 # Live vitals charts
│   │   │   ├── chat/                   # AI health chatbot
│   │   │   ├── emergency/              # Emergency alerts
│   │   │   ├── appointments/           # Appointment booking
│   │   │   ├── medications/            # Medication tracker
│   │   │   ├── consultation/           # Patient ↔ doctor chat
│   │   │   ├── consultations/          # Doctor consultation view
│   │   │   ├── prescriptions/          # View prescriptions
│   │   │   ├── prescriptions/write/    # Write prescription (doctor)
│   │   │   ├── reports/                # Lab report upload + AI summary
│   │   │   ├── records/                # EHR viewer/editor
│   │   │   ├── patients/               # Patient list (doctor/hospital)
│   │   │   ├── admin/                  # Approval panel (admin)
│   │   │   ├── users/                  # User management (admin)
│   │   │   ├── staff/                  # Staff list (hospital)
│   │   │   ├── profile/                # User profile + password change
│   │   │   ├── settings/               # Platform settings (admin)
│   │   │   └── seed/                   # Database seeding UI
│   │   └── api/
│   │       ├── auth/login/             # POST: login with rate limiting
│   │       ├── auth/register/          # POST: registration
│   │       ├── chat/                   # POST: AI chatbot (Gemini/OpenAI)
│   │       ├── ml/predict/             # POST: ML risk prediction
│   │       ├── reports/summarise/      # POST: NLP report summarisation
│   │       ├── seed/                   # GET: seed users
│   │       ├── seed-drugs/             # GET: seed drug + lab test DB
│   │       └── webhooks/blynk/         # POST: IoT sensor data ingestion
│   └── components/
│       ├── Navbar.tsx                  # Sidebar + mobile nav
│       ├── NotificationCenter.tsx      # Bell icon + notification panel
│       ├── GlobalSearch.tsx            # Cmd+K search
│       └── ConvexClientProvider.tsx    # Convex React provider
├── convex/
│   ├── schema.ts                       # Full database schema
│   ├── users.ts                        # User CRUD + approvals
│   ├── patients.ts                     # Patient data + sensor ingestion
│   ├── medications.ts                  # Medication tracker + adherence
│   ├── prescriptions.ts                # Prescriptions + drug/lab search
│   ├── consultations.ts                # Doctor-patient chat
│   ├── appointments.ts                 # Appointment booking + slots
│   ├── emergency.ts                    # Emergency event management
│   ├── notifications.ts                # Notification system
│   ├── reports.ts                      # Lab report storage
│   ├── chat.ts                         # AI chat message history
│   └── seed.ts                         # Comprehensive data seed
├── esp32_firmware/
│   └── medicare_sensor.ino             # ESP32 + MAX30102 firmware
├── medication names/DATA/
│   └── indian_medicine_data.json       # 2,000+ Indian drug database
└── public/
    └── manifest.json                   # PWA manifest
```

---

## Database Schema

| Table | Description |
|---|---|
| `users` | All users (admin, hospital, doctor, patient) with RBAC |
| `patients` | Patient EHR — demographics, vitals, history, allergies |
| `sensorData` | Time-series IoT readings (HR, SpO₂, ML score) |
| `chatMessages` | AI chatbot conversation history per patient |
| `reports` | Uploaded lab reports with AI summaries |
| `medications` | Active/inactive medication records |
| `medicationLogs` | Taken/missed dose logs for adherence tracking |
| `notifications` | In-app notifications per user |
| `drugDatabase` | 2,000 Indian medications (searchable) |
| `labTestsCatalog` | 40+ lab tests with categories and prep instructions |
| `prescriptions` | Doctor-issued prescriptions with medications + lab tests |
| `consultations` | Doctor-patient consultation sessions |
| `consultationMessages` | Messages within consultations (text, image, prescription) |
| `appointments` | Appointment bookings with status tracking |
| `doctorAvailability` | Doctor's available time slots per day of week |
| `emergencyEvents` | Emergency alerts with severity, status, and resolution |

---

## API Reference

### `POST /api/ml/predict`
Run the ML risk prediction model.

**Request:**
```json
{
  "heartRate": 105,
  "bloodOxygen": 91,
  "age": 60,
  "conditions": ["COPD", "Hypertension"]
}
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "riskLabel": "High",
    "riskScore": 0.82,
    "riskPercent": 82,
    "probabilities": { "low": 5, "medium": 15, "high": 80 },
    "confidence": 80,
    "explanation": [
      "Elevated heart rate (105 BPM > 100 BPM normal upper limit)",
      "Low SpO₂ (91% < 95% normal lower limit)",
      "COPD/respiratory condition affects oxygen saturation"
    ]
  },
  "model": {
    "name": "MediCare ML Risk Engine v2.1",
    "type": "Logistic Regression (Multinomial)",
    "features": 12,
    "accuracy": "87.4%"
  }
}
```

### `PUT /api/ml/predict`
Batch prediction for multiple patients.

**Request:**
```json
{
  "patients": [
    { "id": "p1", "heartRate": 72, "bloodOxygen": 98, "age": 28, "conditions": ["Asthma"] },
    { "id": "p2", "heartRate": 105, "bloodOxygen": 91, "age": 60, "conditions": ["COPD"] }
  ]
}
```

### `POST /api/webhooks/blynk`
Ingest sensor data from ESP32 via Blynk. Automatically runs ML prediction.

**Request:**
```json
{ "patientId": "<convex_id>", "heartRate": 88, "spo2": 94, "age": 45 }
```

### `POST /api/chat`
AI health chatbot. Uses Gemini if `GEMINI_API_KEY` is set, otherwise OpenAI, otherwise mock.

### `POST /api/auth/login`
Rate-limited login (5 attempts / 15 min per IP). Returns role cookie.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Convex](https://convex.dev) account
- (Optional) Gemini or OpenAI API key for the AI chatbot

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create `.env.local`:
```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=dev:your-project
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-project.convex.site

# Optional — AI chatbot (uses mock fallback if not set)
GEMINI_API_KEY=your_gemini_key
# or
OPENAI_API_KEY=your_openai_key
```

### 3. Start Convex
```bash
npx convex dev
```

### 4. Start Next.js
```bash
npm run dev
```

### 5. Seed the database

**Option A — Dashboard UI** (recommended):  
Visit [http://localhost:3000/dashboard/seed](http://localhost:3000/dashboard/seed) after logging in as admin.

**Option B — API:**
```bash
# Seed users, patients, sensor data, medications, appointments
curl http://localhost:3000/api/seed

# Seed 2,000 Indian medications + 40 lab tests
curl http://localhost:3000/api/seed-drugs
```

**Option C — Convex CLI:**
```bash
npx convex run seed
```

### 6. Log in

| Role | Email | Password |
|---|---|---|
| Admin | nealmanawat@gmail.com | *(see .env or ask admin)* |
| Admin | admin@admin.com | *(see .env or ask admin)* |
| Hospital | hospital@citygeneral.com | *(see .env or ask admin)* |
| Doctor | dr.sharma@medicare.ai | *(see .env or ask admin)* |
| Doctor | dr.patel@medicare.ai | *(see .env or ask admin)* |
| Doctor | dr.desai@medicare.ai | *(see .env or ask admin)* |

---

## IoT Setup (ESP32)

The firmware in `esp32_firmware/medicare_sensor.ino` reads heart rate and SpO₂ from a MAX30102 sensor and sends data to Blynk, which forwards it to `/api/webhooks/blynk`.

**Flow:**
```
ESP32 + MAX30102 → Blynk Cloud → POST /api/webhooks/blynk → ML Prediction → Convex DB → Live Dashboard
```

Configure in the firmware:
```cpp
#define BLYNK_TEMPLATE_ID   "your_template_id"
#define BLYNK_AUTH_TOKEN    "your_auth_token"
#define PATIENT_ID          "your_convex_patient_id"
```

---

## Security

- Passwords hashed with **bcrypt** (12 rounds) — never stored in plain text
- **Rate limiting** on login: 5 attempts per 15 minutes per IP
- **Role-based access control** — middleware enforces role cookies on all dashboard routes
- **Session timeout** — 15 minutes of inactivity auto-logs out
- **Approval gating** — hospitals and doctors require admin approval before login
- Input validation on all API routes

---

## Sample Data

After seeding, the database contains:

| Type | Count | Details |
|---|---|---|
| Users | 7 | 2 admins, 2 hospitals, 3 doctors |
| Patients | 5 | Varying risk levels (Low / Medium / High) |
| Sensor readings | 240 | 48 readings per patient over 24 hours |
| Emergency events | 2 | 1 active (red), 1 acknowledged (amber) |
| Medications | 3 | With 7 days of adherence logs |
| Prescriptions | 1 | Issued with medications + lab tests |
| Appointments | 2 | 1 confirmed, 1 pending |
| Chat messages | 3 | AI assistant conversation for Neal Jain |
| Notifications | 2 | Emergency alert + appointment confirmation |
| Drugs in DB | 2,000 | Indian allopathy medications |
| Lab tests | 40+ | Blood, urine, imaging, cardiac, pulmonary |

---

## License

MIT
