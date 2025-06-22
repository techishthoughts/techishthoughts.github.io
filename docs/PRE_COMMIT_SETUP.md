# Pre-Commit Setup Guide

This project uses a multi-tiered pre-commit system with **automatic format checking and fixing** to ensure code quality and prevent issues before they reach the repository.

## 🚀 Quick Start

The pre-commit hooks are automatically set up when you run:

```bash
npm install
```

This will install Husky and configure the pre-commit hooks with automatic formatting.

## 🎨 Automatic Format Checking & Fixing

### How It Works

Every commit now includes **automatic format checking**:

1. **Format Check**: Runs `prettier --check .` to detect formatting issues
2. **Auto-Fix**: If issues found, automatically runs `prettier --write .` to fix them
3. **Lint-Staged**: Processes only staged files for optimal performance
4. **Commit**: Proceeds with properly formatted code

### Visual Flow

```bash
git commit -m "your message"
    ↓
🔍 Running pre-commit checks...
    ↓
🎨 Checking code formatting...
    ↓
✅ All files properly formatted  OR  🔧 Auto-fixing formatting issues...
    ↓
📋 Running lint-staged on changed files...
    ↓
✅ Pre-commit checks completed!
```

## 📋 Pre-Commit Levels

### 1. Default Pre-Commit (Fast) ⚡

**Runs automatically on every commit**

```bash
npm run pre-commit
```

**What it does:**

- 🎨 **Format Check & Auto-Fix**: Automatically fixes formatting issues
- ✅ **Linting (ESLint)**: Code quality checks with auto-fix
- ✅ **Content Validation**: Authors & frontmatter validation
- ✅ **File Processing**: Staged files only for performance

**Time:** ~10-30 seconds

### 2. Test Pre-Commit (Medium) 🧪

**Run manually when you want to include tests**

```bash
npm run pre-commit:test
```

**What it does:**

- ✅ All fast checks above
- ✅ TypeScript type checking
- ✅ Unit tests (all 87 tests)

**Time:** ~1-2 minutes

### 3. Comprehensive Pre-Commit (Full) 🔍

**Run manually for complete validation**

```bash
npm run pre-commit:full
```

**What it does:**

- ✅ All test checks above
- ✅ Security audit
- ✅ Build process validation
- ✅ E2E tests (if E2E files changed)
- ✅ Hugo build test (if content changed)

**Time:** ~3-5 minutes

## 🛠️ Configuration Files

### Husky Configuration

- `.husky/pre-commit` - Main pre-commit hook
- Runs the fast pre-commit by default

### Enhanced Lint-Staged Configuration

Located in `package.json` with comprehensive file coverage:

```json
{
  "lint-staged": {
    "assets/js/**/*.{ts,tsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{js,jsx,json,css,md,yml,yaml,html}": ["prettier --write"],
    "*.{cjs,mjs}": ["prettier --write"],
    "scripts/*.{js,cjs,mjs}": ["prettier --write"],
    "data/authors.json": [
      "node scripts/validate-authors.cjs",
      "prettier --write"
    ],
    "content/**/*.md": [
      "node scripts/validate-frontmatter.cjs",
      "prettier --write"
    ],
    "docs/*.md": ["prettier --write"],
    "README.MD": ["prettier --write"],
    "package.json": ["prettier --write"]
  }
}
```

### Format Check Scripts

New scripts for format management:

