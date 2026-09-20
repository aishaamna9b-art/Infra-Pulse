# 🏛️ Infra-Pulse: Tech for a Better Tomorrow
**HackDay 1.0 Official Submission**

---

## ⚠️ The Problem Statement
In rapidly developing urban areas, the gap between citizens reporting civic issues and the government taking action is widening. 
1. **Accessibility Barriers:** Most reporting apps require typing in English, leaving out non-English speakers, the elderly, and the illiterate.
2. **Dashboard Spam:** Citizens often report the exact same issue (e.g., a broken pipe on Main St.) dozens of times, flooding government portals with duplicate tickets.
3. **Resource Misallocation:** Without automated severity scoring, critical issues (like massive water leaks) are buried beneath minor inconveniences (like uncollected trash).

---

## 💡 The Solution: Infra-Pulse
**Infra-Pulse** is an AI-powered Civic Nervous System designed to bridge the gap between citizens and city officials. 

By leveraging **Gemini AI**, we have automated the most painful parts of civic maintenance: language translation, severity scoring, duplicate filtering, and contractor dispatching.

---

## ✨ Core Features Built

### 1. The Citizen App (Next.js Progressive Web App)
A mobile-first frontend designed for extreme ease-of-use.
* **Multilingual UI:** Real-time English & Tamil translation toggle via a custom React Context provider. No page reloads required.
* **Audio Reporting:** Users who cannot type can record a voice note. The app uses the Web Audio API and Gemini AI to transcribe the audio into a written description.
* **Auto-Geolocation:** Automatically fetches the user's precise GPS coordinates via the browser's Geolocation API.
* **Smart Camera:** Citizens can snap a picture of the damage directly from their phone browser.

### 2. The AI Brain (FastAPI Backend + Gemini AI)
* **Vision Analysis:** Gemini 1.5 Flash analyzes the uploaded image alongside the citizen's description to automatically determine the `damage_type` and assign a `severity` score (LOW, MEDIUM, HIGH).
* **Smart AI Deduplication Engine:** When a new report comes in, the backend calculates its distance from existing open tickets using the Haversine formula. If a matching issue is found within 200 meters, it **clusters** the report into a "Master Ticket" rather than creating a duplicate.

### 3. The Command Center (Streamlit Admin Dashboard)
An enterprise-grade, dark-mode dashboard for government officials to manage city infrastructure.
* **Live Incident Map:** Uses Folium and OpenStreetMap to plot live damage reports without requiring paid Google Maps API keys.
* **Escalated Master Tickets:** The Ticket Management UI strictly filters spam. Only "Master Tickets" that receive **5 or more** citizen complaints are escalated to the top of the dashboard for immediate action.
* **1-Click AI Contractor Dispatch:** Officials can click a single button to have Gemini AI draft a highly professional, context-aware email notice to contractors (including coordinates and severity) to dispatch repair teams instantly.

---

## 🛠️ Technical Architecture & Stack

### Frontend (Citizen)
* **Framework:** Next.js (React)
* **Styling:** Tailwind CSS + Custom Dark Mode UI
* **Features:** PWA (Progressive Web App) Manifest for mobile installation.

### Backend (API Engine)
* **Framework:** FastAPI (Python)
* **Database:** SQLite with SQLAlchemy ORM
* **AI Integration:** Google GenAI SDK (Gemini 1.5 Flash & Gemini 1.5 Pro)

### Government Dashboard
* **Framework:** Streamlit
* **Data Visualization:** Plotly (Interactive Bar Charts) & Folium (Live Maps)
* **State Management:** Streamlit Session State for draft persistence.

---

## 🚀 How to Run the Project Locally

### 1. Start the Backend API
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Start the Citizen App
```bash
cd citizen-app
npm install
npm run dev
```

### 3. Start the Admin Dashboard
```bash
# In the root directory, using the backend virtual environment
.\backend\.venv\Scripts\activate
streamlit run admin_dashboard.py --server.port 8501
```

---
*Built with ❤️ for HackDay 1.0. Think. Build. Innovate.*
