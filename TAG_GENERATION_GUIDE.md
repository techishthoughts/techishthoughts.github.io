# 🏷️ Automatic Tag Generation & Release System

## 📋 Overview

The Tech.ish Thoughts blog now includes an **automatic semantic versioning and release system** that creates tags and GitHub releases based on your commit messages using [Conventional Commits](https://www.conventionalcommits.org/).

## 🚀 How It Works

### 1. **Commit Analysis**
The system analyzes all commits since the last tag to determine the type of version bump needed:

#### 🚨 **Major Version Bump (X.0.0)**
Triggered by commits containing:
- `BREAKING CHANGE` in the commit message
- `feat!:` (breaking feature)
- `fix!:` (breaking fix)

#### ✨ **Minor Version Bump (X.Y.0)**
Triggered by commits containing:
- `feat:` - New features
- `feat(scope):` - Scoped new features

#### 🐛 **Patch Version Bump (X.Y.Z)**
Triggered by commits containing:
- `fix:` - Bug fixes
- `fix(scope):` - Scoped bug fixes
- `perf:` - Performance improvements
- `perf(scope):` - Scoped performance improvements

#### ℹ️ **No Version Bump**
Other commit types don't trigger releases:
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `ci:` - CI/CD changes
- `chore:` - Maintenance tasks

### 2. **Automatic Tag Creation**
When a version bump is detected:
- Creates a new Git tag (e.g., `v2.1.0`)
- Uses semantic versioning format
- Tags are annotated with commit information

### 3. **GitHub Release Generation**
Automatically creates a GitHub release with:
- **Release title**: `Release vX.Y.Z`
- **Categorized changelog** by commit type
- **Build information** (Node.js, Hugo versions)
- **Quick links** to live site and full changelog
- **Attached artifacts** (documentation files)

### 4. **Package.json Sync**
- Updates `package.json` version to match the new tag
- Commits the version update back to the repository

## 📝 Commit Message Format

To trigger automatic releases, use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### ✅ **Examples of Valid Commit Messages**

#### New Features (Minor Bump)
```bash
git commit -m "feat: add dark mode toggle to header"
git commit -m "feat(search): implement advanced search filters"
git commit -m "feat: add text-to-speech functionality for articles"
```

#### Bug Fixes (Patch Bump)
```bash
git commit -m "fix: resolve mobile navigation menu issue"
git commit -m "fix(comments): handle empty comment submission"
git commit -m "perf: optimize image loading performance"
```

#### Breaking Changes (Major Bump)
```bash
git commit -m "feat!: redesign entire navigation system

BREAKING CHANGE: Navigation API has changed, old bookmarks may not work"
```

#### Non-Release Commits
```bash
git commit -m "docs: update contributing guidelines"
git commit -m "style: fix code formatting in components"
git commit -m "test: add unit tests for search functionality"
git commit -m "ci: update Hugo version in workflow"
git commit -m "chore: update dependencies"
```

## 🔄 Release Workflow

### Current Pipeline Flow:
1. **🔍 Validate** - Content and security validation
2. **🧪 Test** - Unit and E2E tests
3. **🏗️ Build** - React components and Hugo site
4. **🏷️ Tag** - Analyze commits and create tags/releases
5. **🚀 Deploy** - Deploy to GitHub Pages
6. **📬 Notify** - Send notifications and summaries

### When Tags Are Created:
- ✅ **On push to main branch**
- ✅ **When commits contain feat:, fix:, or perf: types**
- ✅ **After successful build and tests**
- ❌ **Not on pull requests**
- ❌ **Not for docs, style, or chore commits**

## 📊 Version History

The system maintains a complete version history:

- **Current Version**: `v2.0.0` (in package.json)
- **Next Version**: Determined automatically by commit analysis
- **Version Format**: Semantic versioning (MAJOR.MINOR.PATCH)
- **Tag Prefix**: `v` (e.g., v2.1.0, v2.1.1)

## 🎯 Release Features

### GitHub Releases Include:
- 📅 **Release date and build information**
- 🔄 **Categorized changelog** by commit type
- 🔗 **Quick links** to live site and full changelog
- 📦 **Build artifacts** and documentation
- 🏗️ **Technical details** (Node.js, Hugo versions)

### Automatic Updates:
- 📝 **package.json version** synced with tag
- 🔄 **Changelog generation** from commit messages
- 📊 **Build statistics** included in releases
- 🌐 **Live site links** for immediate access

## 🛠️ Manual Release Creation

If you need to create a release manually:

```bash
# Create and push a tag manually
git tag -a v2.1.0 -m "Release v2.1.0: Add new features"
git push origin v2.1.0

# Or use npm version (updates package.json too)
npm version patch  # For patch release
npm version minor  # For minor release
npm version major  # For major release
git push origin main --tags
```

## 🔍 Monitoring Releases

### Check Release Status:
- **GitHub Actions**: [Actions Tab](https://github.com/techishthoughts/techishthoughts.github.io/actions)
- **Releases**: [Releases Page](https://github.com/techishthoughts/techishthoughts.github.io/releases)
- **Tags**: [Tags Page](https://github.com/techishthoughts/techishthoughts.github.io/tags)

### CI/CD Pipeline Logs:
- 🏷️ **Tag Generation Job**: Shows commit analysis and version decisions
- 📝 **Changelog Generation**: Displays categorized commits
- 🎉 **Release Creation**: Confirms successful release publication

## 📚 Best Practices

### For Contributors:
1. **Use conventional commit messages** for automatic releases
2. **Group related changes** in single commits when possible
3. **Test thoroughly** before pushing to main
4. **Document breaking changes** in commit messages

### For Maintainers:
1. **Review commit messages** in pull requests
2. **Monitor release generation** in Actions tab
3. **Verify releases** include correct information
4. **Update documentation** when releasing major versions

## 🔧 Configuration Details

### Tag Generation Settings:
- **Trigger**: Push to main branch only
- **Version Prefix**: `v` (e.g., v2.1.0)
- **Branch**: `main` (release branch)
- **Permissions**: `contents: write` for tag creation

### Release Settings:
- **Auto-generated**: Yes, from commit messages
- **Pre-release**: No (all releases are stable)
- **Draft**: No (releases are published immediately)
- **Artifacts**: Documentation files attached

## 🚨 Troubleshooting

### Common Issues:

#### No Tag Created
- ✅ Check if commits use conventional format
- ✅ Verify push was to main branch
- ✅ Ensure CI pipeline completed successfully

#### Wrong Version Bump
- ✅ Review commit message format
- ✅ Check for BREAKING CHANGE in commit body
- ✅ Verify feat/fix/perf prefixes are correct

#### Release Not Created
- ✅ Check GitHub Actions logs for errors
- ✅ Verify repository permissions
- ✅ Ensure GITHUB_TOKEN has write access

### Getting Help:
- 📖 [Conventional Commits Specification](https://www.conventionalcommits.org/)
- 🔧 [GitHub Actions Documentation](https://docs.github.com/en/actions)
- 🏷️ [Semantic Versioning Guide](https://semver.org/)

---

*This tag generation system ensures consistent, automated releases while maintaining semantic versioning best practices for the Tech.ish Thoughts blog.*