```json
{
  "scripts": {
    "pre-commit": "npm run pre-commit:format && lint-staged",
    "pre-commit:format": "npm run format:check || (echo '🎨 Auto-fixing formatting issues...' && npm run format)",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

### Comprehensive Script

- `scripts/pre-commit-comprehensive.sh` - Full validation script

## 🔧 Customization

### Skip Pre-Commit (Emergency)

If you need to skip pre-commit checks in an emergency:

```bash
git commit --no-verify -m "emergency fix"
```

**⚠️ Use sparingly! Always run checks manually afterward.**

### Modify Pre-Commit Behavior

#### Change Default Behavior

Edit `.husky/pre-commit` to change what runs by default.

#### Add New File Types

Edit the `lint-staged` section in `package.json`.

#### Customize Comprehensive Checks

Edit `scripts/pre-commit-comprehensive.sh`.

## 🚨 Troubleshooting

### Common Issues

#### 1. Pre-commit fails with "command not found"

```bash
# Reinstall husky
npm run prepare
```

#### 2. Tests fail during pre-commit

```bash
# Run tests individually to debug
npm run test
npm run test:ui  # For interactive debugging
```

#### 3. Linting errors

```bash
# Auto-fix linting issues
npm run lint:fix
```

#### 4. Formatting issues

```bash
# Check formatting without fixing
npm run format:check

# Auto-format all files
npm run format

# Test the pre-commit format flow
npm run pre-commit:format
```

#### 5. Pre-commit format issues

If the automatic format fixing fails:

```bash
# Manual format check and fix
npm run format:check
npm run format

# Check specific files
npx prettier --check path/to/file.js
npx prettier --write path/to/file.js
```

### Performance Issues

If pre-commit is too slow:

1. Use the default fast pre-commit for regular commits
2. Run comprehensive checks before pushing:
   ```bash
   npm run pre-commit:full
   ```

## 📊 What Each Check Does

| Check              | Purpose                     | Time | Frequency    | Auto-Fix |
| ------------------ | --------------------------- | ---- | ------------ | -------- |
| **Format Check**   | Detect formatting issues    | ~2s  | Every commit | ✅       |
| **Prettier**       | Code formatting consistency | ~5s  | Every commit | ✅       |
| **ESLint**         | Code quality & standards    | ~10s | Every commit | ✅       |
| **TypeScript**     | Type safety                 | ~15s | Manual/CI    | ❌       |
| **Unit Tests**     | Functionality validation    | ~30s | Manual/CI    | ❌       |
| **E2E Tests**      | User workflow validation    | ~2m  | Manual/CI    | ❌       |
| **Security Audit** | Dependency vulnerabilities  | ~10s | Manual/CI    | ⚠️       |
| **Build Test**     | Production readiness        | ~30s | Manual/CI    | ❌       |

### Format Check Details

- **Detection**: Scans all files for formatting issues
- **Auto-Fix**: Automatically applies Prettier formatting rules
- **Coverage**: All file types (JS, TS, JSON, MD, YAML, etc.)
- **Performance**: Only processes changed files via lint-staged
- **Feedback**: Clear messages about what was fixed

## 🎯 Best Practices

1. **Daily Development**: Use default pre-commit (fast) - formatting is automatic!
2. **Before PR**: Run `npm run pre-commit:test`
3. **Before Release**: Run `npm run pre-commit:full`
4. **Trust Auto-Fix**: Let the system handle formatting, focus on logic
5. **Manual Format Check**: Use `npm run format:check` to preview changes
6. **Fix Issues Early**: Don't accumulate linting/formatting issues

### Formatting Workflow

```bash
# Normal workflow - formatting happens automatically
git add .
git commit -m "feat: add new feature"
# ✅ Formatting applied automatically

# If you want to check formatting first
npm run format:check
git add .
git commit -m "feat: add new feature"

# Manual formatting if needed
npm run format
git add .
git commit -m "feat: add new feature"
```

## 🔄 Integration with CI/CD

The pre-commit checks align with CI/CD pipeline:

- Local pre-commit prevents most issues
- CI runs comprehensive checks
- Consistent tooling and configuration

## 📝 Adding New Checks

To add a new pre-commit check:

1. **For all files**: Add to `lint-staged` in `package.json`
2. **For comprehensive**: Add to `scripts/pre-commit-comprehensive.sh`
3. **Test locally**: Run your new check manually first
4. **Document**: Update this guide

## 🤝 Contributing

When contributing to this project:

1. Ensure pre-commit hooks are working
2. Run comprehensive checks before major PRs
3. Update this documentation if you modify the setup

---

**Questions?** Check the project README or open an issue!
