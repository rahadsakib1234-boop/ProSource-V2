# ProSource CRM v2

ProSource CRM is a local-first desktop CRM for sourcing businesses and similar sales workflows. It runs in Electron with a React frontend and stores data locally in IndexedDB, with built-in backup, restore, export, login, role-based access, and industry-aware workflow views.

## What it does

- Desktop app for Windows, macOS, and Linux
- Local-first storage with IndexedDB
- Login and role-based access for admin and employee users
- Client, product, lead, and invoice management
- Pipeline board for lead tracking
- Export tools for CSV, JSON backup, and Excel reports
- Backup list, restore flow, and local data recovery support
- Industry settings for adapting the UI to different business types

## Current architecture

- **Frontend**: React + TypeScript + Vite
- **Desktop shell**: Electron
- **Storage**: IndexedDB with snapshot persistence
- **Exports**: JSON, CSV, and Excel
- **State**: React hooks and local app context

## Features

### Core CRM
- Clients
- Products
- Leads
- Invoices
- Currency support
- Search and filtering

### Team tools
- Secure login
- Admin/employee roles
- User management
- Employee management UI

### Pipeline
- Kanban-style lead board
- Drag-and-drop stage movement
- Industry-aware stage labels

### Backup and export
- JSON backup export
- Restore from backup files
- Backup list modal
- CSV exports for major data tables
- Excel exports for client-safe and private reporting

## Installation

```bash
git clone https://github.com/rahadsakib1234-boop/ProSource-V2.git
cd ProSource-V2
pnpm install
```

## Development

```bash
pnpm run dev
```

## Production build

```bash
pnpm run check
pnpm run build:web
pnpm run build:electron
```

## Important notes

- Data is stored locally in the browser/desktop app environment.
- Backups are local backup files handled by the app.
- This repo does **not** currently ship a Supabase backend or tRPC cloud API.
- If you want true multi-tenant cloud sync later, that should be built as a separate backend phase.

## Status

This codebase is now honest about what it already does well: a polished local CRM with strong desktop workflow, export, and recovery tools.