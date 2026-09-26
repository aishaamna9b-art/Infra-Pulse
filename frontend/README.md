# Infra Pulse - Civic Nervous System (Frontend)

Welcome to the new best-in-class, unified frontend for **Infra Pulse**. This repository contains both the Citizen Mobile PWA and the Admin Command Center dashboard, seamlessly integrated into a single Next.js application.

## 🌟 Key Features

### 1. The Citizen Portal (`/citizen`)
- **Mobile-first Design:** Highly responsive interface designed for immediate action.
- **Instant Multilingual Translation:** Switch between English and Tamil instantly without page reloads.
- **Audio Reporting Interface:** Sleek, accessible UI for voice recording.
- **Smart Forms:** Geolocation, camera integration, and AI-ready interfaces.

### 2. The Command Center (`/admin`)
- **Enterprise Dark Mode:** A stunning, low-eye-strain dashboard for extended use by city officials.
- **AI Master Tickets Management:** Clustered "Master Tickets" view for duplicate-filtering.
- **One-Click Dispatch:** Sleek interface for assigning contractors.
- **Real-Time Data Visualization:** Data-dense but clean card layouts for metrics.

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with custom design tokens & glassmorphism
- **Icons:** Lucide React
- **Component Library Architecture:** Custom variants (Shadcn-inspired)

## 🛠️ How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm run dev
   ```

3. **Open the Application:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the main unified portal.

## 📂 Project Structure

- `src/app/page.tsx` - The Unified Portal (Landing Page)
- `src/app/citizen/page.tsx` - Citizen Reporting App
- `src/app/admin/page.tsx` - Admin Command Center Dashboard
- `src/components/ui/` - Reusable, accessible UI components (Buttons, Cards, etc.)
- `src/lib/` - Utilities and helpers
- `src/app/globals.css` - Global styling tokens and Tailwind v4 configuration

---
*Built with ❤️ for a better tomorrow.*
