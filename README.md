# ProSource CRM v2

ProSource CRM is a sophisticated local-first desktop CRM designed for sourcing businesses and complex sales workflows. It combines the speed and privacy of local storage with cloud-enhanced capabilities for authentication and AI-driven business intelligence.

## 🚀 Core Concept: Hybrid Local-First Architecture

ProSource CRM employs a hybrid architecture to provide the best of both worlds:
- **Local-First Data**: All core CRM data (clients, leads, products, invoices) is stored locally using **IndexedDB**. This ensures instantaneous load times, offline availability, and maximum data privacy.
- **Cloud-Enhanced Services**: Integration with **Supabase** provides secure authentication, role-based access control, and a powerful bridge to AI services via Edge Functions.

## ✨ Key Features

### 🤖 AI-Powered Intelligence
- **AI Assistant**: An integrated AI companion that can analyze your business data in real-time.
- **Lead Analysis**: Get AI-suggested next steps to close deals based on lead history and pipeline state.
- **Financial Insights**: Automated 2-sentence summaries of business health derived from invoice and client data.
- **Context-Aware Prompting**: The AI is provided with relevant CRM snapshots to give grounded, accurate business advice.

### 💼 Comprehensive CRM Suite
- **Lead & Pipeline Management**: Kanban-style board with drag-and-drop stages and industry-aware labeling.
- **Client & Product Tracking**: Detailed management of your customer base and product catalog.
- **Invoicing & Financials**: Professional invoice tracking with multi-currency support.
- **Industry Blueprints**: Adapt the entire UI and workflow based on the specific business type you are sourcing.

### 👥 Team & Access Control
- **Role-Based Access**: Secure login with distinct permissions for Admin and Employee roles.
- **User Management**: Tools for managing team members and their access levels.

### 💾 Data Sovereignty & Recovery
- **Local Backups**: One-click JSON backup and restore flow to prevent data loss.
- **Flexible Exports**: Export critical data to CSV or generate professional Excel reports.
- **Snapshot Persistence**: Robust local state management ensuring your work is always saved.

## 🛠 Technical Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4 + Lucide React
- **Desktop Shell**: Electron
- **Local Storage**: IndexedDB (via `idb` library)
- **Backend/Auth**: Supabase (PostgreSQL, Auth, Edge Functions)
- **AI Model**: Gemma (accessed via Supabase Edge Functions)

## ⚙️ Setup & Installation

### Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/rahadsakib1234-boop/ProSource-V2.git
   cd ProSource-V2
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Environment Configuration**:
   Copy `.env.example` to `.env` and configure the following:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `GEMMA_API_KEY`: Your API key for the Gemma AI model

4. **Run in development mode**:
   ```bash
   pnpm run dev
   ```

### Production Build
```bash
pnpm run check  # Type check
pnpm run build  # Build web assets
```

## 🚢 Deployment

### Web Deployment
The frontend is configured for Vercel. On push to `main`, GitHub Actions automatically deploy the application.
**Required Vercel Secrets**: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

### AI Assistant Deployment
The AI backend is deployed as a Supabase Edge Function. Use the provided script to deploy:
```bash
pnpm run deploy:ai-assistant
```
**Required Supabase Secret**: `GEMMA_API_KEY`.

## 📝 Important Notes
- **Data Privacy**: Your core business data never leaves your machine unless you explicitly export a backup or interact with the AI assistant.
- **Schema**: The database structure is defined in `SUPABASE_SCHEMA.sql`.
- **Local-First**: If you are using the app in the browser, data is tied to the browser's IndexedDB instance. For a persistent desktop experience, use the Electron build.
