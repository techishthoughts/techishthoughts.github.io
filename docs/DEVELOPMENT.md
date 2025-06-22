# Development Guide

## Local Development Server

To run the site locally with correct URLs and configuration:

### Quick Start

```bash
# Start development server
npm start

# Start with file watching
npm run dev
```

### URLs

- **Local Development**: `http://localhost:1313`
- **Production**: `https://techishthoughts.github.io/`

### Environment Configuration

The project uses environment-specific configurations:

- **Development** (`config/development/hugo.toml`):

  - `baseURL = "http://localhost:1313"`
  - Drafts enabled
  - Live reload enabled
  - Fast render disabled for accuracy

- **Production** (`config/production/hugo.toml`):
  - `baseURL = "https://techishthoughts.github.io/"`
  - Drafts disabled
  - Live reload disabled
  - Optimized for performance

### Building

```bash
# Production build (includes CSS)
npm run build
```

### Common Issues

1. **Site redirecting to production URL locally**:

   - Make sure you're using `npm start` or `npm run dev`
   - These commands use `--environment development` flag

2. **CSS not updating**:

   - Run `npm run build:css` to rebuild CSS

3. **Links not working locally**:
   - Ensure you're accessing `http://localhost:1313` (not `127.0.0.1`)
   - Check that the development environment is being used

### Development Scripts

- `npm start` - Start development server
- `npm run dev` - Start development server with file watching
- `npm run build` - Production build with CSS
- `npm run build:css` - Build CSS only
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Check code quality
- `npm run format` - Format code with Prettier

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests locally
npm run test:e2e:local

# Run all tests
npm run test:all
```
