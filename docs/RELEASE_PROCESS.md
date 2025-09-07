# 🚀 Release Process

This document outlines the automated release process for the TechishThoughts blog project.

## 📋 Overview

The project uses GitHub Actions to automatically create releases and generate comprehensive release notes whenever a version tag is pushed to the repository.

## 🏷️ Creating a Release

### Method 1: Using the Release Script (Recommended)

Use the provided script to automatically handle versioning and tagging:

```bash
# Patch release (e.g., 1.0.0 → 1.0.1)
./scripts/create-release.sh patch

# Minor release (e.g., 1.0.0 → 1.1.0)
./scripts/create-release.sh minor

# Major release (e.g., 1.0.0 → 2.0.0)
./scripts/create-release.sh major

# Custom version
./scripts/create-release.sh 2.1.3

# With custom message
./scripts/create-release.sh minor "Add new search functionality"
```

### Method 2: Manual Tagging

1. **Update version** in `package.json`:
   ```json
   {
     "version": "1.2.3"
   }
   ```

2. **Commit the version change**:
   ```bash
   git add package.json
   git commit -m "Release v1.2.3"
   ```

3. **Create and push the tag**:
   ```bash
   git tag -a v1.2.3 -m "Release v1.2.3"
   git push origin main
   git push origin v1.2.3
   ```

### Method 3: GitHub Web Interface

1. Go to the [Releases page](https://github.com/techishthoughts/techishthoughts.github.io/releases)
2. Click "Create a new release"
3. Choose "Create new tag" and enter `v1.2.3`
4. Set target branch to `main`
5. Enter release title and description (or leave blank for auto-generation)
6. Click "Publish release"

## 🤖 Automated Process

When a version tag is pushed, the following happens automatically:

### 1. 📦 Release Creation
- GitHub Actions detects the new tag
- Creates a GitHub release
- Generates initial release notes from commits
- Determines if it's a pre-release (alpha, beta, rc)

### 2. 📝 Enhanced Release Notes
- Fetches the latest release notes using GitHub's API
- Adds project statistics:
  - Total commits
  - Number of contributors
  - Recent files changed
- Includes helpful links:
  - Documentation
  - Issue tracker
  - Live site
  - Discussions

### 3. 🎯 Release Categorization

The release notes are automatically categorized based on PR/commit labels:

- 🚀 **New Features** (`enhancement`, `feature`)
- 🐛 **Bug Fixes** (`bug`, `fix`)
- 🔒 **Security** (`security`)
- 🏗️ **Refactoring** (`refactor`, `refactoring`)
- 📚 **Documentation** (`documentation`, `docs`)
- 🧪 **Testing** (`test`, `tests`)
- 🔧 **Maintenance** (`maintenance`, `chore`)
- 📦 **Dependencies** (`dependencies`, `deps`)
- ⚡ **Performance** (`performance`, `perf`)
- 🎨 **Styling** (`style`, `css`, `ui`)
- 🔨 **Build System** (`build`, `ci`, `cd`)
- 📱 **Mobile** (`mobile`, `responsive`)
- ♿ **Accessibility** (`accessibility`, `a11y`)
- 🌐 **Internationalization** (`i18n`, `l10n`)

## 🏷️ Tag Naming Convention

- Use semantic versioning: `v1.2.3`
- Pre-releases: `v1.2.3-alpha.1`, `v1.2.3-beta.2`, `v1.2.3-rc.1`
- Always prefix with `v`

## 📚 Best Practices

### For Better Release Notes

1. **Use descriptive PR titles** - they become part of the release notes
2. **Add proper labels** to PRs for categorization
3. **Link issues** in PR descriptions using `closes #123`
4. **Write clear commit messages** following conventional commits

### Example Commit Messages
```
feat: add dark mode toggle to navigation
fix: resolve mobile menu overflow issue
docs: update installation instructions
chore: update dependencies
perf: optimize image loading performance
```

### Example PR Labels
- Add `feature` label for new functionality
- Add `bug` label for fixes
- Add `breaking-change` label for breaking changes
- Add `security` label for security updates

## 🔧 Configuration Files

### `.github/release.yml`
Configures how GitHub generates automatic release notes:
- Defines categories and their associated labels
- Excludes certain labels from release notes
- Customizes the release notes format

### `.github/workflows/release.yml`
The GitHub Actions workflow that:
- Triggers on tag pushes matching `v*`
- Creates releases with enhanced notes
- Adds project statistics and links

## 📊 Release Analytics

Each release includes:
- **Commit count** since last release
- **Contributors** who participated
- **Files changed** in recent commits
- **Direct links** to documentation and resources

## 🚀 Post-Release

After a release is created:
1. ✅ GitHub release is published automatically
2. ✅ Release notes are enhanced with statistics
3. ✅ Latest tag is marked appropriately
4. 📢 Consider announcing on social media or blog
5. 📧 Notify stakeholders if it's a major release

## 🔍 Monitoring

- **GitHub Actions**: Monitor workflow runs at `/actions`
- **Releases**: View all releases at `/releases`
- **Tags**: View all tags at `/tags`

## 🆘 Troubleshooting

### Release Workflow Fails
1. Check GitHub Actions logs
2. Ensure the tag follows `v*` pattern
3. Verify repository permissions
4. Check if the tag already exists

### Missing Release Notes
1. Ensure PRs have proper titles and labels
2. Check that commits have descriptive messages
3. Verify the release.yml configuration

### Pre-release Detection
Pre-releases are automatically detected if the tag contains:
- `alpha`
- `beta` 
- `rc`

Example: `v1.2.3-beta.1` will be marked as a pre-release.

---

*This release process ensures consistent, professional releases with comprehensive documentation and proper versioning.*