# ProSource CRM v2.0.0

A professional, multi-tenant, cloud-enabled CRM solution designed for sourcing businesses, trading companies, and various industries. Built with Electron, React, and Supabase for desktop-first, offline-capable operations with cloud synchronization.

## 🚀 Overview

ProSource CRM is a **SaaS-ready** Customer Relationship Management system that combines the power of local-first desktop applications with cloud synchronization. It's designed to be versatile across multiple industries while maintaining data security and team collaboration capabilities.

### Key Highlights
- **Desktop-First**: Runs as a native Electron application on Windows, macOS, and Linux
- **Offline-Capable**: Full functionality works offline with automatic sync when online
- **Multi-Tenant**: Support for multiple companies with complete data isolation
- **Industry-Adaptive**: Dynamic configuration for different business types
- **Team Collaboration**: Role-based access control (Admin, Employee)
- **Cloud Backup**: Encrypted backups with restore capabilities
- **Real-Time Sync**: Automatic synchronization with last-write-wins conflict resolution

---

## 📋 Phase Roadmap

### Phase 0: Foundation & Blank Screen Fix ✅
**Status**: Complete

Fixed critical issue where the CRM showed a blank screen after installation.

**Changes**:
- Updated Vite configuration to use relative base paths (`base: './'`)
- Switched from Browser Router to Hash Router for Electron compatibility
- Normalized file paths in Electron main process
- Updated UI components to work with hash-based routing

**Files Modified**:
- `vite.config.ts`: Added relative base path
- `electron/main.ts`: Improved file loading for production
- `client/src/App.tsx`: Integrated HashRouter
- `client/src/components/`: Updated all routing references

---

### Phase 1: Dynamic Onboarding & Industry Versatility ✅
**Status**: Complete

Transformed ProSource into a versatile CRM that adapts to different industries.

**Features**:
- **10+ Industry Profiles**: Sourcing, Real Estate, Healthcare, Finance, Retail, Education, Professional Services, Manufacturing, Fitness, Nonprofits
- **Dynamic Terminology**: Industry-specific terminology for all modules
  - "Clients" → "Buyers & Sellers" (Real Estate)
  - "Products" → "Properties" (Real Estate)
  - "Leads" → "Inquiries" (Real Estate)
  - "Invoices" → "Commission Invoices" (Real Estate)
- **Onboarding Wizard**: First-time setup with industry selection
- **Settings Integration**: Change industry anytime from Settings page

**New Files**:
- `client/src/services/industries.ts`: Industry profile definitions
- `client/src/components/OnboardingWizard.tsx`: Setup wizard UI

**Modified Files**:
- `client/src/App.tsx`: Integrated onboarding flow
- `client/src/components/Sidebar.tsx`: Dynamic module filtering
- `client/src/pages/Settings.tsx`: Industry selection UI

---

### Phase 2: Role-Based Access Control (RBAC) & User Management ✅
**Status**: Complete

Transformed ProSource from a single-user tool into a team collaboration platform.

**Features**:
- **Multi-User Authentication**: Secure login system with JWT sessions
- **Role-Based Access**:
  - **Super Admin**: Full access to all features (you, the owner)
  - **Admin**: Company-level admin with team management
  - **Employee**: Restricted access (no financial data, no settings)
- **User Management**: Admin page to create, edit, and remove employees
- **Session Management**: Persistent login with logout capability
- **Route Protection**: Unauthorized access prevention

**New Files**:
- `client/src/hooks/useAuth.ts`: Authentication state management
- `client/src/components/Login.tsx`: Login UI
- `client/src/pages/UserManagement.tsx`: Team management page

**Modified Files**:
- `client/src/contexts/AppContext.tsx`: Added auth context
- `client/src/components/Sidebar.tsx`: Admin-only module filtering
- `client/src/pages/Dashboard.tsx`: Hidden financial stats for employees

---

### Phase 3: Cloud Sync & Backup System ✅
**Status**: Complete

Implemented comprehensive cloud synchronization and backup infrastructure.

#### Phase 3.1: Multi-Tenant Backend Architecture
**Status**: Complete

