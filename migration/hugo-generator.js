#!/usr/bin/env node

/**
 * Hugo Content Generator
 * Converts scraped Substack content to Hugo-compatible markdown posts
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import TurndownService from 'turndown';
import { gfm } from '@joplin/turndown-plugin-gfm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HugoGenerator {
  constructor() {
    this.inputDir = path.join(__dirname, 'scraped-content');
    this.outputDir = path.join(__dirname, '../../content/posts');
    this.staticDir = path.join(__dirname, '../../static');

    // Initialize markdown converter
    this.turndownService = new TurndownService({
      codeBlockStyle: 'fenced',
      fence: '```',
      emDelimiter: '*',
      strongDelimiter: '**',
      linkStyle: 'inlined',
    });

    this.turndownService.use(gfm);
    this.setupTurndownRules();

    // Author mapping
    this.authorMapping = {
      'Tech.ish Thoughts': 'arthur-costa',
      'Gabriel Jeronimo': 'gabriel-jeronimo',
    };

    // Series detection patterns
    this.seriesPatterns = {
      'actor-model': /actor\s+model/i,
      'concurrency-fundamentals':
        /concurrency|shared\s+state|oop.*concurrency/i,
      'blockchain-basics': /blockchain|smart\s+contract|escrow/i,
      'communication-protocols': /communication\s+protocols|osi\s+model/i,
    };
  }

  setupTurndownRules() {
    // Custom rule for code blocks with language detection
    this.turndownService.addRule('codeBlocks', {
      filter: function (node) {
        return (
          node.nodeName === 'PRE' &&
          node.firstChild &&
          node.firstChild.nodeName === 'CODE'
        );
      },
      replacement: function (content, node) {
        const codeNode = node.firstChild;
        const language = this.detectLanguage(codeNode.className, content);
        return `\n\n\`\`\`${language}\n${codeNode.textContent}\n\`\`\`\n\n`;
      }.bind(this),
    });

    // Custom rule for images with proper alt text
    this.turndownService.addRule('images', {
      filter: 'img',
      replacement: (content, node) => {
        const alt = node.getAttribute('alt') || '';
        const src = node.getAttribute('src') || '';
        const title = node.getAttribute('title');
        const titlePart = title ? ` "${title}"` : '';
        return `![${alt}](${src}${titlePart})`;
      },
    });
  }

  detectLanguage(className, content) {
    // Check class names for language hints
    const langClass = className.match(/language-(\w+)/);
    if (langClass) return langClass[1];

    // Heuristic language detection based on content
    if (content.includes('public class') || content.includes('import java.'))
      return 'java';
    if (
      content.includes('object ') ||
      content.includes('def ') ||
      content.includes('case class')
    )
      return 'scala';
    if (
      content.includes('const ') ||
      content.includes('function ') ||
      content.includes('=>')
    )
      return 'javascript';
    if (content.includes('fn ') || content.includes('let mut')) return 'rust';
    if (content.includes('def ') && content.includes('print(')) return 'python';
    if (content.includes('pragma solidity')) return 'solidity';

    return '';
  }

  async generateAllPosts() {
    console.log('🏗️  Starting Hugo content generation...');

    const indexPath = path.join(this.inputDir, 'index.json');
    const indexData = JSON.parse(await fs.readFile(indexPath, 'utf8'));

    const posts = [];
    for (const postInfo of indexData.posts) {
      const postPath = path.join(this.inputDir, `${postInfo.slug}.json`);
      const postData = JSON.parse(await fs.readFile(postPath, 'utf8'));

      const hugoPost = await this.generatePost(postData);
      posts.push(hugoPost);
    }

    // Generate series index pages
    await this.generateSeriesPages(posts);

    // Generate authors if not exist
    await this.updateAuthors(posts);

    console.log('✅ Hugo content generation complete!');
    return posts;
  }

  async generatePost(postData) {
    console.log(`📝 Generating: ${postData.title}`);

    // Parse publication date
    const pubDate = new Date(postData.publishDate);
    const year = pubDate.getFullYear();
    const month = String(pubDate.getMonth() + 1).padStart(2, '0');

    // Create post directory structure
    const postDir = path.join(
      this.outputDir,
      String(year),
      month,
      postData.slug
    );
    await fs.mkdir(postDir, { recursive: true });

    // Create images directory
    const imagesDir = path.join(postDir, 'images');
    await fs.mkdir(imagesDir, { recursive: true });

    // Convert content to markdown
    const markdownContent = this.turndownService.turndown(postData.content);

    // Generate frontmatter
    const frontmatter = this.generateFrontmatter(postData, year, month);

    // Combine frontmatter and content
    const fullContent = `${frontmatter}\n\n${markdownContent}`;

    // Write main post file
    const postPath = path.join(postDir, 'index.md');
    await fs.writeFile(postPath, fullContent);

    // Download and save images
    await this.processImages(postData.images, imagesDir);

    console.log(`✅ Generated: ${postData.slug}`);

    return {
      slug: postData.slug,
      title: postData.title,
      path: postPath,
      year,
      month,
      series: this.detectSeries(postData.title, postData.tags || []),
    };
  }

  generateFrontmatter(postData, year, month) {
    const pubDate = new Date(postData.publishDate);
    const author = this.mapAuthor(postData.author);
    const series = this.detectSeries(postData.title, postData.tags || []);
    const categories = this.generateCategories(postData.tags || []);

    const frontmatter = `+++
title = "${this.escapeFrontmatterString(postData.title)}"
slug = "${postData.slug}"
date = ${pubDate.toISOString()}
lastmod = ${pubDate.toISOString()}
draft = false
authors = ["${author}"]
categories = [${categories.map(cat => `"${cat}"`).join(', ')}]
tags = [${(postData.tags || []).map(tag => `"${this.escapeFrontmatterString(tag)}"`).join(', ')}]
${series ? `series = ["${series}"]` : ''}
toc = true
featured = ${this.isFeaturedPost(postData)}
description = "${this.escapeFrontmatterString(postData.subtitle || postData.excerpt || '')}"
summary = "${this.escapeFrontmatterString(this.generateSummary(postData.content))}"
images = ["/posts/${year}/${month}/${postData.slug}/images/featured.jpg"]
${postData.hasAudio ? `audio_url = "/posts/${year}/${month}/${postData.slug}/audio/post.mp3"` : ''}

# SEO & Social
canonical = "https://techishthoughts.com/posts/${year}/${month}/${postData.slug}/"
original_url = "${postData.originalUrl}"

# Reading estimates
reading_time = ${postData.readingTime}
word_count = ${postData.wordCount}

# Engagement
enable_comments = true
enable_sharing = true
enable_reactions = true
enable_tts = ${postData.hasAudio || false}

# Article metadata
article_type = "${this.detectArticleType(postData)}"
difficulty_level = "${this.detectDifficultyLevel(postData)}"
code_samples = ${(postData.codeBlocks || []).length > 0}
+++`;

    return frontmatter;
  }

  mapAuthor(authorName) {
    return this.authorMapping[authorName] || 'arthur-costa';
  }

  detectSeries(title, tags) {
    for (const [seriesName, pattern] of Object.entries(this.seriesPatterns)) {
      if (pattern.test(title) || tags.some(tag => pattern.test(tag))) {
        return seriesName;
      }
    }
    return null;
  }

  generateCategories(tags) {
    const categoryMappings = {
      Java: 'Programming Languages',
      Scala: 'Programming Languages',
      JavaScript: 'Programming Languages',
      Blockchain: 'Distributed Systems',
      Concurrency: 'Software Engineering',
      'Actor Model': 'Software Architecture',
      Protocols: 'Networking',
    };

    const categories = new Set();
    tags.forEach(tag => {
      const category = categoryMappings[tag];
      if (category) categories.add(category);
    });

    // Default categories
    if (categories.size === 0) {
      categories.add('Software Engineering');
    }

    return Array.from(categories);
  }

  isFeaturedPost(postData) {
    // Feature posts with high word count or part of series
    return (
      postData.wordCount > 2000 ||
      this.detectSeries(postData.title, postData.tags || []) !== null
    );
  }

  generateSummary(content) {
    // Extract first meaningful paragraph as summary
    const text = content
      .replace(/<[^>]+>/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [];
    return sentences.slice(0, 2).join(' ').substring(0, 160);
  }

  detectArticleType(postData) {
    if ((postData.codeBlocks || []).length > 3) return 'technical-deep-dive';
    if (postData.title.toLowerCase().includes('tutorial')) return 'tutorial';
    if (postData.title.toLowerCase().includes('guide')) return 'guide';
    return 'technical-article';
  }

  detectDifficultyLevel(postData) {
    const content = postData.content.toLowerCase();
    if (content.includes('advanced') || content.includes('deep dive'))
      return 'advanced';
    if (content.includes('beginner') || content.includes('introduction'))
      return 'beginner';
    return 'intermediate';
  }

  escapeFrontmatterString(str) {
    if (!str) return '';
    return str.replace(/"/g, '\\"').replace(/\n/g, ' ');
  }

  async processImages(images, imagesDir) {
    if (!images || images.length === 0) return;

    console.log(`🖼️  Processing ${images.length} images...`);

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      try {
        // Create featured image (first image)
        const filename = i === 0 ? 'featured.jpg' : image.filename;
        const imagePath = path.join(imagesDir, filename);

        // Download image (placeholder for now)
        await fs.writeFile(
          imagePath.replace('.jpg', '.txt'),
          `Image URL: ${image.src}\nAlt: ${image.alt}\nCaption: ${image.caption}`
        );
      } catch (error) {
        console.warn(`⚠️ Failed to process image: ${image.src}`);
      }
    }
  }

  async generateSeriesPages(posts) {
    console.log('📚 Generating series pages...');

    const seriesDir = path.join(this.outputDir, 'series');
    await fs.mkdir(seriesDir, { recursive: true });

    const seriesPosts = {};
    posts.forEach(post => {
      if (post.series) {
        if (!seriesPosts[post.series]) {
          seriesPosts[post.series] = [];
        }
        seriesPosts[post.series].push(post);
      }
    });

    for (const [seriesName, seriesPostList] of Object.entries(seriesPosts)) {
      const seriesPath = path.join(seriesDir, seriesName);
      await fs.mkdir(seriesPath, { recursive: true });

      const indexContent = this.generateSeriesIndex(seriesName, seriesPostList);
      await fs.writeFile(path.join(seriesPath, '_index.md'), indexContent);
    }
  }

  generateSeriesIndex(seriesName, posts) {
    const seriesInfo = {
      'actor-model': {
        title: 'Actor Model Series',
        description: 'Deep dive into the Actor Model pattern on the JVM',
      },
      'concurrency-fundamentals': {
        title: 'Concurrency Fundamentals',
        description:
          'Understanding concurrency challenges in object-oriented programming',
      },
    };

    const info = seriesInfo[seriesName] || {
      title: seriesName
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()),
      description: `A series about ${seriesName.replace(/-/g, ' ')}`,
    };

    return `+++
title = "${info.title}"
description = "${info.description}"
date = ${new Date().toISOString()}
type = "series"
layout = "series"
+++

${info.description}

## Posts in this series

${posts.map((post, index) => `${index + 1}. [${post.title}](/posts/${post.year}/${post.month}/${post.slug}/)`).join('\n')}
`;
  }

  async updateAuthors(posts) {
    console.log('👥 Updating authors data...');

    const authorsPath = path.join(__dirname, '../../data/authors.json');
    let authorsData = {};

    try {
      const existingData = await fs.readFile(authorsPath, 'utf8');
      authorsData = JSON.parse(existingData);
    } catch (error) {
      console.log('📝 Creating new authors.json...');
    }

    // Add Gabriel Jeronimo if not exists
    if (!authorsData['gabriel-jeronimo']) {
      authorsData['gabriel-jeronimo'] = {
        name: 'Gabriel Jeronimo',
        title: 'Blockchain Developer & Smart Contract Engineer',
        bio: 'Blockchain developer with expertise in Solidity, smart contracts, and decentralized applications. Passionate about Web3 and DeFi protocols.',
        long_bio:
          'Gabriel Jeronimo is a blockchain developer specializing in smart contract development and decentralized applications. With a strong background in Solidity, Rust, and Web3 technologies, Gabriel focuses on building secure and efficient blockchain solutions. He has extensive experience with Ethereum, Foundry, and various DeFi protocols.',
        avatar:
          'https://avatars.githubusercontent.com/u/placeholder-gabriel?v=4',
        location: 'Brazil',
        website: 'https://github.com/gabriel-jeronimo',
        expertise: [
          'Solidity Development',
          'Smart Contract Security',
          'DeFi Protocols',
          'Rust Programming',
          'Blockchain Architecture',
        ],
        languages: ['Solidity', 'Rust', 'JavaScript', 'TypeScript'],
        tools: ['Foundry', 'Hardhat', 'Web3.js', 'ethers.js'],
        social: {
          github: 'https://github.com/gabriel-jeronimo',
          linkedin: 'https://linkedin.com/in/gabriel-jeronimo',
          twitter: 'https://twitter.com/gabriel_jeronimo',
        },
        contact: {
          email: 'gabriel@techishthoughts.com',
        },
        stats: {
          posts_count: 1,
          github_stars: 50,
          followers: 25,
        },
      };
    }

    await fs.writeFile(authorsPath, JSON.stringify(authorsData, null, 2));
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new HugoGenerator();
  generator.generateAllPosts().catch(console.error);
}

export default HugoGenerator;
