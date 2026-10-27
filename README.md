# Unfazed — Practice Management Platform for Therapists in India

**Unfazed** is a complete, production-grade private practice platform built specifically for mental health professionals (clinical psychologists, psychotherapists, counselors) in India. It empowers therapists to run their independent practice end-to-end—client acquisition, intelligent scheduling across timezones, Razorpay UPI/card payments with automated 18% GST invoicing, HIPAA/APA-grade clinical documentation (SOAP/DAP notes), dynamic intake forms, and practice analytics—through **one branded link** (e.g., `unfazed.in/dr-sharma`).

---

## 🚀 Key Features

1. **Branded Practice Links (`unfazed.in/:slug`)**:
   - Customizable public handle with live uniqueness check (e.g., `unfazed.in/dr-sharma`).
   - RCI licensing badges, clinical bio, educational degrees, language tags, and areas of expertise.
   - Clean OpenGraph & Twitter social cards via `react-helmet-async`.
   - Direct booking QR code for clinic desks and business cards.

2. **Intelligent Scheduling & Calendaring**:
   - `react-big-calendar` therapist schedule view (Month, Week, Day) with appointment status tracking (Confirmed, Completed, Cancelled, No-Show).
   - Client slot picker converted dynamically into local viewer timezone via `date-fns-tz` (supports IST, Gulf GST, SGT, UK, and US timezones for NRI clients).
   - Atomic double-booking prevention and customizable rest buffers (5–30 mins).
   - Automated waitlist capture with notification alerts on cancellations.

3. **Payments & GST Invoicing**:
   - Native Indian payment gateway integration with Razorpay (UPI, Credit/Debit Cards, Netbanking).
   - Realistic Razorpay Test Checkout modal with simulated bank approval and error handling.
   - 18% GST tax calculation with HSN/SAC code `999312`, CGST/SGST split, amount in words, and print-ready PDF invoices.
   - Multi-session treatment packages (3, 6, 12 sessions) with automated package credit redemption during checkout.

4. **Clinical Documentation**:
   - Rich text editor powered by TipTap with formatting controls.
   - Privacy boundary: Strict toggle between **Private Notes** (never exposed to clients) and **Shared Takeaways** (client reflection exercises).
   - Structured **SOAP** (Subjective, Objective, Assessment, Plan) and **DAP** (Data, Assessment, Plan) templates.

5. **Client CRM & Digital Consent**:
   - Filterable, sortable, and searchable client directory with clinical tags and revenue tracking.
   - Legally binding informed consent capture with typed digital signatures and IP timestamp audit logs.
   - Custom drag-and-drop Dynamic Intake Form Builder storing schema in JSON.

6. **Subscription Tiers & Entitlements**:
   - Dynamic tier configuration (`SubscriptionTierConfig`) loaded from the API—no hardcoded prices or tier strings.
   - Central entitlement evaluator gating:
     - Active client caps (Starter / Pro / Premium)
     - Clinical note templates (SOAP/DAP)
     - Session package builders
     - Custom dynamic form builders
     - Deep cohort revenue analytics

---

## 🛠️ Quick Start & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
A `.env` file is included by default:
```env
VITE_API_BASE_URL="http://localhost:5000/api"
VITE_RAZORPAY_KEY_ID="rzp_test_unfazed_demo"
VITE_USE_MOCK="true"
```

### 3. Launch Development Server
```bash
npm run dev
```
The app will run locally on `http://localhost:3000` (or `http://localhost:5173`).

---

## 🔑 Demo Personas & Credentials

You can use the one-click demo persona switchers on `/login` or in the top navigation bar:

| Role | Email | Password | Handle / Profile |
| :--- | :--- | :--- | :--- |
| **Therapist** | `sharma@demo.com` | `Demo@1234` | `unfazed.in/dr-sharma` |
| **Client** | `client@demo.com` | `Demo@1234` | Client Portal (`/portal`) |

---

## 🔄 Switching Between Mock Mode and Real Backend

To switch from the standalone in-memory mock to a live backend:

1. In `.env`, change:
   ```env
   VITE_USE_MOCK="false"
   VITE_API_BASE_URL="https://api.yourdomain.com/api"
   ```
2. The unified API layer (`src/api/index.js`) will immediately route all requests through `axiosInstance.js` with Bearer JWT tokens attached.

### Expected Backend REST Endpoints
- `POST /auth/login` — Authenticate therapist or client
- `POST /auth/register` — Register therapist practice
- `GET /auth/check-slug?slug=:slug` — Live handle availability
- `GET /therapists/:slug` — Retrieve public profile by slug
- `PUT /therapists/:id` — Update therapist practice profile
- `GET /clients` — Paginated, searchable client roster
- `POST /clients` — Add new client record
- `GET /sessions` — Retrieve appointment slots and bookings
- `POST /sessions/book` — Reserve consultation slot
- `GET /availability/slots` — Compute available open slots for date & duration
- `GET /payments` — Practice payment transactions
- `GET /payments/invoice/:id` — GST tax invoice data
- `GET /packages` — Therapy package bundles
- `GET /notes` — Retrieve clinical notes (therapist only)
- `GET /notes/shared/:clientId` — Retrieve shared reflection notes (client only)
- `GET /analytics` — Computed practice financial metrics & attendance rates
- `GET /entitlements/tiers` — Retrieve dynamic subscription tier definitions
- `POST /entitlements/upgrade` — Upgrade therapist subscription tier
- `GET /chats/:conversationId` & `POST /chats/message` — Encrypted chat
