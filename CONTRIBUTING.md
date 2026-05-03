# Contributing to ProSource CRM

Thank you for your interest in contributing to ProSource CRM! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/ProSource.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `pnpm install`

## Development Workflow

1. Make your changes
2. Run tests: `pnpm run check`
3. Format code: `pnpm run format`
4. Commit with descriptive messages
5. Push to your fork
6. Create a Pull Request

## Code Standards

### TypeScript
- Always use TypeScript for new files
- Avoid `any` types; use proper typing
- Run `pnpm run check` to verify no type errors

### React
- Use functional components with hooks
- Keep components focused and single-responsibility
- Use custom hooks for shared logic
- Prefer composition over inheritance

### Styling
- Use Tailwind CSS utilities
- Keep custom CSS minimal
- Follow the existing design system in `client/src/index.css`

### Naming Conventions
- Components: PascalCase (e.g., `ClientForm.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useClients.ts`)
- Services: camelCase (e.g., `db.ts`, `currency.ts`)
- Types: PascalCase (e.g., `Client`, `Product`)

## Project Structure

```
client/src/
├── components/    # Reusable UI components
├── pages/         # Page-level components
├── hooks/         # Custom React hooks
├── services/      # Business logic
├── contexts/      # React contexts
├── types/         # TypeScript interfaces
└── lib/           # Utilities and helpers
```

## Adding Features

### New Page
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Add navigation in `client/src/components/Sidebar.tsx`

### New Data Model
1. Define interface in `client/src/types/index.ts`
2. Create IndexedDB store in `client/src/services/db.ts`
3. Create custom hook in `client/src/hooks/`
4. Integrate with `AppContext`

### New Component
1. Create in `client/src/components/`
2. Export from component index if reusable
3. Add PropTypes or TypeScript interface

## Testing

Run type checking:
```bash
pnpm run check
```

## Commit Messages

Use clear, descriptive commit messages:
- `feat: add invoice PDF export`
- `fix: correct currency conversion calculation`
- `docs: update README with setup instructions`
- `refactor: simplify client data fetching`
- `style: format code with prettier`

## Pull Request Process

1. Update README.md if needed
2. Ensure all tests pass: `pnpm run check`
3. Format code: `pnpm run format`
4. Provide clear description of changes
5. Link related issues if applicable

## Reporting Issues

When reporting bugs, please include:
- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment details (OS, browser, version)

## Feature Requests

When suggesting features:
- Describe the use case
- Explain the benefit
- Provide examples if possible
- Consider implementation complexity

## Questions?

Feel free to open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make ProSource CRM better! 🚀
