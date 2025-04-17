# Tech.ish Thoughts Blog

A collaborative tech blog built with [Hugo](https://gohugo.io/), featuring multiple authors, a modern look, and a fast React+Chakra UI search experience.

---

## 🚀 Quick Start

### Prerequisites

- [Hugo (Extended version)](https://gohugo.io/getting-started/installing/)
- [Node.js](https://nodejs.org/) (for React search)
- [Git](https://git-scm.com/)
- [Make](https://www.gnu.org/software/make/) (optional, for convenience)

### Local Development

1. **Clone the repository**

    ```bash
    git clone https://github.com/techishthoughts/techishthoughts.github.io.git
    cd techishthoughts.github.io
    ```

2. **Install dependencies**
  **Note:** If you are using `npm` instead of `yarn`, you can skip this step.

    ```bash
    make install
    ```

    or

    ```bash
    npm install
    ```

3. **Build React components**

    ```bash
    npm run build
    ```

4. **Start the Hugo server**

    ```bash
    make serve
    ```

    or

    ```bash
    hugo server -D
    ```

5. **View the site**
    - Open [http://localhost:1313](http://localhost:1313) in your browser to view the site.

---

## 📝 Creating Content

### New Post

Using Make:

```bash
make new-post POST_NAME="my-new-post" AUTHOR="your-author-id"
```

Manually:

```bash
hugo new content/posts/my-new-post.md
```

```makefile
Front Matter Template
---
title: "Your Post Title"
date: 2025-04-15
author: your-author-id
draft: true
tags: ["tag1", "tag2"]
---
```

👥 Multi-Author Support

Create your author profile in data/authors/

Example: data/authors/your-author-id.yaml

```yaml
name: Your Name
bio: "Your brief bio"
avatar: "https://avatars.githubusercontent.com/u/yourid" # or "/images/authors/your-avatar.jpg"
social:
  linkedin: "in/your-linkedin"
  github: "yourhandle"
```

Add your avatar.

Use a local image in static/images/authors/ or a remote URL.

Reference your author ID in the post front matter.

🔎 Search
The blog features a fast, client-side search powered by React and Chakra UI.
Search is available at the top of every page.

🛠 Development
Available Make Commands:
**make serve** - Start local development server
**make build** - Build the site (React + Hugo)
**make clean** - Clean build and static files
**make new-post** - Create a new post
**make install** - Install Node.js dependencies
**make help** - Show all available commands

Project Structure

```bash
./
├── archetypes/
├── assets/
│   └── js/
│       ├── main.tsx
│       └── search/
├── content/
│   └── posts/
├── data/
│   └── authors/
├── layouts/
│   ├── _default/
│   └── partials/
├── static/
│   └── images/
│       └── authors/
├── .github/workflows/
├── hugo.toml
├── package.json
├── tsconfig.json
├── vite.config.ts
└── Makefile
```

## 🚀 Deployment
The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The CI/CD pipeline:

- Validates: Markdown linting
- Builds: React components and Hugo site
- Releases: Creates a zipped release of the site
- Deploys: Publishes to GitHub Pages using the latest GitHub Actions Pages workflow

See .github/workflows/ for details

📜 License

MIT License

🤝 Support
Create an issue for bug reports or feature requests
Submit a pull request to contribute
Contact the maintainers for other inquiries
✨ Contributors

Thanks to all our contributors!

Built with ❤️ using Hugo and Chakra UI

---
