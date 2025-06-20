# 🔧 Pre-Commit Hooks Setup

## 📋 Overview

Pre-commit hooks have been configured to automatically validate and format code before commits, preventing CI failures and maintaining code quality standards.

## 🚀 What Gets Validated

### 📝 **Automatic Formatting & Linting**

- **TypeScript/React files** (`.ts`, `.tsx`): ESLint fixes + Prettier formatting
- **JavaScript files** (`.js`, `.jsx`, `.cjs`, `.mjs`): Prettier formatting
- **Configuration files** (`.json`, `.yml`, `.yaml`): Prettier formatting
- **Markdown files** (`.md`): Prettier formatting
- **CSS files** (`.css`): Prettier formatting

### 🔍 **Content Validation**

- **Author data** (`data/authors.json`): Validates author structure and required fields
- **Post frontmatter** (`content/posts/*.md`): Validates required fields and format
- **Commit messages**: Enforces conventional commit format

### ✅ **Quality Checks**

- **TypeScript compilation**: Ensures no type errors
- **ESLint rules**: Fixes code quality issues automatically
- **Prettier formatting**: Ensures consistent code style

## 🔄 Pre-Commit Workflow

When you run `git commit`, the following happens automatically:

1. **🔍 File Detection**: lint-staged identifies changed files
2. **🔧 Auto-fixing**: Runs appropriate tools based on file types
3. **✅ Validation**: Validates content and commit message format
4. **📝 Staging**: Automatically stages fixed files
5. **✨ Commit**: Proceeds with commit if all checks pass

## 📝 Commit Message Validation

### ✅ **Valid Commit Formats**

```bash
# Features (triggers minor version bump)
git commit -m "feat: add dark mode toggle"
git commit -m "feat(search): implement advanced filters"

# Bug fixes (triggers patch version bump)
git commit -m "fix: resolve mobile navigation issue"
git commit -m "fix(comments): handle empty submissions"

# Performance improvements (triggers patch version bump)
git commit -m "perf: optimize image loading"

# Documentation (no version bump)
git commit -m "docs: update contributing guide"

# Code style (no version bump)
git commit -m "style: fix indentation in components"

# Refactoring (no version bump)
git commit -m "refactor: simplify search logic"

# Tests (no version bump)
git commit -m "test: add unit tests for TagManager"

# CI/CD changes (no version bump)
git commit -m "ci: update Hugo version in workflow"

# Maintenance (no version bump)
git commit -m "chore: update dependencies"
```

### ❌ **Invalid Commit Formats**

```bash
# Missing type
git commit -m "add new feature"

# Wrong case
git commit -m "FEAT: add new feature"

# Too long (>100 characters)
git commit -m "feat: this is a very long commit message that exceeds the maximum allowed length and will be rejected"

# Ends with period
git commit -m "feat: add new feature."
```

## 🛠️ Manual Commands

### Run Pre-commit Checks Manually

```bash
# Run all pre-commit checks
npm run pre-commit

# Full validation suite (more comprehensive)
npm run pre-commit:full

# Individual checks
npm run format          # Fix formatting
npm run lint           # Fix linting issues
npm run type-check     # Check TypeScript
npm run validate:content # Validate authors & frontmatter
```

### Bypass Pre-commit (Not Recommended)

```bash
# Skip pre-commit hooks (emergency only)
git commit -m "fix: emergency fix" --no-verify
```

## 📊 File-Specific Validations

### **TypeScript/React Files** (`.ts`, `.tsx`)

- ✅ ESLint auto-fix
- ✅ Prettier formatting
- ✅ Type checking (on manual run)

### **Author Data** (`data/authors.json`)

- ✅ JSON structure validation
- ✅ Required fields check (name, bio, avatar)
- ✅ Bio length validation (≥20 characters)
- ✅ URL format validation for avatars and social links

### **Post Files** (`content/posts/*.md`)

- ✅ Frontmatter presence check
- ✅ Required fields validation (title, date)
- ✅ Author reference validation
- ✅ Date format validation
- ✅ Tag format validation

### **Configuration Files** (`.yml`, `.json`)

- ✅ Prettier formatting
- ✅ Syntax validation

## 🔧 Configuration Files

### **Husky Hooks**

- `.husky/pre-commit`: Runs lint-staged
- `.husky/commit-msg`: Validates commit message format

### **Lint-staged Configuration** (`package.json`)

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write", "git add"],
    "*.{js,jsx,json,css,md,yml,yaml}": ["prettier --write", "git add"],
    "*.{cjs,mjs}": ["prettier --write", "git add"],
    "data/authors.json": [
      "node scripts/validate-authors.cjs",
      "prettier --write",
      "git add"
    ],
    "content/posts/*.md": [
      "node scripts/validate-frontmatter.cjs",
      "prettier --write",
      "git add"
    ]
  }
}
```

### **Commitlint Configuration** (`commitlint.config.js`)

- Enforces conventional commit format
- Validates commit message structure
- Provides helpful error messages

## 🎯 Benefits

### **For Developers**

- ✅ **Automatic formatting**: No need to remember to format code
- ✅ **Immediate feedback**: Catch issues before pushing
- ✅ **Consistent style**: Ensures all code follows the same standards
- ✅ **Faster reviews**: Pre-formatted, validated code

### **For CI/CD**

- ✅ **Prevents failures**: Formatting issues caught locally
- ✅ **Faster builds**: No time wasted on formatting failures
- ✅ **Reliable releases**: Validated content ensures proper tag generation
- ✅ **Clean history**: Consistent commit message format

## 🚨 Troubleshooting

### **Pre-commit Hook Not Running**

```bash
# Reinstall hooks
npx husky install
npm run prepare
```

### **Validation Errors**

```bash
# Check specific validation
npm run validate:authors
npm run validate:frontmatter

# Fix formatting issues
npm run format
npm run lint:fix
```

### **Commit Message Rejected**

- Use conventional commit format: `type: description`
- Keep header under 100 characters
- Don't end with a period
- Use lowercase for type and scope

### **Files Not Being Staged**

```bash
# Manual staging after fixes
git add .
git commit -m "fix: your commit message"
```

## 📚 Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Commitlint Documentation](https://commitlint.js.org/)

---

_Pre-commit hooks ensure code quality and prevent CI failures by validating everything locally before it reaches the repository._
