#!/usr/bin/env node

/**
 * SEO Preservation and URL Redirect Generator
 *
 * This script creates redirect rules and preserves SEO metadata
 * for migrating from Substack to Hugo static site
 */

import fs from 'fs/promises';
import path from 'path';

class SEORedirectGenerator {
  constructor() {
    this.redirectRules = [];
    this.seoMappings = new Map();
    this.substackDomain = 'techishthoughts.substack.com';
    this.hugoDomain = process.env.HUGO_DOMAIN || 'localhost:1313';
  }

  /**
   * Generate redirect rules for Substack to Hugo URLs
   */
  generateRedirectRules(posts) {
    console.log('🔗 Generating redirect rules...');

    for (const post of posts) {
      const substackUrl = `https://${this.substackDomain}/p/${post.slug}`;
      const hugoUrl = `/posts/${post.slug}/`;

      // Create redirect rule
      this.redirectRules.push({
        from: substackUrl,
        to: hugoUrl,
        status: 301, // Permanent redirect
        type: 'substack-post',
      });

      // Store SEO mapping
      this.seoMappings.set(post.slug, {
        original: substackUrl,
        new: hugoUrl,
        title: post.title,
        description: post.description,
        publishDate: post.publishedAt,
        lastModified: post.updatedAt,
      });
    }

    // Add common Substack patterns
    this.addCommonRedirects();
  }

  /**
   * Add common Substack URL patterns that need redirects
   */
  addCommonRedirects() {
    // Homepage redirect
    this.redirectRules.push({
      from: `https://${this.substackDomain}`,
      to: '/',
      status: 301,
      type: 'homepage',
    });

    this.redirectRules.push({
      from: `https://${this.substackDomain}/`,
      to: '/',
      status: 301,
      type: 'homepage',
    });

    // Archive/posts listing
    this.redirectRules.push({
      from: `https://${this.substackDomain}/archive`,
      to: '/posts/',
      status: 301,
      type: 'archive',
    });

    // About page (if exists)
    this.redirectRules.push({
      from: `https://${this.substackDomain}/about`,
      to: '/about/',
      status: 301,
      type: 'about',
    });

    // RSS feed
    this.redirectRules.push({
      from: `https://${this.substackDomain}/feed`,
      to: '/index.xml',
      status: 301,
      type: 'rss',
    });
  }

  /**
   * Generate Netlify _redirects file
   */
  async generateNetlifyRedirects() {
    const redirectsContent = this.redirectRules
      .map(rule => `${rule.from} ${rule.to} ${rule.status}`)
      .join('\n');

    await fs.writeFile(
      path.join(process.cwd(), 'static', '_redirects'),
      redirectsContent,
      'utf8'
    );

    console.log('✅ Generated Netlify _redirects file');
  }

  /**
   * Generate Apache .htaccess redirects
   */
  async generateApacheRedirects() {
    const htaccessContent = [
      'RewriteEngine On',
      '',
      ...this.redirectRules.map(
        rule =>
          `RewriteRule ^${rule.from.replace(/https?:\/\/[^\/]+\/?/, '')}/?$ ${rule.to} [R=${rule.status},L]`
      ),
    ].join('\n');

    await fs.writeFile(
      path.join(process.cwd(), 'static', '.htaccess'),
      htaccessContent,
      'utf8'
    );

    console.log('✅ Generated Apache .htaccess file');
  }

  /**
   * Generate Nginx redirect configuration
   */
  async generateNginxRedirects() {
    const nginxContent = this.redirectRules
      .map(rule => {
        const fromPath = rule.from.replace(/https?:\/\/[^\/]+/, '');
        return `location ${fromPath} { return ${rule.status} ${rule.to}; }`;
      })
      .join('\n');

    await fs.writeFile(
      path.join(process.cwd(), 'nginx-redirects.conf'),
      nginxContent,
      'utf8'
    );

    console.log('✅ Generated Nginx redirect configuration');
  }

  /**
   * Generate Hugo config for canonical URLs and SEO
   */
  async generateHugoSEOConfig() {
    const seoConfig = {
      baseURL: `https://${this.hugoDomain}`,
      canonifyURLs: true,
      params: {
        seo: {
          preserveSubstackSEO: true,
          originalDomain: this.substackDomain,
          redirectDate: new Date().toISOString(),
        },
      },
    };

    await fs.writeFile(
      path.join(process.cwd(), 'config-seo.yaml'),
      `# SEO Configuration for Substack Migration\n${JSON.stringify(seoConfig, null, 2)}`,
      'utf8'
    );

    console.log('✅ Generated Hugo SEO configuration');
  }

