# Pre-Commit Setup Guide

This project uses a multi-tiered pre-commit system to ensure code quality and prevent issues before they reach the repository.

## 🚀 Quick Start

The pre-commit hooks are automatically set up when you run:

```bash
npm install
```

This will install Husky and configure the pre-commit hooks.

## 📋 Pre-Commit Levels

### 1. Default Pre-Commit (Fast) ⚡

**Runs automatically on every commit**

```bash
npm run pre-commit
```

**What it does:**

- ✅ Code formatting (Prettier)
- ✅ Linting (ESLint) with auto-fix
- ✅ Content validation (authors & frontmatter)
- ✅ Basic file formatting

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

### Lint-Staged Configuration

Located in `package.json`:

```json
{
  "lint-staged": {
    "assets/js/**/*.{ts,tsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{js,jsx,json,css,md,yml,yaml}": ["prettier --write"],
    "data/authors.json": [
      "node scripts/validate-authors.cjs",
      "prettier --write"
    ],
    "content/posts/*.md": [
      "node scripts/validate-frontmatter.cjs",
      "prettier --write"
    ]
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
# Auto-format all files
npm run format
```

### Performance Issues

If pre-commit is too slow:

1. Use the default fast pre-commit for regular commits
2. Run comprehensive checks before pushing:
   ```bash
   npm run pre-commit:full
   ```

## 📊 What Each Check Does

| Check          | Purpose                     | Time | Frequency    |
| -------------- | --------------------------- | ---- | ------------ |
| Prettier       | Code formatting consistency | ~5s  | Every commit |
| ESLint         | Code quality & standards    | ~10s | Every commit |
| TypeScript     | Type safety                 | ~15s | Manual/CI    |
| Unit Tests     | Functionality validation    | ~30s | Manual/CI    |
| E2E Tests      | User workflow validation    | ~2m  | Manual/CI    |
| Security Audit | Dependency vulnerabilities  | ~10s | Manual/CI    |
| Build Test     | Production readiness        | ~30s | Manual/CI    |

## 🎯 Best Practices

1. **Daily Development**: Use default pre-commit (fast)
2. **Before PR**: Run `npm run pre-commit:test`
3. **Before Release**: Run `npm run pre-commit:full`
4. **Fix Issues Early**: Don't accumulate linting/formatting issues

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
