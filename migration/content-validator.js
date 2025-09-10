#!/usr/bin/env node

/**
 * Content Validation and QA Process
 *
 * Validates migrated content for quality, completeness, and Hugo compatibility
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

class ContentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.validationRules = new Map();
    this.stats = {
      totalPosts: 0,
      validPosts: 0,
      postsWithErrors: 0,
      postsWithWarnings: 0,
    };

    this.setupValidationRules();
  }

  /**
   * Setup validation rules for different content aspects
   */
  setupValidationRules() {
    // Frontmatter validation rules
    this.validationRules.set('frontmatter', {
      required: ['title', 'date', 'draft', 'author'],
      recommended: ['description', 'tags', 'categories', 'image'],
      dateFormat: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/,
      slugFormat: /^[a-z0-9-]+$/,
    });

    // Content validation rules
    this.validationRules.set('content', {
      minWordCount: 100,
      maxWordCount: 10000,
      requiredSections: [],
      forbiddenPatterns: [
        /subscribe\s+to\s+my\s+newsletter/i,
        /substack\.com/i,
        /leave\s+a\s+comment\s+below/i,
      ],
    });

    // Image validation rules
    this.validationRules.set('images', {
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
      maxSize: 5 * 1024 * 1024, // 5MB
      requiredAltText: true,
    });

    // Link validation rules
    this.validationRules.set('links', {
      checkExternalLinks: false, // Set to true for full validation
      allowedDomains: ['localhost', 'techishthoughts.com', 'github.com'],
      internalLinkPattern: /^(\/|\.\/|\.\.\/)/,
    });
  }

  /**
   * Validate a single post file
   */
  async validatePost(filePath) {
    const postErrors = [];
    const postWarnings = [];

    try {
      const content = await fs.readFile(filePath, 'utf8');
      const { data: frontmatter, content: body } = matter(content);

      // Validate frontmatter
      const frontmatterIssues = this.validateFrontmatter(frontmatter, filePath);
      postErrors.push(...frontmatterIssues.errors);
      postWarnings.push(...frontmatterIssues.warnings);

      // Validate content body
      const contentIssues = this.validateContent(body, filePath);
      postErrors.push(...contentIssues.errors);
      postWarnings.push(...contentIssues.warnings);

      // Validate images
      const imageIssues = await this.validateImages(body, filePath);
      postErrors.push(...imageIssues.errors);
      postWarnings.push(...imageIssues.warnings);

      // Validate links
      const linkIssues = this.validateLinks(body, filePath);
      postErrors.push(...linkIssues.errors);
      postWarnings.push(...linkIssues.warnings);

      // Update statistics
      this.stats.totalPosts++;
      if (postErrors.length === 0) {
        this.stats.validPosts++;
      } else {
        this.stats.postsWithErrors++;
      }
      if (postWarnings.length > 0) {
        this.stats.postsWithWarnings++;
      }

      return {
        file: filePath,
        errors: postErrors,
        warnings: postWarnings,
        isValid: postErrors.length === 0,
      };
    } catch (error) {
      const errorMsg = `Failed to process file: ${error.message}`;
      postErrors.push(errorMsg);
      this.stats.postsWithErrors++;

      return {
        file: filePath,
        errors: [errorMsg],
        warnings: [],
        isValid: false,
      };
    }
  }

  /**
   * Validate frontmatter structure and content
   */
  validateFrontmatter(frontmatter, filePath) {
    const errors = [];
    const warnings = [];
    const rules = this.validationRules.get('frontmatter');

    // Check required fields
    for (const field of rules.required) {
      if (!frontmatter[field]) {
        errors.push(`Missing required frontmatter field: ${field}`);
      }
    }

    // Check recommended fields
    for (const field of rules.recommended) {
      if (!frontmatter[field]) {
        warnings.push(`Missing recommended frontmatter field: ${field}`);
      }
    }

    // Validate date format
    if (frontmatter.date && !rules.dateFormat.test(frontmatter.date)) {
      errors.push(
        `Invalid date format: ${frontmatter.date}. Expected ISO 8601 format.`
      );
    }

    // Validate slug format
    if (frontmatter.slug && !rules.slugFormat.test(frontmatter.slug)) {
      errors.push(
        `Invalid slug format: ${frontmatter.slug}. Use lowercase letters, numbers, and hyphens only.`
      );
    }

    // Validate title length
    if (frontmatter.title && frontmatter.title.length > 100) {
      warnings.push(
        `Title is very long (${frontmatter.title.length} chars). Consider shortening for SEO.`
      );
    }

    // Validate description length
    if (frontmatter.description) {
      if (frontmatter.description.length < 50) {
        warnings.push(
          'Description is shorter than recommended (50+ chars) for SEO.'
        );
      }
      if (frontmatter.description.length > 160) {
        warnings.push(
          'Description exceeds recommended length (160 chars) for SEO.'
        );
      }
    }

    // Validate tags
    if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
      if (frontmatter.tags.length > 10) {
        warnings.push(
          `Too many tags (${frontmatter.tags.length}). Consider limiting to 5-7 tags.`
        );
      }

      for (const tag of frontmatter.tags) {
        if (typeof tag !== 'string' || tag.length < 2) {
          errors.push(
            `Invalid tag: ${tag}. Tags must be strings with at least 2 characters.`
          );
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate content body
   */
  validateContent(content, filePath) {
    const errors = [];
    const warnings = [];
    const rules = this.validationRules.get('content');

    // Word count validation
    const wordCount = content
      .split(/\s+/)
      .filter(word => word.length > 0).length;

    if (wordCount < rules.minWordCount) {
      warnings.push(
        `Content is quite short (${wordCount} words). Consider expanding for better SEO.`
      );
    }

    if (wordCount > rules.maxWordCount) {
      warnings.push(
        `Content is very long (${wordCount} words). Consider breaking into multiple posts.`
      );
    }

    // Check for forbidden patterns (Substack-specific content)
    for (const pattern of rules.forbiddenPatterns) {
      if (pattern.test(content)) {
        warnings.push(
          `Found Substack-specific content that should be removed: ${pattern.source}`
        );
      }
    }

    // Check for common markdown issues
    const markdownIssues = this.validateMarkdown(content);
    errors.push(...markdownIssues.errors);
    warnings.push(...markdownIssues.warnings);

    return { errors, warnings };
  }

  /**
   * Validate markdown syntax
   */
  validateMarkdown(content) {
    const errors = [];
    const warnings = [];

    // Check for unmatched code blocks
    const codeBlockMatches = content.match(/```/g);
    if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
      errors.push('Unmatched code block delimiters (```)');
    }

    // Check for heading structure
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
    if (headings.length === 0) {
      warnings.push(
        'No headings found. Consider adding structure with headings.'
      );
    }

    // Check for empty links
    const emptyLinks = content.match(/\[([^\]]*)\]\(\s*\)/g);
    if (emptyLinks) {
      errors.push(
        `Found ${emptyLinks.length} empty link(s): ${emptyLinks.join(', ')}`
      );
    }

    // Check for malformed links
    const malformedLinks = content.match(/\[([^\]]*)\]\([^)]*$/gm);
    if (malformedLinks) {
      errors.push(`Found ${malformedLinks.length} malformed link(s)`);
    }

    return { errors, warnings };
  }

  /**
   * Validate images in content
   */
  async validateImages(content, filePath) {
    const errors = [];
    const warnings = [];
    const rules = this.validationRules.get('images');

    // Find all image references
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const images = [];
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      images.push({
        alt: match[1],
        src: match[2],
        full: match[0],
      });
    }

    for (const image of images) {
      // Check alt text
      if (!image.alt || image.alt.trim().length === 0) {
        warnings.push(`Image missing alt text: ${image.src}`);
      }

      // Check if image is local and exists
      if (image.src.startsWith('/') || image.src.startsWith('./')) {
        try {
          const imagePath = path.resolve(
            path.dirname(filePath),
            image.src.startsWith('/') ? `.${image.src}` : image.src
          );

          await fs.access(imagePath);

          // Check file size
          const stats = await fs.stat(imagePath);
          if (stats.size > rules.maxSize) {
            warnings.push(
              `Large image file (${Math.round(stats.size / 1024)}KB): ${image.src}`
            );
          }
        } catch (error) {
          errors.push(`Image not found: ${image.src}`);
        }
      }

      // Check file extension
      const ext = path.extname(image.src).toLowerCase();
      if (ext && !rules.allowedExtensions.includes(ext)) {
        warnings.push(`Unsupported image format ${ext}: ${image.src}`);
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate links in content
   */
  validateLinks(content, filePath) {
    const errors = [];
    const warnings = [];
    const rules = this.validationRules.get('links');

    // Find all links
    const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    const links = [];
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      links.push({
        text: match[1],
        url: match[2],
        full: match[0],
      });
    }

    for (const link of links) {
      // Check for empty URLs
      if (!link.url.trim()) {
        errors.push(`Empty link URL: ${link.text}`);
        continue;
      }

      // Check internal links
      if (rules.internalLinkPattern.test(link.url)) {
        // Validate internal link paths
        if (link.url.startsWith('/posts/') && !link.url.endsWith('/')) {
          warnings.push(`Internal link should end with '/': ${link.url}`);
        }
      }

      // Check for suspicious external links
      if (link.url.includes('substack.com')) {
        warnings.push(`Substack link that may need updating: ${link.url}`);
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate all posts in content directory
   */
  async validateAllPosts(contentDir = 'content/posts') {
    const results = [];

    try {
      const files = await this.getMarkdownFiles(contentDir);

      console.log(`🔍 Validating ${files.length} post files...`);

      for (const file of files) {
        console.log(`Validating: ${path.basename(file)}`);
        const result = await this.validatePost(file);
        results.push(result);

        // Add to global collections
        this.errors.push(...result.errors.map(err => ({ file, error: err })));
        this.warnings.push(
          ...result.warnings.map(warn => ({ file, warning: warn }))
        );
      }

      return results;
    } catch (error) {
      console.error('❌ Error during validation:', error);
      throw error;
    }
  }

  /**
   * Get all markdown files in directory
   */
  async getMarkdownFiles(dir) {
    const files = [];

    async function scanDir(currentDir) {
      const items = await fs.readdir(currentDir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(currentDir, item.name);

        if (item.isDirectory()) {
          await scanDir(fullPath);
        } else if (item.isFile() && path.extname(item.name) === '.md') {
          files.push(fullPath);
        }
      }
    }

    await scanDir(dir);
    return files;
  }

  /**
   * Generate validation report
   */
  async generateReport(results, outputPath = 'content-validation-report.json') {
    const report = {
      timestamp: new Date().toISOString(),
      statistics: this.stats,
      summary: {
        totalFiles: results.length,
        validFiles: results.filter(r => r.isValid).length,
        filesWithErrors: results.filter(r => r.errors.length > 0).length,
        filesWithWarnings: results.filter(r => r.warnings.length > 0).length,
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
      },
      results,
      errors: this.errors,
      warnings: this.warnings,
      recommendations: this.generateRecommendations(),
    };

    await fs.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📋 Validation report saved to: ${outputPath}`);

    return report;
  }

  /**
   * Generate recommendations based on validation results
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.stats.postsWithErrors > 0) {
      recommendations.push({
        type: 'critical',
        message: `${this.stats.postsWithErrors} posts have validation errors that must be fixed before publishing.`,
      });
    }

    if (this.stats.postsWithWarnings > 0) {
      recommendations.push({
        type: 'warning',
        message: `${this.stats.postsWithWarnings} posts have warnings that should be reviewed for better SEO and user experience.`,
      });
    }

    // Analyze common error patterns
    const errorPatterns = {};
    this.errors.forEach(({ error }) => {
      const key = error.split(':')[0];
      errorPatterns[key] = (errorPatterns[key] || 0) + 1;
    });

    const topErrors = Object.entries(errorPatterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    if (topErrors.length > 0) {
      recommendations.push({
        type: 'info',
        message: `Most common errors: ${topErrors.map(([error, count]) => `${error} (${count})`).join(', ')}`,
      });
    }

    return recommendations;
  }

  /**
   * Print validation summary to console
   */
  printSummary(results) {
    console.log('\n📊 CONTENT VALIDATION SUMMARY');
    console.log('================================');
    console.log(`Total posts: ${this.stats.totalPosts}`);
    console.log(`Valid posts: ${this.stats.validPosts} ✅`);
    console.log(`Posts with errors: ${this.stats.postsWithErrors} ❌`);
    console.log(`Posts with warnings: ${this.stats.postsWithWarnings} ⚠️`);
    console.log(`Total errors: ${this.errors.length}`);
    console.log(`Total warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ CRITICAL ERRORS:');
      this.errors.slice(0, 10).forEach(({ file, error }) => {
        console.log(`  ${path.basename(file)}: ${error}`);
      });
      if (this.errors.length > 10) {
        console.log(`  ... and ${this.errors.length - 10} more errors`);
      }
    }

    console.log('\n✅ Validation completed!');
  }

  /**
   * Main execution function
   */
  async execute(contentDir = 'content/posts') {
    try {
      console.log('🚀 Starting content validation...');

      const results = await this.validateAllPosts(contentDir);
      const report = await this.generateReport(results);

      this.printSummary(results);

      return report;
    } catch (error) {
      console.error('❌ Content validation failed:', error);
      throw error;
    }
  }
}

// Export for use in other scripts
export default ContentValidator;

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ContentValidator();
  const contentDir = process.argv[2] || 'content/posts';

  validator.execute(contentDir).catch(console.error);
}
