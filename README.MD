---
# Tech.ish Thoughts Blog

A collaborative tech blog built with Hugo, featuring multiple authors sharing their insights and experiences in technology.

## 🚀 Quick Start

### Prerequisites

- [Hugo](https://gohugo.io/installation/) (Extended version)
- Git
- Make (optional, but recommended)

### Local Development

1. **Clone the repository**

```bash
    git clone https://github.com/techishthoughts/techishthoughts.github.io.git
    cd techishthoughts.github.io
```

#### Start the Hugo server
```bash
make serve
```

#### or without Make:
```bash
hugo server -D
```


### View the site

```bash
Open http://localhost:1313
📝 Creating Content
New Post
```

#### Using Make:
```bash
make new-post POST_NAME="my-new-post" AUTHOR="your-author-id"
```

####Manually:
```bash
hugo new content/posts/my-new-post.md
```


### Front Matter Template
```markdown
---
title: "Your Post Title"
date: 2025-04-15
author: your-author-id
draft: true
tags: ["tag1", "tag2"]
---

👥 Contributing
Fork the repository
Create a new branch
git checkout -b feature/your-feature-name

Make your changes
Submit a pull request
Author Setup
Create your author profile in data/authors/
Add your avatar to static/images/authors/

Example author profile (data/authors/your-author-id.yaml):

name: Your Name
bio: "Your brief bio"
avatar: "/images/authors/your-avatar.jpg"
social:
  twitter: "yourhandle"
  github: "yourhandle"
```

### 🛠 Development
Available Make Commands
make serve - Start local development server
make build - Build the site
make clean - Clean build directory
make new-post - Create a new post
make check - Run validation checks
make help - Show all available commands

###Project Structure

```bash
./
├── archetypes/
├── content/
│   └── posts/
├── data/
│   └── authors/
├── static/
│   └── images/
│       └── authors/
├── themes/
│   └── techishthoughts/
├── config.toml
└── README.md
```

### 🚀 Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch.

CI/CD Pipeline
Validation: Markdown linting and link checking
Build: Hugo site generation
Release: Automatic versioning and release creation
Deploy: Publication to GitHub Pages
📜 License

MIT License

🤝 Support
Create an issue for bug reports or feature requests
Submit a pull request to contribute
Contact the maintainers for other inquiries
✨ Contributors

Thanks to all our contributors!

Built with ❤️ using Hugo