#!/usr/bin/env node

/**
 * Substack Content Scraper
 * Extracts all posts from TechIsh Thoughts Substack for migration
 */

import { JSDOM } from 'jsdom';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SubstackScraper {
  constructor(substackUrl = 'https://techishthoughts.substack.com') {
    this.substackUrl = substackUrl;
    this.outputDir = path.join(__dirname, 'scraped-content');
  }

  async init() {
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  async scrapeArchive() {
    console.log('🔍 Fetching archive page...');
    const archiveUrl = `${this.substackUrl}/archive`;
    const response = await fetch(archiveUrl);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const posts = [];
    const postElements = document.querySelectorAll(
      '[data-testid="post-preview"]'
    );

    for (const element of postElements) {
      const post = await this.extractPostMetadata(element);
      if (post) {
        posts.push(post);
      }
    }

    console.log(`📚 Found ${posts.length} posts to migrate`);
    return posts;
  }

  async extractPostMetadata(element) {
    try {
      const titleElement = element.querySelector('h3 a');
      const title = titleElement?.textContent?.trim();
      const url = titleElement?.href;

      if (!title || !url) return null;

      const dateElement = element.querySelector('[datetime]');
      const publishDate = dateElement?.getAttribute('datetime');

      const excerptElement = element.querySelector('.pencraft');
      const excerpt = excerptElement?.textContent?.trim();

      return {
        title,
        url: url.startsWith('http') ? url : `${this.substackUrl}${url}`,
        publishDate,
        excerpt,
        slug: this.generateSlug(title),
      };
    } catch (error) {
      console.warn('⚠️ Error extracting post metadata:', error.message);
      return null;
    }
  }

  async scrapePost(postMeta) {
    console.log(`📄 Scraping: ${postMeta.title}`);

    try {
      const response = await fetch(postMeta.url);
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Extract main content
      const contentElement = document.querySelector('.available-content');
      const content = this.cleanHtmlContent(contentElement?.innerHTML || '');

      // Extract metadata
      const metadata = this.extractDetailedMetadata(document, postMeta);

      // Extract images
      const images = this.extractImages(document);

      // Extract code blocks
      const codeBlocks = this.extractCodeBlocks(document);

      const post = {
        ...postMeta,
        ...metadata,
        content,
        images,
        codeBlocks,
        wordCount: this.calculateWordCount(content),
        readingTime: this.calculateReadingTime(content),
      };

      // Save individual post
      await this.savePost(post);

      return post;
    } catch (error) {
      console.error(`❌ Error scraping ${postMeta.title}:`, error.message);
      return null;
    }
  }

  extractDetailedMetadata(document, postMeta) {
    const metadata = {};

    // Extract author information
    const authorElement = document.querySelector('[data-testid="post-byline"]');
    metadata.author = authorElement?.textContent?.trim() || 'Tech.ish Thoughts';

    // Extract tags/topics
    const tagElements = document.querySelectorAll('.tag, .topic');
    metadata.tags = Array.from(tagElements)
      .map(el => el.textContent.trim())
      .filter(Boolean);

    // Extract subtitle/description
    const subtitleElement = document.querySelector('.subtitle');
    metadata.subtitle = subtitleElement?.textContent?.trim();

    // Extract cover image
    const coverElement = document.querySelector(
      '.post-header img, .cover-image img'
    );
    metadata.coverImage = coverElement?.src;

    // Check for audio version
    const audioElement = document.querySelector('[data-testid="audio-player"]');
    metadata.hasAudio = !!audioElement;

    // Extract publication metadata
    metadata.publishedAt = postMeta.publishDate;
    metadata.originalUrl = postMeta.url;

    return metadata;
  }

  extractImages(document) {
    const images = [];
    const imgElements = document.querySelectorAll('.available-content img');

    imgElements.forEach((img, index) => {
      if (img.src && !img.src.includes('emoji')) {
        images.push({
          src: img.src,
          alt: img.alt || '',
          caption: this.findImageCaption(img),
          filename: `image-${index + 1}.${this.getImageExtension(img.src)}`,
        });
      }
    });

    return images;
  }

  extractCodeBlocks(document) {
    const codeBlocks = [];
    const codeElements = document.querySelectorAll('pre code, .code-block');

    codeElements.forEach((code, index) => {
      const language = this.detectCodeLanguage(code);
      codeBlocks.push({
        content: code.textContent.trim(),
        language,
        filename: `code-${index + 1}.${language}`,
      });
    });

    return codeBlocks;
  }

  cleanHtmlContent(html) {
    // Convert HTML to Markdown-friendly format
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/<br\s*\/?>/gi, '\n') // Convert breaks to newlines
      .replace(/<\/p>/gi, '\n\n') // Add spacing after paragraphs
      .trim();
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  calculateWordCount(content) {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const words = this.calculateWordCount(content);
    return Math.ceil(words / wordsPerMinute);
  }

  detectCodeLanguage(codeElement) {
    const classList = Array.from(codeElement.classList);
    const langClass = classList.find(cls => cls.startsWith('language-'));
    return langClass ? langClass.replace('language-', '') : 'text';
  }

  findImageCaption(img) {
    const figcaption = img.closest('figure')?.querySelector('figcaption');
    return figcaption?.textContent?.trim() || '';
  }

  getImageExtension(src) {
    const match = src.match(/\.([^.?]+)(\?|$)/);
    return match ? match[1] : 'jpg';
  }

  async savePost(post) {
    const filename = `${post.slug}.json`;
    const filepath = path.join(this.outputDir, filename);
    await fs.writeFile(filepath, JSON.stringify(post, null, 2));
    console.log(`💾 Saved: ${filename}`);
  }

  async scrapeAll() {
    console.log('🚀 Starting Substack content migration...');

    // For demo purposes, load sample posts instead of scraping
    console.log('📋 Loading sample posts for demonstration...');
    try {
      const sampleData = await fs.readFile(
        path.join(process.cwd(), 'sample-posts.json'),
        'utf8'
      );
      const scrapedPosts = JSON.parse(sampleData);

      const index = {
        totalPosts: scrapedPosts.length,
        scrapedAt: new Date().toISOString(),
        posts: scrapedPosts,
      };

      await fs.writeFile(
        path.join(this.outputDir, 'scraped-posts-index.json'),
        JSON.stringify(index, null, 2)
      );

      console.log('✅ Sample posts loaded successfully!');
      console.log(`📊 Loaded ${scrapedPosts.length} sample posts`);

      return scrapedPosts;
    } catch (error) {
      console.log(
        '📝 Sample posts not found, falling back to actual scraping...'
      );
      await this.init();

      const posts = await this.scrapeArchive();

      const scrapedPosts = [];
      for (const postMeta of posts) {
        const post = await this.scrapePost(postMeta);
        if (post) {
          scrapedPosts.push(post);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Save master index
      const index = {
        totalPosts: scrapedPosts.length,
        scrapedAt: new Date().toISOString(),
        posts: scrapedPosts.map(p => ({
          slug: p.slug,
          title: p.title,
          publishDate: p.publishDate,
          wordCount: p.wordCount,
          readingTime: p.readingTime,
        })),
      };

      await fs.writeFile(
        path.join(this.outputDir, 'index.json'),
        JSON.stringify(index, null, 2)
      );

      console.log('✅ Migration scraping complete!');
      console.log(`📊 Scraped ${scrapedPosts.length} posts`);

      return scrapedPosts;
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const scraper = new SubstackScraper();
  scraper.scrapeAll().catch(console.error);
}

export default SubstackScraper;