- **Supabase Integration**: Multi-tenant database with Row-Level Security (RLS)
- **Database Schema**: Organizations, Users, CRM data tables with tenant isolation
- **tRPC API Endpoints**:
  - `sync.pushChanges`: Upload local changes to cloud
  - `sync.pullChanges`: Fetch cloud changes
  - `sync.getStatus`: Real-time sync status
  - `backup.createBackup`: Encrypted backup creation
  - `backup.listBackups`: List all backups
  - `backup.restoreBackup`: Admin-only restore

**New Files** (Backend):
- `server/routers/sync.ts`: Sync operations
- `server/routers/backup.ts`: Backup/restore operations
- `server/_core/supabase.ts`: Supabase client initialization
- `supabase/migrations/001_multi_tenant_schema.sql`: Database schema

#### Phase 3.2: Desktop App Integration & Sync Service
**Status**: Complete

- **Sync Service**: IndexedDB-based queue with automatic sync every 30 seconds
- **Conflict Resolution**: Last-write-wins strategy
- **Offline-First**: Full functionality without internet
- **Sync Status Indicator**: Real-time status in sidebar
- **Backup Controls**: One-click backup creation in Settings

**New Files**:
- `client/src/services/syncService.ts`: Sync queue and management
- `client/src/components/SyncStatusIndicator.tsx`: Status display in sidebar
- `client/src/services/alertService.ts`: Admin notification system
- `client/src/components/NotificationPanel.tsx`: Alert display in topbar

**Modified Files**:
- `client/src/components/Sidebar.tsx`: Added sync status indicator
- `client/src/pages/Settings.tsx`: Added backup controls

#### Phase 3.3: Admin Alerts, Employee Management & Backup Modal
**Status**: Complete

**Features**:

1. **Admin Alerts System**
   - Notifications for sync failures, backup completion, restore triggers
   - Persistent alert history (7-day retention)
   - Unread count badge in topbar
   - Mark as read, delete alerts

2. **Employee Management UI**
   - Full team member management interface
   - Role assignment (Admin/Employee)
   - CSV bulk import for employees
   - Team statistics dashboard
   - Admin-only access from Settings

3. **Backup List Modal**
   - View all cloud backups with metadata
   - Download, restore, and delete backups
   - Backup creation date, file size, encryption status
   - Restore confirmation to prevent data loss

**New Files**:
- `client/src/pages/EmployeeManagement.tsx`: Team management page
- `client/src/components/BackupListModal.tsx`: Backup list and management

**Modified Files**:
- `client/src/components/Topbar.tsx`: Added notification panel
- `client/src/pages/Settings.tsx`: Integrated backup modal and team link
- `client/src/App.tsx`: Added employee management route

---

## 🏗️ Architecture

### Desktop Application (Electron + React)
```
client/
├── src/
│   ├── pages/              # Page components
│   ├── components/         # Reusable UI components
│   ├── services/           # Business logic (sync, alerts, industries)
│   ├── contexts/           # React contexts (AppContext, ThemeContext)
│   ├── hooks/              # Custom hooks (useAuth, useSettings, useLeads, etc.)
│   └── App.tsx             # Main app with routing
├── public/                 # Static assets
└── index.html              # HTML entry point
```

### Backend (tRPC + Supabase)
```
server/
├── routers/                # tRPC procedure definitions
│   ├── sync.ts             # Cloud sync endpoints
│   └── backup.ts           # Backup/restore endpoints
├── _core/                  # Core infrastructure
│   ├── supabase.ts         # Supabase client
│   ├── context.ts          # tRPC context
│   └── trpc.ts             # tRPC setup
└── db.ts                   # Database queries
```

### Data Flow
```
Local Changes (IndexedDB)
    ↓
Sync Queue Service
    ↓
Online Detection
    ↓
Push to Cloud (tRPC)
    ↓
Supabase (Multi-Tenant)
    ↓
Pull Changes
    ↓
Apply to Local IndexedDB
    ↓
UI Updates
```

---

## 🔐 Security Features

### Data Isolation
- **Row-Level Security (RLS)**: Supabase enforces tenant boundaries
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Admin/Employee permissions

### Backup Security
- **AES-256 Encryption**: All backups encrypted before upload
- **S3 Storage**: Secure cloud storage with presigned URLs
- **Access Control**: Admin-only restore capability

### Session Management
- **Persistent Login**: Secure session storage
- **Logout Capability**: Clear sessions on logout
- **Token Expiration**: Automatic session cleanup

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm package manager
- Supabase account (for cloud sync)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/rahadsakib1234-boop/ProSource-V2.git
cd ProSource-V2
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run development server**
```bash
pnpm run dev
```