  /**
   * Generate sitemap mapping for search engines
   */
  async generateSitemapMapping() {
    const mappings = Array.from(this.seoMappings.entries()).map(
      ([slug, data]) => ({
        slug,
        oldUrl: data.original,
        newUrl: data.new,
        title: data.title,
        lastModified: data.lastModified || data.publishDate,
      })
    );

    await fs.writeFile(
      path.join(process.cwd(), 'url-mappings.json'),
      JSON.stringify(mappings, null, 2),
      'utf8'
    );

    console.log('✅ Generated URL mappings for search engines');
  }

  /**
   * Generate robots.txt with redirect information
   */
  async generateRobotsTxt() {
    const robotsContent = [
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: https://${this.hugoDomain}/sitemap.xml`,
      '',
      '# Migration from Substack completed',
      `# Original domain: ${this.substackDomain}`,
      `# Migration date: ${new Date().toISOString().split('T')[0]}`,
    ].join('\n');

    await fs.writeFile(
      path.join(process.cwd(), 'static', 'robots.txt'),
      robotsContent,
      'utf8'
    );

    console.log('✅ Generated robots.txt');
  }

  /**
   * Generate meta tags for preserving social media sharing
   */
  generateSocialMetaTags(post) {
    return {
      'og:url': `https://${this.hugoDomain}/posts/${post.slug}/`,
      'og:title': post.title,
      'og:description': post.description,
      'og:image': post.coverImage || '/images/default-og.jpg',
      'og:type': 'article',
      'article:published_time': post.publishedAt,
      'article:modified_time': post.updatedAt,
      'article:author': post.author,
      'twitter:card': 'summary_large_image',
      'twitter:title': post.title,
      'twitter:description': post.description,
      'twitter:image': post.coverImage || '/images/default-og.jpg',
      canonical: `https://${this.hugoDomain}/posts/${post.slug}/`,
    };
  }

  /**
   * Main execution function
   */
  async execute(posts) {
    try {
      console.log('🚀 Starting SEO preservation and redirect generation...');

      // Ensure output directories exist
      await fs.mkdir(path.join(process.cwd(), 'static'), { recursive: true });

      // Generate redirect rules
      this.generateRedirectRules(posts);

      // Generate redirect files for different server types
      await this.generateNetlifyRedirects();
      await this.generateApacheRedirects();
      await this.generateNginxRedirects();

      // Generate SEO configurations
      await this.generateHugoSEOConfig();
      await this.generateSitemapMapping();
      await this.generateRobotsTxt();

      // Generate report
      await this.generateRedirectReport();

      console.log('✅ SEO preservation and redirect generation completed!');
      console.log(`📊 Generated ${this.redirectRules.length} redirect rules`);
    } catch (error) {
      console.error('❌ Error generating redirects:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive redirect report
   */
  async generateRedirectReport() {
    const report = {
      migrationDate: new Date().toISOString(),
      originalDomain: this.substackDomain,
      newDomain: this.hugoDomain,
      totalRedirects: this.redirectRules.length,
      redirectTypes: this.getRedirectTypesSummary(),
      seoChecklist: this.generateSEOChecklist(),
      testingInstructions: this.generateTestingInstructions(),
    };

    await fs.writeFile(
      path.join(process.cwd(), 'migration-seo-report.json'),
      JSON.stringify(report, null, 2),
      'utf8'
    );

    console.log('📋 Generated SEO migration report');
  }

  /**
   * Get summary of redirect types
   */
  getRedirectTypesSummary() {
    const types = {};
    this.redirectRules.forEach(rule => {
      types[rule.type] = (types[rule.type] || 0) + 1;
    });
    return types;
  }

  /**
   * Generate SEO checklist for post-migration
   */
  generateSEOChecklist() {
    return [
      'Submit new sitemap to Google Search Console',
      'Submit new sitemap to Bing Webmaster Tools',
      'Update social media profile links',
      'Update email signature links',
      'Contact referring sites for link updates',
      'Monitor 404 errors in Google Search Console',
      'Test redirect functionality across all major browsers',
      'Verify canonical URLs are properly set',
      'Check that Open Graph tags are working',
      'Validate structured data markup',
      'Monitor search rankings for key pages',
      'Set up Google Analytics goal tracking for migrated content',
    ];
  }

  /**
   * Generate testing instructions
   */
  generateTestingInstructions() {
    return [
      `Test homepage redirect: curl -I https://${this.substackDomain}`,
      'Test post redirects using the generated URL mappings',
      'Verify RSS feed redirect is working',
      'Check that social sharing previews work correctly',
      'Test redirects in incognito/private browsing mode',
      'Use Google Search Console to monitor crawl errors',
      'Test redirects from different geographical locations',
      'Validate that HTTPS redirects work properly',
    ];
  }
}

// Export for use in other scripts
export default SEORedirectGenerator;

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new SEORedirectGenerator();

  // Mock posts data for demonstration - in real usage, this would come from scraper
  const mockPosts = [
    {
      slug: 'sample-post',
      title: 'Sample Post Title',
      description: 'Sample post description',
      publishedAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  generator.execute(mockPosts).catch(console.error);
}
