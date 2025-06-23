# TechIsh Thoughts Hugo Theme

A modern, performance-optimized Hugo theme designed for tech blogs with React components, TypeScript, and comprehensive testing. Built from a battle-tested blog with 70% faster CI/CD pipeline and 95+ Lighthouse scores.

## ✨ Key Features

### 🚀 Performance & Optimization
- **Lighthouse Scores**: 95+ across all metrics
- **Ultra-fast CI/CD**: 2-3 minutes (70% faster than typical)
- **Pre-commit hooks**: Instant developer feedback
- **Optimized builds**: Vite + modern bundling

### 🎯 Modern Tech Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for lightning-fast builds
- **Vitest + Playwright** for comprehensive testing
- **ESLint + Prettier** for code quality

### 🔍 Advanced Features
- **Fuzzy Search**: Powered by Fuse.js
- **Text-to-Speech**: Accessibility-first audio
- **Multi-Author Support**: Rich author profiles
- **Dark/Light Mode**: Seamless theme switching
- **Social Sharing**: Built-in social integration
- **Tag Management**: Interactive tag system

### ♿ Accessibility & Quality
- **WCAG 2.1 AA** compliant
- **108+ Tests** with 85%+ coverage
- **Mobile-first** responsive design
- **Keyboard navigation** support
- **Screen reader** optimized

## 🚀 Quick Start

### Prerequisites

- **Hugo** 0.147.5+ (extended version)
- **Node.js** 18+
- **npm** 9+

### Installation

1. **Create a new Hugo site**:
   ```bash
   hugo new site my-blog
   cd my-blog
   ```

2. **Add the theme**:
   ```bash
   # As a Git submodule (recommended)
   git submodule add https://github.com/techishthoughts/techish-hugo-theme.git themes/techish-thoughts

   # Or clone directly
   git clone https://github.com/techishthoughts/techish-hugo-theme.git themes/techish-thoughts
   ```

3. **Copy example configuration**:
   ```bash
   cp themes/techish-thoughts/exampleSite/hugo.toml .
   cp -r themes/techish-thoughts/exampleSite/content/* content/
   cp -r themes/techish-thoughts/exampleSite/data/* data/
   ```

4. **Install dependencies**:
   ```bash
   cd themes/techish-thoughts
   npm install
   cd ../..
   ```

5. **Start development**:
   ```bash
   hugo server -D --themesDir themes --theme techish-thoughts
   ```

Visit `http://localhost:1313` to see your site!

## ⚙️ Configuration

### Basic Configuration

```toml
# hugo.toml
baseURL = "https://yourdomain.com"
languageCode = "en-us"
title = "Your Tech Blog"
theme = "techish-thoughts"

[params]
  description = "Your blog description"
  author = "Your Name"

  # Social links
  [params.social]
    twitter = "yourusername"
    github = "yourusername"
    linkedin = "yourusername"

  # Features
  [params.features]
    search = true
    textToSpeech = true
    darkMode = true
    socialSharing = true
```

### Multi-Author Setup

Create `data/authors.json`:

```json
{
  "john-doe": {
    "name": "John Doe",
    "bio": "Senior Software Engineer specializing in React and TypeScript",
    "avatar": "/images/authors/john-doe.jpg",
    "social": {
      "twitter": "johndoe",
      "github": "johndoe",
      "linkedin": "johndoe"
    },
    "expertise": ["React", "TypeScript", "Node.js"]
  }
}
```

### Menu Configuration

```toml
[[menu.main]]
  name = "Home"
  url = "/"
  weight = 1

[[menu.main]]
  name = "Posts"
  url = "/posts/"
  weight = 2

[[menu.main]]
  name = "About"
  url = "/about/"
  weight = 3
```

## 📝 Content Creation

### Creating Posts

```bash
hugo new posts/my-awesome-post.md
```

Example frontmatter:

```yaml
---
title: "My Awesome Tech Post"
date: 2024-01-20T10:00:00Z
draft: false
author: "john-doe"
tags: ["react", "typescript", "performance"]
categories: ["development"]
description: "Learn about awesome tech stuff"
image: "/images/posts/my-awesome-post.jpg"
---

Your content here...
```

### Author Pages

Authors are automatically generated from `data/authors.json`. Each author gets:
- Dedicated author page
- List of their posts
- Social links and bio
- Expertise tags

## 🎨 Customization

### Styling

The theme uses Tailwind CSS. Customize by:

1. **Override CSS variables**:
   ```css
   /* assets/css/custom.css */
   :root {
     --primary-color: #your-color;
     --secondary-color: #your-color;
   }
   ```

2. **Extend Tailwind config**:
   ```js
   // tailwind.config.js
   module.exports = {
     theme: {
       extend: {
         colors: {
           brand: '#your-color'
         }
       }
     }
   }
   ```

### React Components

Add custom React components in `assets/js/components/`:

```typescript
// assets/js/components/MyComponent.tsx
interface MyComponentProps {
  title: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return <div className="my-component">{title}</div>;
};
```

## 🧪 Development

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### Testing

```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Pre-commit Hooks

The theme includes comprehensive pre-commit hooks:

- **ESLint + Prettier**: Code formatting
- **TypeScript**: Type checking
- **Tests**: Unit test suite
- **Security**: npm audit
- **Content validation**: Authors and frontmatter

## 📊 Performance Metrics

### Lighthouse Scores
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 95+
- **SEO**: 100

### Build Performance
- **CI/CD Pipeline**: 2-3 minutes
- **70% faster** than typical Hugo themes
- **Pre-commit hooks**: Instant feedback

### Testing Coverage
- **108+ tests** across unit, integration, and E2E
- **85%+ code coverage**
- **Automated testing** in CI/CD

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm run test`
5. **Commit with conventional commits**: `git commit -m "feat: add amazing feature"`
6. **Push and create PR**

## 📄 License

This theme is licensed under the [MIT License](LICENSE).

## 🆘 Support

- **Documentation**: Check this README and [Hugo docs](https://gohugo.io/documentation/)
- **Issues**: [GitHub Issues](https://github.com/techishthoughts/techish-hugo-theme/issues)
- **Discussions**: [GitHub Discussions](https://github.com/techishthoughts/techish-hugo-theme/discussions)
- **Community**: Join our Discord (link coming soon)

## 🙏 Acknowledgments

Built with love by the TechIsh Thoughts community. Special thanks to:

- **Hugo team** for the amazing static site generator
- **React team** for the component framework
- **Tailwind CSS** for the utility-first CSS
- **All contributors** who make this theme better

## 🚀 What's Next?

- [ ] **Plugin system** for easy extensions
- [ ] **More React components** for rich content
- [ ] **Advanced analytics** integration
- [ ] **Newsletter subscription** component
- [ ] **Comment system** integration
- [ ] **PWA support** for offline reading

---

**Made with ❤️ by the TechIsh Thoughts Community**

Star ⭐ this repo if you find it useful!
