#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Validate authors data structure and content
 */
function validateAuthors() {
  const authorsPath = path.join(process.cwd(), 'data', 'authors.json');

  console.log('🔍 Validating author data...');

  // Check if file exists
  if (!fs.existsSync(authorsPath)) {
    console.log('⚠️  Authors file not found at data/authors.json, skipping validation');
    process.exit(0);
  }

  try {
    // Parse JSON
    const authorsData = JSON.parse(fs.readFileSync(authorsPath, 'utf8'));

    // Validate structure
    if (!authorsData || typeof authorsData !== 'object') {
      throw new Error('Authors data must be a valid object');
    }

    const authors = Object.entries(authorsData);
    console.log(`📊 Found ${authors.length} authors to validate`);

    // Validate each author
    authors.forEach(([authorId, author]) => {
      console.log(`\n👤 Validating author: ${authorId}`);

      // Required fields
      const requiredFields = ['name', 'bio', 'avatar'];
      requiredFields.forEach(field => {
        if (!author[field]) {
          throw new Error(`Author '${authorId}' missing required field: ${field}`);
        }
      });

      // Validate field types and content
      if (typeof author.name !== 'string' || author.name.trim().length === 0) {
        throw new Error(`Author '${authorId}' name must be a non-empty string`);
      }

      if (typeof author.bio !== 'string' || author.bio.trim().length < 20) {
        throw new Error(`Author '${authorId}' bio must be at least 20 characters`);
      }

      if (author.bio.length > 250) {
        console.warn(`⚠️  Author '${authorId}' bio is longer than 250 characters (${author.bio.length})`);
      }

      // Validate avatar URL
      if (!author.avatar.startsWith('http')) {
        throw new Error(`Author '${authorId}' avatar must be a valid HTTP/HTTPS URL`);
      }

      // Validate social links if present
      if (author.social) {
        Object.entries(author.social).forEach(([platform, url]) => {
          if (url && !url.startsWith('http')) {
            throw new Error(`Author '${authorId}' ${platform} link must be a valid HTTP/HTTPS URL`);
          }
        });
      }

      console.log(`✅ Author '${authorId}' validation passed`);
    });

    console.log('\n🎉 All authors validated successfully!');
    console.log(`📊 Summary: ${authors.length} authors validated`);

  } catch (error) {
    console.error(`❌ Author validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  validateAuthors();
}

module.exports = { validateAuthors };
