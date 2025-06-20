#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Validate front matter in markdown files
 */
function validateFrontMatter() {
  const postsDir = path.join(process.cwd(), 'content', 'posts');

  console.log('🔍 Validating post front matter...');

  // Check if posts directory exists
  if (!fs.existsSync(postsDir)) {
    console.log('⚠️  No posts directory found, skipping validation');
    process.exit(0);
  }

  try {
    // Get all markdown files
    const markdownFiles = fs.readdirSync(postsDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(postsDir, file));

    if (markdownFiles.length === 0) {
      console.log('⚠️  No markdown files found in content/posts/');
      process.exit(0);
    }

    console.log(`📊 Found ${markdownFiles.length} posts to validate`);
    let validatedCount = 0;
    let errorCount = 0;

    markdownFiles.forEach(filePath => {
      const fileName = path.basename(filePath);
      console.log(`\n📝 Validating: ${fileName}`);

      try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check if file has front matter
        if (!content.startsWith('---')) {
          throw new Error(`Missing front matter delimiters (---) at the start of ${fileName}`);
        }

        // Extract front matter
        const frontMatterEnd = content.indexOf('---', 3);
        if (frontMatterEnd === -1) {
          throw new Error(`Missing closing front matter delimiter (---) in ${fileName}`);
        }

        const frontMatter = content.substring(3, frontMatterEnd).trim();

        // Parse YAML-like front matter (basic validation)
        const frontMatterLines = frontMatter.split('\n');
        const frontMatterData = {};

        frontMatterLines.forEach(line => {
          if (line.trim() && line.includes(':')) {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim().replace(/^['"]|['"]$/g, '');
            frontMatterData[key.trim()] = value;
          }
        });

        // Required fields validation
        const requiredFields = ['title', 'date'];
        requiredFields.forEach(field => {
          if (!frontMatterData[field]) {
            throw new Error(`Missing required field '${field}' in ${fileName}`);
          }
        });

        // Validate title
        if (frontMatterData.title.length < 10 || frontMatterData.title.length > 100) {
          console.warn(`⚠️  Title in ${fileName} should be between 10-100 characters (current: ${frontMatterData.title.length})`);
        }

        // Validate date format (basic check)
        const datePattern = /^\d{4}-\d{2}-\d{2}/;
        if (!datePattern.test(frontMatterData.date)) {
          throw new Error(`Invalid date format in ${fileName}. Expected YYYY-MM-DD format.`);
        }

        // Validate author if present
        if (frontMatterData.author) {
          // Check if author exists in authors.json
          const authorsPath = path.join(process.cwd(), 'data', 'authors.json');
          if (fs.existsSync(authorsPath)) {
            const authorsData = JSON.parse(fs.readFileSync(authorsPath, 'utf8'));
            if (!authorsData[frontMatterData.author]) {
              console.warn(`⚠️  Author '${frontMatterData.author}' in ${fileName} not found in authors.json`);
            }
          }
        }

        // Validate tags if present
        if (frontMatterData.tags) {
          const tagsStr = frontMatterData.tags.replace(/[[\]]/g, '');
          const tags = tagsStr.split(',').map(tag => tag.trim().replace(/'/g, ''));

          if (tags.length > 10) {
            console.warn(`⚠️  Too many tags in ${fileName} (${tags.length}). Consider limiting to 5-7 tags.`);
          }

          tags.forEach(tag => {
            if (tag.length > 20) {
              console.warn(`⚠️  Tag '${tag}' in ${fileName} is too long (${tag.length} chars). Keep tags under 20 characters.`);
            }
          });
        }

        // Validate summary/description
        if (frontMatterData.summary && frontMatterData.summary.length > 200) {
          console.warn(`⚠️  Summary in ${fileName} is too long (${frontMatterData.summary.length} chars). Keep under 200 characters for SEO.`);
        }

        // Check for draft status
        if (frontMatterData.draft === 'true') {
          console.log(`📝 ${fileName} is marked as draft`);
        }

        validatedCount++;
        console.log(`✅ ${fileName} validation passed`);

      } catch (error) {
        errorCount++;
        console.error(`❌ ${fileName}: ${error.message}`);
      }
    });

    console.log('\n📊 Front Matter Validation Summary:');
    console.log(`✅ Successfully validated: ${validatedCount} files`);
    if (errorCount > 0) {
      console.log(`❌ Errors found: ${errorCount} files`);
      process.exit(1);
    } else {
      console.log('🎉 All front matter validation passed!');
    }

  } catch (error) {
    console.error(`❌ Front matter validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  validateFrontMatter();
}

module.exports = { validateFrontMatter };