5. **Build for production**
```bash
pnpm run build:web
pnpm run build:electron
```

---

## 📦 Features by Phase

### Phase 0: Foundation
- ✅ Fixed blank screen issue
- ✅ Hash-based routing for Electron
- ✅ Relative asset paths

### Phase 1: Versatility
- ✅ 10+ industry profiles
- ✅ Dynamic terminology
- ✅ Onboarding wizard
- ✅ Settings-based configuration

### Phase 2: Team Collaboration
- ✅ Multi-user authentication
- ✅ Role-based access control
- ✅ User management UI
- ✅ Session management

### Phase 3: Cloud & Backup
- ✅ Multi-tenant Supabase backend
- ✅ Real-time sync service
- ✅ Encrypted backups
- ✅ Admin alerts system
- ✅ Employee management
- ✅ Backup list modal

---

## 🛠️ Development

### Project Structure
```
prosource-v2/
├── client/                 # React frontend
├── electron/               # Electron main process
├── server/                 # tRPC backend (if using web version)
├── drizzle/                # Database schema
├── vite.config.ts          # Vite configuration
├── electron-builder.yml    # Electron build config
└── package.json            # Dependencies and scripts
```

### Available Scripts
```bash
pnpm run dev              # Start development server
pnpm run build:web        # Build web assets
pnpm run build:electron   # Build Electron app
pnpm run test             # Run tests
pnpm run format           # Format code
```

---

## 📊 Database Schema

### Core Tables
- **organizations**: Company information and settings
- **users**: User accounts with roles and permissions
- **clients**: Customer/client records
- **products**: Product/service catalog
- **leads**: Sales leads and quotes
- **invoices**: Invoice records
- **sync_queue**: Pending changes for sync
- **backups**: Backup metadata and encryption keys
- **audit_logs**: Activity tracking

### Tenant Isolation
All tables include `tenant_id` field for multi-tenant isolation via RLS policies.

---

## 🔄 Sync Mechanism

### How Sync Works
1. **Local Changes**: User makes changes in the app (stored in IndexedDB)
2. **Queue**: Changes added to sync queue with timestamp
3. **Online Detection**: App detects internet connection
4. **Push**: Queued changes pushed to cloud via tRPC
5. **Conflict Resolution**: Last-write-wins strategy applied
6. **Pull**: Cloud changes fetched back to local
7. **Apply**: Changes merged into local IndexedDB
8. **UI Update**: React components re-render with new data

### Sync Status Indicators
- 🟢 **Synced**: All changes synced to cloud
- 🟡 **Pending**: Changes waiting to sync
- 🔴 **Failed**: Sync error occurred
- ⚫ **Offline**: No internet connection
- 🔄 **Syncing**: Currently syncing

---

## 🎯 Use Cases

### Sourcing & Trading
- Manage suppliers and buyers
- Track product catalogs
- Quote management
- Currency conversion
- Invoice tracking

### Real Estate
- Property listings
- Buyer/seller management
- Commission tracking
- Property inquiries
- Deal pipeline

### Healthcare
- Patient management
- Care plan tracking
- Appointment scheduling
- Medical records

### Finance & Insurance
- Policy holder management
- Financial products
- Claims tracking
- Customer interactions

### Retail & E-commerce
- Customer management
- Product catalog
- Order tracking
- Sales pipeline

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub or contact the development team.

---

## 🎉 Acknowledgments

Built with:
- **Electron**: Desktop application framework
- **React 19**: UI framework
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Supabase**: Backend and database
- **tRPC**: Type-safe API
- **IndexedDB**: Local storage

---

## 📈 Roadmap

### Future Enhancements
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] AI-powered lead scoring
- [ ] Email integration
- [ ] WhatsApp integration
- [ ] Payment processing (Stripe)
- [ ] Custom workflows
- [ ] API marketplace
- [ ] White-label solution

---

## Version History

### v2.0.0 (Current)
- Complete Phase 0-3 implementation
- Multi-tenant cloud architecture
- Team collaboration features
- Cloud backup system
- Admin alerts and notifications

### v1.0.0
- Initial desktop CRM release
- Local-only storage
- Single-user support

---

**Last Updated**: May 2026  
**Maintained By**: ProSource Development Team  
**Status**: Production Ready
