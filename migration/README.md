# Substack to Hugo Migration Scripts

Complete automated migration toolkit for transferring content from Substack to Hugo static site generator.

## 🎯 Overview

This migration toolkit provides a comprehensive solution for migrating from Substack to Hugo while preserving SEO, content quality, and user experience. The process includes content scraping, format conversion, SEO redirect setup, and quality validation.

## 📁 Files Structure

```
scripts/migration/
├── README.md                 # This documentation
├── run-migration.js         # Main orchestrator script
├── substack-scraper.js      # Scrapes Substack content
├── hugo-generator.js        # Converts to Hugo format
├── seo-redirects.js         # Generates redirect rules
├── content-validator.js     # Validates migrated content
└── package.json            # Dependencies (if needed)
```

## 🚀 Quick Start

### Prerequisites

```bash
# Ensure you have Node.js 18+ installed
node --version

# Install required dependencies
npm install jsdom axios gray-matter
```

### Basic Usage

```bash
# Run complete migration
node scripts/migration/run-migration.js

# Or run individual steps
node scripts/migration/substack-scraper.js
node scripts/migration/hugo-generator.js
node scripts/migration/seo-redirects.js
node scripts/migration/content-validator.js
```

## 📋 Migration Steps

### Step 1: Content Scraping

**File:** `substack-scraper.js`

- Scrapes all posts from Substack publication
- Extracts metadata, content, images, and author info
- Handles rate limiting and error recovery
- Saves raw data to `scraped-content.json`

**Features:**

- 🔄 Rate limiting (2-second delays)
- 🖼️ Image URL extraction
- 📝 Rich text content preservation
- 👤 Author information mapping
- 🏷️ Category and tag detection

### Step 2: Hugo Content Generation

**File:** `hugo-generator.js`

- Converts scraped content to Hugo markdown format
- Generates proper frontmatter with SEO metadata
- Processes images and code blocks
- Creates content structure compatible with Hugo

**Generated Content:**

```yaml
---
title: 'Post Title'
date: 2024-01-15T10:00:00Z
draft: false
author: 'Author Name'
description: 'SEO description'
tags: ['tech', 'programming']
categories: ['Technology']
image: '/images/post-cover.jpg'
slug: 'post-slug'
---
# Post content in markdown format
```

### Step 3: SEO Redirects

**File:** `seo-redirects.js`

- Generates redirect rules for all hosting platforms
- Preserves SEO rankings with 301 redirects
- Creates canonical URL mappings
- Generates updated sitemap and robots.txt

**Generated Files:**

- `static/_redirects` (Netlify)
- `static/.htaccess` (Apache)
- `nginx-redirects.conf` (Nginx)
- `url-mappings.json` (Search engine mappings)

### Step 4: Content Validation

**File:** `content-validator.js`

- Validates frontmatter completeness
- Checks content quality and structure
- Identifies broken links and missing images
- Generates quality report with recommendations

**Validation Rules:**

- ✅ Required frontmatter fields
- ✅ SEO optimization checks
- ✅ Content length analysis
- ✅ Image and link validation
- ✅ Markdown syntax verification

## ⚙️ Configuration

### Environment Variables

```bash
# Set your Hugo domain
export HUGO_DOMAIN="yourdomain.com"

# Customize scraping behavior
export SCRAPE_DELAY_MS=2000
export MAX_RETRIES=3
```

### Customizing Content Structure

Edit the frontmatter template in `hugo-generator.js`:

```javascript
const frontmatter = {
  title: post.title,
  date: post.publishedAt,
  draft: false,
  author: this.mapAuthor(post.author),
  // Add custom fields here
  custom_field: 'custom_value',
};
```

## 📊 Generated Reports

### Migration Report

`migration-final-report.json` - Comprehensive migration summary

```json
{
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T10:15:00Z",
  "duration": 900000,
  "stats": {
    "postsScraped": 6,
    "postsGenerated": 6,
    "redirectsGenerated": 12
  },
  "postMigrationChecklist": [...]
}
```

### Validation Report

`content-validation-report.json` - Content quality analysis

```json
{
  "summary": {
    "totalFiles": 6,
    "validFiles": 5,
    "filesWithErrors": 1,
    "totalErrors": 3,
    "totalWarnings": 8
  },
  "recommendations": [...]
}
```

## 🔧 Troubleshooting

### Common Issues

**1. Scraping Fails**

```bash
# Check network connectivity
curl -I https://techishthoughts.substack.com

# Increase delay between requests
export SCRAPE_DELAY_MS=5000
```

**2. Image Processing Errors**

```bash
# Ensure images directory exists
mkdir -p static/images/posts

# Check image URL accessibility
curl -I [image-url]
```

**3. Validation Errors**

```bash
# Run validator independently
node scripts/migration/content-validator.js content/posts

# Review specific error details
cat content-validation-report.json | jq '.errors'
```

**4. Redirect Issues**

```bash
# Test redirect rules
curl -I https://techishthoughts.substack.com/p/sample-post

# Validate redirect syntax
nginx -t -c nginx-redirects.conf
```

## 📈 Post-Migration Checklist

### Immediate Actions (High Priority)

- [ ] Deploy Hugo site to production
- [ ] Configure redirect rules on hosting platform
- [ ] Test all Substack URLs redirect properly
- [ ] Submit new sitemap to Google Search Console
- [ ] Submit new sitemap to Bing Webmaster Tools

### SEO Preservation (Medium Priority)

- [ ] Monitor 404 errors in search console
- [ ] Update social media profile links
- [ ] Contact major referring sites for link updates
- [ ] Set up Google Analytics goal tracking
- [ ] Monitor search rankings for key pages

### Content Quality (Ongoing)

- [ ] Review and fix validation errors
- [ ] Optimize images for web performance
- [ ] Update internal links and references
- [ ] Add missing alt text to images
- [ ] Remove Substack-specific language

## 🔍 Advanced Usage

### Custom Content Processing

```javascript
// Extend hugo-generator.js
class CustomHugoGenerator extends HugoGenerator {
  processContent(content) {
    // Add custom content transformations
    content = content.replace(/custom-pattern/g, 'replacement');
    return super.processContent(content);
  }
}
```

### Custom Validation Rules

```javascript
// Extend content-validator.js
this.validationRules.set('custom', {
  requiredPatterns: [/your-pattern/],
  forbiddenPatterns: [/unwanted-pattern/],
});
```

### Batch Processing

```bash
# Process multiple Substack publications
for url in substack1.com substack2.com; do
  SUBSTACK_URL=$url node scripts/migration/run-migration.js
done
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/improvement`
3. Make changes and test thoroughly
4. Submit pull request with detailed description

## 📄 License

MIT License - see project root for details

## 🆘 Support

- **Issues**: Report bugs via GitHub issues
- **Questions**: Check existing discussions or create new one
- **Documentation**: Refer to Hugo docs for site-specific questions

---

**Migration completed?** Don't forget to:

1. Archive your Substack content
2. Monitor traffic and rankings
3. Celebrate your new Hugo-powered site! 🎉
