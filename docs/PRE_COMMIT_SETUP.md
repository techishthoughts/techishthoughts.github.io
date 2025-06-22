# Pre-Commit Setup & Comprehensive Testing

This project uses comprehensive pre-commit hooks to ensure code quality and prevent broken commits from reaching the repository.

## 🔍 What Runs on Every Commit

The pre-commit hooks automatically run the following checks:

### 1. **Code Formatting** ✨

- Prettier formatting check
- Auto-fixes minor formatting issues
- Ensures consistent code style

### 2. **Linting** 🔧

- ESLint with TypeScript support
- Zero warnings policy (`--max-warnings 0`)
- Auto-fixes fixable issues

### 3. **Type Checking** 🎯

- TypeScript compilation check
- Ensures type safety across the codebase

### 4. **Content Validation** 📝

- Author data validation (`data/authors.json`)
- Blog post frontmatter validation
- Required fields and format checking

### 5. **Unit Tests** 🧪

- All unit tests must pass
- Uses Vitest with verbose reporter
- Fails immediately on first test failure (`--bail=1`)

### 6. **Security Audit** 🔒

- NPM security audit
- Checks for known vulnerabilities
- Moderate severity level

## 🚀 How to Use

### Standard Commit (Recommended)

```bash
git add .
git commit -m "feat: your commit message"
```

The pre-commit hooks will automatically run all checks.

### Manual Pre-Commit Validation

```bash
# Run comprehensive validation manually
npm run pre-commit:full

# Run fast validation (without E2E tests)
npm run pre-commit:fast
```

### Comprehensive Pre-Commit Script

```bash
# Run the full comprehensive script
./scripts/pre-commit-comprehensive.sh
```

## 🎭 E2E Tests

E2E tests run in these scenarios:

- When E2E-related files are modified
- When `playwright.config.ts` is changed
- When manually running `npm run pre-commit:full`

## 🛠 Available Commands

### Testing Commands

```bash
npm run test:run           # Run unit tests once
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Run E2E tests with UI
npm run test:e2e:headed   # Run E2E tests in headed mode
```

### Validation Commands

```bash
npm run lint              # Run ESLint
npm run type-check        # Run TypeScript check
npm run format:check      # Check formatting
npm run format            # Fix formatting
npm run validate:content  # Validate authors & posts
npm run validate:all      # Run all validations
```

### Build Commands

```bash
npm run build             # Build React components
npm run hugo:build        # Build Hugo site
npm run build:all         # Build everything
```

## 🚨 Troubleshooting

### If Pre-Commit Fails

1. **Formatting Issues**

   ```bash
   npm run format
   ```

2. **Linting Errors**

   ```bash
   npm run lint:fix
   ```

3. **Type Errors**

   ```bash
   npm run type-check
   ```

   Fix the reported TypeScript errors manually.

4. **Test Failures**

   ```bash
   npm run test:ui
   ```

   Use the test UI to debug failing tests.

5. **E2E Test Failures**
   ```bash
   npm run test:e2e:ui
   ```
   Use Playwright's UI mode to debug E2E tests.

### Bypassing Pre-Commit (Emergency Only)

```bash
git commit --no-verify -m "emergency fix"
```

**⚠️ Warning**: Only use `--no-verify` in genuine emergencies. All checks will still run in CI.

## 📊 Pre-Commit Performance

The comprehensive pre-commit process typically takes:

- **Fast mode**: 30-60 seconds
- **Full mode** (with E2E): 2-5 minutes

### Optimization Tips

- Keep commits focused and small
- Run tests locally during development
- Use `npm run pre-commit:fast` for quick iterations

## 🔧 Configuration

### Lint-Staged Configuration

Located in `package.json` under `lint-staged`.

### Husky Configuration

Located in `.husky/pre-commit`.

### Playwright Configuration

Located in `playwright.config.ts`.

## 🎯 Benefits

1. **Prevents Broken Commits**: Catches issues before they reach the repository
2. **Consistent Quality**: Ensures all code meets project standards
3. **Fast Feedback**: Immediate feedback on code quality
4. **Reduced CI Failures**: Fewer failed builds in GitHub Actions
5. **Team Confidence**: Shared assurance that all code is tested

## 📈 Continuous Improvement

The pre-commit setup is continuously improved based on:

- Team feedback
- CI failure patterns
- Performance considerations
- New tooling and best practices

For suggestions or issues with the pre-commit setup, please open an issue or discussion in the repository.
