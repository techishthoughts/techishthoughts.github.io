# Tech.ish Thoughts

> A modern, performant multi-author tech blog with advanced search capabilities, text-to-speech features, and interactive components.

[![Build Status](https://github.com/techishthoughts/techishthoughts.github.io/workflows/Hugo%20CI/CD%20-%20Multi-Author%20Blog/badge.svg)](https://github.com/techishthoughts/techishthoughts.github.io/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Hugo](https://img.shields.io/badge/Hugo-0.147.5-ff4088.svg)](https://gohugo.io/)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)](https://reactjs.org/)

## 🚀 Live Demo

Visit [techishthoughts.github.io](https://techishthoughts.github.io) to see the blog in action.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Getting Started](#getting-started)
- [Development Guide](#development-guide)
- [Writing Articles](#writing-articles)
- [Contributing](#contributing)
- [Deployment](#deployment)
- [Performance](#performance)
- [Testing](#testing)

## 🛠 Tech Stack

### Core Technologies

- **[Hugo](https://gohugo.io/)** - Static site generator for blazing-fast builds
- **[React](https://reactjs.org/)** - Interactive UI components
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Modern build tool and dev server

### Frontend Stack

- **[Chakra UI](https://chakra-ui.com/)** - Component library and design system
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[React Query](https://tanstack.com/query/latest)** - Server state management
- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management
- **[Fuse.js](https://fusejs.io/)** - Fuzzy search implementation

### Development Tools

- **[Vitest](https://vitest.dev/)** - Unit testing framework
- **[Playwright](https://playwright.dev/)** - E2E testing
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Husky](https://github.com/typicode/husky)** - Git hooks

### CI/CD & Deployment

- **GitHub Actions** - Automated testing and deployment
- **GitHub Pages** - Static site hosting
- **Dependabot** - Automated dependency updates

## 🏗 Architecture

### System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Hugo (SSG)    │    │  React (SPA)    │    │  GitHub Pages   │
│                 │    │                 │    │                 │
│ • Content Gen   │    │ • Interactive   │    │ • Static Host   │
│ • Templates     │────│   Components    │────│ • CDN           │
│ • Static Files  │    │ • Search        │    │ • SSL           │
│ • SEO           │    │ • Comments      │    │ • Custom Domain │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Project Structure

```
techishthoughts.github.io/
├── assets/js/                 # React components and logic
│   ├── components/
│   │   ├── features/         # Feature components
│   │   │   ├── CommentsSection.tsx
│   │   │   ├── SocialActions.tsx
│   │   │   └── TagManager.tsx
│   │   ├── ui/              # Reusable UI components
│   │   └── layout/          # Layout components
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand state stores
│   ├── services/            # API services
│   ├── types/               # TypeScript definitions
│   └── utils/               # Utility functions
├── content/                 # Hugo content
│   └── posts/              # Blog posts (Markdown)
├── layouts/                # Hugo templates
├── static/                 # Static assets
├── data/                   # Site data (authors, etc.)
└── .github/workflows/      # CI/CD pipelines
```

### Component Architecture

```
App (Hugo Template)
├── Header
│   ├── Navigation
│   └── Search Bar (React)
├── Main Content
│   ├── Article Content (Hugo)
│   ├── Text-to-Speech (React)
│   ├── Social Actions (React)
│   └── Comments Section (React)
└── Footer
    └── Social Links (React)
```

## ✨ Features

### 🔍 Advanced Search

- **Fuzzy Search**: Powered by Fuse.js for intelligent matching
- **Real-time Results**: Instant search-as-you-type
- **Content Indexing**: Searches through titles, content, tags, and authors
- **Keyboard Navigation**: Arrow keys and Enter for navigation

### 👥 Multi-Author Support

- **Author Profiles**: Rich author information with avatars
- **Author Pages**: Dedicated pages for each contributor
- **Social Links**: GitHub, Twitter, LinkedIn integration
- **Author Validation**: Automated validation of author data

### 🎧 Text-to-Speech

- **Article Narration**: Listen to articles with natural voice
- **Playback Controls**: Play, pause, speed adjustment
- **Voice Selection**: Multiple voice options
- **Mobile Optimized**: Works across all devices

### 💬 Comments System

- **Local Storage**: Comments persist locally
- **Like System**: Upvote/downvote functionality
- **Responsive Design**: Mobile-first approach
- **Moderation**: Built-in moderation capabilities

### 🏷 Dynamic Tagging

- **Tag Management**: Add, edit, delete tags
- **Tag Filtering**: Filter content by tags
- **Tag Validation**: Prevent duplicate tags
- **Tag Analytics**: Track tag usage

### 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Touch-Friendly**: Large touch targets
- **Fast Loading**: Optimized images and assets
- **Accessibility**: WCAG 2.1 compliant

### 🚀 Performance

- **Static Generation**: Pre-built HTML for speed
- **Code Splitting**: Lazy-loaded components
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Aggressive caching strategies

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Hugo**: >= 0.147.0
- **Git**: For version control

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/techishthoughts/techishthoughts.github.io.git
   cd techishthoughts.github.io
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development servers**

   ```bash
   # Terminal 1: Hugo development server
   npm run hugo:dev

   # Terminal 2: Vite development server (for React components)
   npm run dev
   ```

4. **Open in browser**
   - Hugo site: http://localhost:1313
   - Vite dev server: http://localhost:5173

### Development Workflow

```bash
# Start both servers in watch mode
npm run hugo:dev    # Hugo server with live reload
npm run watch       # Vite build in watch mode

# Run tests
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests

# Linting and formatting
npm run lint        # ESLint
npm run format      # Prettier
npm run type-check  # TypeScript
```

## 🖥 Development Guide

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with React rules
- **Prettier**: Consistent code formatting
- **Import Order**: Absolute imports preferred

### State Management

- **Zustand**: For global state (comments, search, etc.)
- **React Query**: For server state and caching
- **Local Storage**: For persistence

### Component Guidelines

```typescript
// Example component structure
import React from 'react';
import { Box, Button } from '@chakra-ui/react';

interface Props {
  title: string;
  onClick: () => void;
}

export const MyComponent: React.FC<Props> = ({ title, onClick }) => {
  return (
    <Box>
      <Button onClick={onClick}>
        {title}
      </Button>
    </Box>
  );
};
```

### Testing Strategy

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Coverage**: Maintain >80% code coverage

### Performance Best Practices

- **Code Splitting**: Use dynamic imports for large components
- **Memoization**: Use React.memo and useMemo appropriately
- **Bundle Analysis**: Regular bundle size monitoring
- **Lighthouse**: Performance auditing

## ✍️ Writing Articles

### Article Structure

Create a new article in `content/posts/` with proper frontmatter:

```markdown
---
# Required fields
title: 'Your Article Title'
date: 2024-01-15T10:00:00Z
draft: false
authors: ['john-doe']

# Optional fields
description: 'Brief description of your article'
categories: ['technology', 'programming']
tags: ['react', 'typescript', 'web-development']
image: '/images/your-article-image.jpg'
---

Your article content here...
```

### Frontmatter Fields

| Field         | Required | Description                   |
| ------------- | -------- | ----------------------------- |
| `title`       | ✅       | Article title (SEO optimized) |
| `date`        | ✅       | Publication date (ISO 8601)   |
| `draft`       | ✅       | Set to `false` to publish     |
| `authors`     | ✅       | Array of author IDs           |
| `description` | ❌       | Meta description for SEO      |
| `categories`  | ❌       | Article categories            |
| `tags`        | ❌       | Article tags                  |
| `image`       | ❌       | Featured image path           |

### Author Setup

1. **Add author to `data/authors.json`**:

   ```json
   {
     "id": "john-doe",
     "name": "John Doe",
     "bio": "Software engineer passionate about web technologies",
     "avatar": "/images/authors/john-doe.jpg",
     "social": {
       "github": "https://github.com/johndoe",
       "twitter": "https://twitter.com/johndoe",
       "linkedin": "https://linkedin.com/in/johndoe"
     }
   }
   ```

2. **Add author avatar**:
   Place author image in `static/images/authors/`

### Writing Guidelines

#### Content Structure

```markdown
# Title (H1 - automatic from frontmatter)

Brief introduction paragraph...

## Section 1 (H2)

Main content sections...

### Subsection (H3)

Detailed explanations...

## Code Examples

Use syntax highlighting...

## Conclusion

Wrap up your thoughts...
```

#### Code Blocks

```typescript
// Example TypeScript code
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};
```

#### Images

```markdown
![Alt text](/images/your-image.jpg)
```

#### Internal Links

```markdown
[Link to another post]({{< ref "another-post.md" >}})
```

#### Callouts

```markdown
> 💡 **Tip**: Use callouts for important information
>
> ⚠️ **Warning**: Critical information
>
> 📝 **Note**: Additional context
```

### SEO Optimization

- **Keywords**: Include relevant keywords naturally
- **Meta Description**: Write compelling descriptions
- **Headings**: Use proper heading hierarchy
- **Alt Text**: Descriptive image alt text
- **Internal Linking**: Link to related content

### Content Validation

The system automatically validates:

- **Author Existence**: Authors must exist in `data/authors.json`
- **Frontmatter Format**: Required fields must be present
- **Date Format**: ISO 8601 format required
- **Markdown Syntax**: Proper markdown formatting

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

### Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat: add search functionality"

# Bug fixes
git commit -m "fix: resolve mobile navigation issue"

# Documentation
git commit -m "docs: update README with API examples"

# Refactoring
git commit -m "refactor: improve component structure"
```

### Pull Request Process

1. **Code Review**: All PRs require review
2. **Tests**: Must pass all tests
3. **Documentation**: Update docs if needed
4. **Changelog**: Notable changes documented

### Code of Conduct

- Be respectful and inclusive
- Follow coding standards
- Write meaningful commit messages
- Add tests for new features

## 🚀 Deployment

### Automatic Deployment

- **Push to main**: Triggers GitHub Actions
- **Build Process**: Hugo + Vite build
- **Testing**: Automated test suite
- **Deploy**: GitHub Pages deployment

### Manual Deployment

```bash
# Build production assets
npm run build:all

# Deploy to GitHub Pages
git add -A
git commit -m "feat: deploy updates"
git push origin main
```

### Environment Variables

No environment variables required for basic deployment.

## 📊 Performance

### Metrics

- **Lighthouse Score**: 95+ across all categories
- **Core Web Vitals**: Excellent ratings
- **Bundle Size**: < 500KB compressed
- **Load Time**: < 2s on 3G

### Optimization Techniques

- **Static Generation**: Pre-built HTML
- **Code Splitting**: Lazy-loaded components
- **Image Optimization**: WebP with fallbacks
- **Caching**: Service worker caching

## 🧪 Testing

### Test Structure

```
assets/js/test/
├── unit/              # Unit tests
├── integration/       # Integration tests
└── e2e/              # End-to-end tests
```

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test Examples

```typescript
// Unit test example
import { render, screen } from '@testing-library/react';
import { SocialActions } from '../SocialActions';

test('renders social actions', () => {
  render(<SocialActions postId="123" postTitle="Test" postUrl="/test" />);
  expect(screen.getByText('Share')).toBeInTheDocument();
});
```

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [Hugo](https://gohugo.io/) for the amazing static site generator
- [React](https://reactjs.org/) for the component framework
- [Chakra UI](https://chakra-ui.com/) for the design system
- All contributors who help improve this project

---

**Made with ❤️ by the Tech.ish Thoughts Community**
