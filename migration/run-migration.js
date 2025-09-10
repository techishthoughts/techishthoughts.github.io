#!/usr/bin/env node

/**
 * Complete Substack to Hugo Migration Pipeline
 *
 * Orchestrates the entire migration process:
 * 1. Scrapes Substack content
 * 2. Converts to Hugo format
 * 3. Sets up SEO redirects
 * 4. Validates content quality
 */

import SubstackScraper from './substack-scraper.js';
import HugoGenerator from './hugo-generator.js';
import SEORedirectGenerator from './seo-redirects.js';
import ContentValidator from './content-validator.js';
import fs from 'fs/promises';
import path from 'path';

class MigrationOrchestrator {
  constructor() {
    this.substackUrl = 'https://techishthoughts.substack.com';
    this.outputDir = process.cwd();
    this.scraped = null;
    this.migrationReport = {
      startTime: new Date().toISOString(),
      steps: [],
      errors: [],
      warnings: [],
      stats: {},
    };
  }

  /**
   * Log step progress
   */
  logStep(step, status, details = null) {
    const stepInfo = {
      step,
      status,
      timestamp: new Date().toISOString(),
      details,
    };

    this.migrationReport.steps.push(stepInfo);

    const statusIcon =
      status === 'completed'
        ? '✅'
        : status === 'error'
          ? '❌'
          : status === 'warning'
            ? '⚠️'
            : '🔄';

    console.log(`${statusIcon} ${step}${details ? `: ${details}` : ''}`);
  }

  /**
   * Step 1: Scrape Substack content
   */
  async scrapeContent() {
    this.logStep('Scraping Substack content', 'in_progress');

    try {
      const scraper = new SubstackScraper();
      const scrapedPosts = await scraper.scrapeAll();
      this.scraped = { posts: scrapedPosts };

      this.migrationReport.stats.postsScraped = this.scraped.posts.length;
      this.logStep(
        'Content scraping',
        'completed',
        `${this.scraped.posts.length} posts scraped`
      );

      // Save scraped data
      await fs.writeFile(
        path.join(this.outputDir, 'scraped-content.json'),
        JSON.stringify(this.scraped, null, 2),
        'utf8'
      );

      return this.scraped;
    } catch (error) {
      this.migrationReport.errors.push({
        step: 'scraping',
        error: error.message,
      });
      this.logStep('Content scraping', 'error', error.message);
      throw error;
    }
  }

  /**
   * Step 2: Generate Hugo content
   */
  async generateHugoContent() {
    this.logStep('Generating Hugo content', 'in_progress');

    try {
      const generator = new HugoGenerator();
      const results = await generator.generateAllPosts();

      this.migrationReport.stats.postsGenerated = results.length;
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      this.logStep(
        'Hugo content generation',
        'completed',
        `${successful} posts generated, ${failed} failed`
      );

      if (failed > 0) {
        this.migrationReport.warnings.push({
          step: 'hugo_generation',
          warning: `${failed} posts failed to generate`,
        });
      }

      return results;
    } catch (error) {
      this.migrationReport.errors.push({
        step: 'hugo_generation',
        error: error.message,
      });
      this.logStep('Hugo content generation', 'error', error.message);
      throw error;
    }
  }

  /**
   * Step 3: Setup SEO redirects
   */
  async setupSEORedirects() {
    this.logStep('Setting up SEO redirects', 'in_progress');

    try {
      const seoGenerator = new SEORedirectGenerator();
      await seoGenerator.execute(this.scraped.posts);

      this.migrationReport.stats.redirectsGenerated =
        seoGenerator.redirectRules.length;
      this.logStep(
        'SEO redirects setup',
        'completed',
        `${seoGenerator.redirectRules.length} redirect rules generated`
      );
    } catch (error) {
      this.migrationReport.errors.push({
        step: 'seo_redirects',
        error: error.message,
      });
      this.logStep('SEO redirects setup', 'error', error.message);
      throw error;
    }
  }

  /**
   * Step 4: Validate content
   */
  async validateContent() {
    this.logStep('Validating migrated content', 'in_progress');

    try {
      const validator = new ContentValidator();
      const validationReport = await validator.execute('content/posts');

      this.migrationReport.stats.validation = {
        totalPosts: validationReport.summary.totalFiles,
        validPosts: validationReport.summary.validFiles,
        errors: validationReport.summary.totalErrors,
        warnings: validationReport.summary.totalWarnings,
      };

      if (validationReport.summary.totalErrors > 0) {
        this.migrationReport.warnings.push({
          step: 'content_validation',
          warning: `${validationReport.summary.totalErrors} validation errors found`,
        });
        this.logStep(
          'Content validation',
          'warning',
          `${validationReport.summary.totalErrors} errors, ${validationReport.summary.totalWarnings} warnings`
        );
      } else {
        this.logStep(
          'Content validation',
          'completed',
          `All posts valid, ${validationReport.summary.totalWarnings} warnings`
        );
      }

      return validationReport;
    } catch (error) {
      this.migrationReport.errors.push({
        step: 'content_validation',
        error: error.message,
      });
      this.logStep('Content validation', 'error', error.message);
      throw error;
    }
  }

