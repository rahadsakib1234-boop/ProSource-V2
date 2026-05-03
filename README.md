# ProSource CRM v2

A professional, modern CRM solution for sourcing businesses. Built with React 19, TypeScript, and Electron for desktop deployment.

## Features

- **Dashboard** - Overview of key metrics and recent activity
- **Clients Management** - Manage client relationships and details
- **Products Tracking** - Track products across all clients with sourcing status
- **Leads Pipeline** - Manage quote requests and potential clients
- **Invoice Management** - Professional invoice creation and payment tracking
- **Currency Converter** - Real-time exchange rates and currency conversion
- **Settings** - Configurable business information and preferences
- **Local Data Storage** - All data stored locally using IndexedDB (no cloud required)

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context + Custom Hooks
- **Database**: IndexedDB (local storage)
- **Desktop**: Electron
- **Build Tools**: Vite + esbuild

## Project Structure

```
prosource-crm-v2/
├── client/
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page-level components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # Business logic (DB, currency, utils)
│   │   ├── contexts/          # React context providers
│   │   ├── types/             # TypeScript interfaces
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # React entry point
│   │   └── index.css          # Global styles
│   ├── public/                # Static assets
│   └── index.html             # HTML template
├── electron/
│   ├── main.ts                # Electron main process
│   └── preload.ts             # IPC communication bridge
├── server/                    # Backend placeholder
├── shared/                    # Shared types
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
└── electron-builder.yml       # Electron build config
```

## Getting Started

### Prerequisites

- Node.js 18+ or higher
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ProSource.git
cd ProSource
```

2. Install dependencies:
```bash
pnpm install
```

### Development

Start the development server:
```bash
pnpm run dev
```

The app will be available at `http://localhost:3000`

### Development with Electron

In one terminal, start the dev server:
```bash
pnpm run dev
```

In another terminal, start Electron:
```bash
pnpm run dev:electron
```

### Building

Build for web:
```bash
pnpm run build
```

Build for desktop (Electron):
```bash
pnpm run build:electron
```

### Type Checking

```bash
pnpm run check
```

### Code Formatting

```bash
pnpm run format
```

## Data Models

### Client
```typescript
{
  id: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  platform?: string;
  currency: string;
  notes?: string;
  createdAt: number;
}
```

### Product
```typescript
{
  id: string;
  clientId: string;
  name: string;
  qty: number;
  unit: string;
  cost: number;
  costCur: string;
  charge: number;
  chargeCur: string;
  status: 'pending' | 'sourced' | 'delivered' | 'cancelled';
  createdAt: number;
}
```

### Lead
```typescript
{
  id: string;
  name: string;
  contact?: string;
  product?: string;
  country?: string;
  budget?: string;
  status: 'new' | 'contacted' | 'negotiating' | 'closed' | 'lost';
  notes?: string;
  createdAt: number;
}
```

### Invoice
```typescript
{
  id: string;
  num: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  discount: number;
  tax: number;
  payStatus: 'unpaid' | 'partial' | 'paid';
  currency: string;
  total: number;
  products: InvoiceProduct[];
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}
```

## Services

### Database Service (`client/src/services/db.ts`)

- `initDB()` - Initialize IndexedDB
- `dbGetAll(store)` - Get all records
- `dbGet(store, id)` - Get single record
- `dbPut(store, obj)` - Create or update
- `dbDelete(store, id)` - Delete record
- `persistSnapshot()` - Backup to localStorage
- `restoreSnapshotIfNeeded()` - Restore from backup

### Currency Service (`client/src/services/currency.ts`)

- `fetchExchangeRates()` - Get latest rates
- `convert(amount, from, to)` - Convert currency
- `formatCurrency(amount, currency)` - Format for display
- `setCustomRate(from, to, rate)` - Override rate
- `getCustomRate(from, to)` - Get custom rate

### Utility Functions (`client/src/services/utils.ts`)

- `generateId()` - Create unique IDs
- `formatDate()` - Format dates
- `debounce()` - Debounce function calls
- `groupBy()` - Group array items
- `sortBy()` - Sort arrays
- And many more...

## Custom Hooks

- `useClients()` - Manage client data
- `useProducts()` - Manage product data
- `useLeads()` - Manage lead data
- `useInvoices()` - Manage invoice data
- `useSettings()` - Manage app settings
- `useElectron()` - Access Electron API

## Global State

The `AppContext` provides centralized access to all data:

```tsx
const { clients, products, leads, invoices, settings, dbReady } = useApp();
```

## Customization

### Adding New Pages

1. Create a new file in `client/src/pages/`
2. Import and add route in `client/src/App.tsx`
3. Add navigation item in `client/src/components/Sidebar.tsx`

### Adding New Data Models

1. Define TypeScript interface in `client/src/types/index.ts`
2. Create IndexedDB store in `client/src/services/db.ts`
3. Create custom hook in `client/src/hooks/`
4. Add to `AppContext` in `client/src/contexts/AppContext.tsx`

### Styling

Global styles and design tokens are in `client/src/index.css`. The app uses Tailwind CSS utility classes for component styling.

## Production Deployment

### Web Deployment

```bash
pnpm run build
```

Deploy the `dist/public` folder to your hosting provider.

### Desktop Deployment

```bash
pnpm run build:electron
```

Installers will be created in `dist/build/` for Windows, macOS, and Linux.

## License

MIT

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Roadmap

- Cloud synchronization
- Multi-user collaboration
- Advanced reporting and analytics
- Mobile app (React Native)
- API for third-party integrations
- PDF invoice generation
- Email integration

---

**Version**: 2.0.0  
**Last Updated**: May 2026  
**Status**: Production Ready for Version 1
