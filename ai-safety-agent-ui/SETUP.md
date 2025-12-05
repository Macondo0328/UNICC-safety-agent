# Setup Instructions

## Prerequisites Installation

### 1. Install Node.js

If you don't have Node.js installed:

**macOS** (using Homebrew):
```bash
brew install node
```

**Or download from**: https://nodejs.org/ (LTS version recommended)

Verify installation:
```bash
node --version  # Should be 16.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

### 2. Navigate to Project Directory

```bash
cd /Users/s/ai-safety-agent-ui
```

### 3. Install Dependencies

```bash
npm install
```

This will install all required packages:
- React 18.2.0
- TypeScript 5.0
- Vite 4.4.0
- Vitest 0.34.0
- Testing Library
- And all other dependencies

## Quick Start

### Run Development Server

```bash
npm run dev
```

Open your browser to: http://localhost:3000

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
```

## Troubleshooting

### If npm is not found

Install Node.js first (see Prerequisites above)

### If installation fails

1. Clear npm cache:
```bash
npm cache clean --force
```

2. Delete node_modules and try again:
```bash
rm -rf node_modules package-lock.json
npm install
```

### If tests fail

Make sure all dependencies are installed:
```bash
npm install
```

### Port 3000 is already in use

Change the port in `vite.config.ts`:
```typescript
server: {
  port: 3001,  // Change to any available port
  host: true
}
```

## Next Steps

1. ✅ Dependencies installed
2. ✅ Development server running
3. ✅ Tests passing
4. 📖 Read README.md for full documentation
5. 📖 Read INTEGRATION_GUIDE.md to connect your AI agent
6. 🚀 Start developing!

## Project Structure Overview

```
ai-safety-agent-ui/
├── src/
│   ├── components/     # UI components
│   ├── services/       # API services (mock + real)
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript definitions
│   ├── utils/          # Helper functions
│   ├── styles/         # CSS styles
│   └── tests/          # Test files
├── README.md           # Main documentation
├── INTEGRATION_GUIDE.md # How to connect AI agent
└── package.json        # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run linter
- `npm run type-check` - Check TypeScript types

## Getting Help

If you encounter any issues:

1. Check this SETUP.md file
2. Read the README.md
3. Review the code comments
4. Check the browser console for errors
5. Look at the test files for examples

## Ready to Go!

The UI is now ready to use. It runs in mock mode by default, so you can test it immediately without an AI agent.

When your teammate's AI agent is ready, follow the INTEGRATION_GUIDE.md to connect them together.

Happy coding! 🚀