  /**
   * Generate final migration report
   */
  async generateFinalReport() {
    this.migrationReport.endTime = new Date().toISOString();
    this.migrationReport.duration =
      new Date(this.migrationReport.endTime) -
      new Date(this.migrationReport.startTime);

    // Add post-migration checklist
    this.migrationReport.postMigrationChecklist = [
      'Deploy Hugo site to production',
      'Configure redirect rules on your hosting platform',
      'Submit new sitemap to search engines',
      'Update DNS records if needed',
      'Test all redirect rules',
      'Monitor 404 errors for first few weeks',
      'Update social media profile links',
      'Contact referring sites for link updates',
      'Set up Google Analytics tracking',
      'Monitor search rankings',
      'Archive original Substack content (optional)',
    ];

    // Add next steps
    this.migrationReport.nextSteps = [
      {
        step: 'Deploy site',
        description: 'Run `npm run build` and deploy to your hosting platform',
        priority: 'high',
      },
      {
        step: 'Configure redirects',
        description: 'Upload generated redirect files to your server',
        priority: 'high',
      },
      {
        step: 'Test redirects',
        description: 'Test all Substack URLs redirect properly to new site',
        priority: 'medium',
      },
      {
        step: 'SEO monitoring',
        description:
          'Monitor search console for crawl errors and ranking changes',
        priority: 'medium',
      },
    ];

    await fs.writeFile(
      path.join(this.outputDir, 'migration-final-report.json'),
      JSON.stringify(this.migrationReport, null, 2),
      'utf8'
    );

    console.log(
      '\n📋 Final migration report saved to: migration-final-report.json'
    );
  }

  /**
   * Print final summary
   */
  printFinalSummary() {
    console.log('\n🎉 MIGRATION COMPLETED!');
    console.log('=======================');
    console.log(
      `📅 Duration: ${Math.round(this.migrationReport.duration / 1000 / 60)} minutes`
    );
    console.log(
      `📝 Posts migrated: ${this.migrationReport.stats.postsScraped || 0}`
    );
    console.log(
      `✅ Posts generated: ${this.migrationReport.stats.postsGenerated || 0}`
    );
    console.log(
      `🔗 Redirects created: ${this.migrationReport.stats.redirectsGenerated || 0}`
    );

    if (this.migrationReport.stats.validation) {
      const v = this.migrationReport.stats.validation;
      console.log(
        `🔍 Content validation: ${v.validPosts}/${v.totalPosts} posts valid`
      );
      if (v.errors > 0) {
        console.log(`❌ Validation errors: ${v.errors}`);
      }
      if (v.warnings > 0) {
        console.log(`⚠️  Validation warnings: ${v.warnings}`);
      }
    }

    if (this.migrationReport.errors.length > 0) {
      console.log(
        `\n❌ Errors encountered: ${this.migrationReport.errors.length}`
      );
      this.migrationReport.errors.forEach(({ step, error }) => {
        console.log(`  ${step}: ${error}`);
      });
    }

    if (this.migrationReport.warnings.length > 0) {
      console.log(`\n⚠️  Warnings: ${this.migrationReport.warnings.length}`);
      this.migrationReport.warnings.forEach(({ step, warning }) => {
        console.log(`  ${step}: ${warning}`);
      });
    }

    console.log('\n📋 Next Steps:');
    this.migrationReport.nextSteps.forEach(
      ({ step, description, priority }) => {
        const priorityIcon =
          priority === 'high' ? '🔥' : priority === 'medium' ? '📋' : '💡';
        console.log(`  ${priorityIcon} ${step}: ${description}`);
      }
    );

    console.log('\n🔍 Review the generated files:');
    console.log('  - content/posts/ (migrated blog posts)');
    console.log('  - static/_redirects (Netlify redirects)');
    console.log('  - static/.htaccess (Apache redirects)');
    console.log('  - nginx-redirects.conf (Nginx redirects)');
    console.log('  - migration-final-report.json (detailed report)');
    console.log('  - content-validation-report.json (validation details)');
  }

  /**
   * Main migration execution
   */
  async execute() {
    try {
      console.log('🚀 Starting Substack to Hugo migration...');
      console.log(`📍 Source: ${this.substackUrl}`);
      console.log(`📂 Output: ${this.outputDir}`);
      console.log('');

      // Step 1: Scrape content
      await this.scrapeContent();

      // Step 2: Generate Hugo content
      await this.generateHugoContent();

      // Step 3: Setup SEO redirects
      await this.setupSEORedirects();

      // Step 4: Validate content
      await this.validateContent();

      // Generate final report
      await this.generateFinalReport();

      // Print summary
      this.printFinalSummary();

      console.log('\n✨ Migration completed successfully!');
    } catch (error) {
      console.error('\n💥 Migration failed:', error.message);

      // Still generate report even if migration failed
      await this.generateFinalReport();

      process.exit(1);
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new MigrationOrchestrator();
  orchestrator.execute().catch(console.error);
}

export default MigrationOrchestrator;
