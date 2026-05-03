# ProSource CRM - Setup Guide

Complete guide for setting up ProSource CRM for development and production.

## Prerequisites

- **Node.js**: 18.0.0 or higher
- **pnpm**: 9.0.0 or higher (recommended)
  - Install: `npm install -g pnpm`
  - Or use npm/yarn if preferred

## Quick Start (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/ProSource.git
cd ProSource

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm run dev

# 4. Open browser
# Navigate to http://localhost:3000
```

## Development Setup

### Full Development Environment

```bash
# Install dependencies
pnpm install

# Start dev server in one terminal
pnpm run dev

# In another terminal, start Electron (optional)
pnpm run dev:electron
```

The app will be available at `http://localhost:3000`

### Environment Variables

Create a `.env.local` file in the project root (optional):

```env
# API Configuration (if needed in future)
VITE_API_URL=http://localhost:3001

# App Configuration
VITE_APP_NAME=ProSource CRM
VITE_APP_VERSION=2.0.0
```

## Project Setup Details

### Directory Structure

```
ProSource/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # Business logic
│   │   ├── contexts/      # React contexts
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main app
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── public/            # Static files
│   └── index.html         # HTML template
├── electron/              # Electron config
│   ├── main.ts           # Main process
│   └── preload.ts        # IPC bridge
├── server/               # Backend (placeholder)
├── shared/               # Shared types
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 | UI framework |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS 4 | Utility CSS |
| State | React Context | Global state |
| Database | IndexedDB | Local storage |
| Build | Vite | Fast bundling |
| Desktop | Electron | Desktop app |

## Development Commands

```bash
# Start development server
pnpm run dev

# Type checking
pnpm run check

# Format code
pnpm run format

# Build for web
pnpm run build

# Preview production build
pnpm run preview

# Build for Electron
pnpm run build:electron

# Start Electron in dev mode
pnpm run dev:electron
```

## Database Setup

ProSource uses **IndexedDB** for local data storage. No external database setup is required.

### Data Persistence

- All data is stored locally in the browser's IndexedDB
- Automatic backup to localStorage on each save
- Data persists across browser sessions
- Export/import functionality available in Settings

### Data Models

The app manages these entities:
- **Clients** - Customer information
- **Products** - Items being sourced
- **Leads** - Quote requests and prospects
- **Invoices** - Financial records
- **Settings** - App configuration

## Building for Production

### Web Build

```bash
# Create optimized build
pnpm run build

# Output directory: dist/public/
# Deploy this folder to your hosting provider
```

### Desktop Build (Electron)

```bash
# Create desktop installers
pnpm run build:electron

# Output directory: dist/build/
# Contains installers for Windows, macOS, Linux
```

## Deployment

### Web Hosting

1. Build the project: `pnpm run build`
2. Deploy `dist/public/` to your hosting:
   - Vercel: `vercel deploy dist/public`
   - Netlify: `netlify deploy --prod --dir dist/public`
   - AWS S3: `aws s3 sync dist/public s3://your-bucket`
   - Any static host (GitHub Pages, etc.)

### Desktop Distribution

1. Build: `pnpm run build:electron`
2. Installers are in `dist/build/`
3. Distribute `.exe` (Windows), `.dmg` (macOS), `.AppImage` (Linux)

## Troubleshooting

### Port 3000 Already in Use

```bash
# Use a different port
pnpm run dev -- --port 3001
```

### Dependencies Installation Issues

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript Errors

```bash
# Check for type errors
pnpm run check

# Fix formatting issues
pnpm run format
```

### Electron Build Fails

```bash
# Rebuild native modules
pnpm run build:electron --rebuild

# Clear build cache
rm -rf dist/ build/
pnpm run build:electron
```

## Performance Tips

1. **Development**: Use `pnpm` instead of npm for faster installs
2. **Build**: Production builds are optimized with tree-shaking
3. **Database**: IndexedDB queries are indexed for fast lookups
4. **Caching**: Browser caches static assets automatically

## Security Considerations

1. **Data Privacy**: All data stored locally, no cloud sync in v1
2. **CORS**: Configure CORS headers if adding backend API
3. **Environment Variables**: Never commit `.env` files with secrets
4. **Dependencies**: Regularly update dependencies: `pnpm update`

## Next Steps

1. **Familiarize yourself** with the codebase structure
2. **Read** `CONTRIBUTING.md` for development guidelines
3. **Check** existing issues for areas to contribute
4. **Start** with small features or bug fixes
5. **Open** a PR with your changes

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Electron Documentation](https://www.electronjs.org/docs)

## Getting Help

- Check existing issues on GitHub
- Read the README.md
- Review code comments and JSDoc
- Open a new issue with details

---

Happy coding! 🚀
