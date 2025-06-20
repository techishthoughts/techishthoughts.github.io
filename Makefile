# Tech.ish Thoughts Blog - Makefile
# Comprehensive build, test, and deployment automation

# Variables
HUGO_VERSION := 0.126.0
NODE_VERSION := 20
NPM_REGISTRY := https://registry.npmjs.org/
SITE_URL := https://techishthoughts.github.io
LOCAL_PORT := 1313

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
PURPLE := \033[0;35m
CYAN := \033[0;36m
WHITE := \033[0;37m
RESET := \033[0m

.PHONY: help install setup dev build test clean deploy validate format lint security docs ci-local ci-test

# Default target
help: ## Show this help message
	@echo "$(CYAN)Tech.ish Thoughts Blog - Available Commands$(RESET)"
	@echo ""
	@echo "$(GREEN)Development:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E "(dev|build|serve|watch)" | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Quality Assurance:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E "(test|lint|format|validate|security)" | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Deployment:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E "(deploy|clean|ci)" | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Utilities:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E "(install|setup|docs|help)" | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(RESET) %s\n", $$1, $$2}'

# Installation and Setup
install: ## Install all dependencies (Node.js, Hugo, npm packages)
	@echo "$(BLUE)Installing dependencies...$(RESET)"
	@echo "$(YELLOW)Checking Node.js version...$(RESET)"
	@node --version | grep -E "v$(NODE_VERSION)" || (echo "$(RED)Node.js $(NODE_VERSION) required$(RESET)" && exit 1)
	@echo "$(YELLOW)Checking Hugo version...$(RESET)"
	@hugo version | grep -E "$(HUGO_VERSION)" || (echo "$(RED)Hugo Extended $(HUGO_VERSION) required$(RESET)" && exit 1)
	@echo "$(YELLOW)Installing npm packages...$(RESET)"
	npm ci
	@echo "$(GREEN)✓ All dependencies installed$(RESET)"

setup: install ## Complete project setup including dependency validation
	@echo "$(BLUE)Setting up project...$(RESET)"
	@echo "$(YELLOW)Validating author data...$(RESET)"
	npm run validate:authors
	@echo "$(YELLOW)Validating content...$(RESET)"
	npm run validate:frontmatter
	@echo "$(YELLOW)Initial build test...$(RESET)"
	npm run build
	hugo --gc --minify
	@echo "$(GREEN)✓ Project setup complete$(RESET)"

# Development
dev: ## Start development server with hot reload
	@echo "$(BLUE)Starting development server...$(RESET)"
	@echo "$(YELLOW)Building React components in watch mode...$(RESET)"
	npm run build:watch &
	@echo "$(YELLOW)Starting Hugo server...$(RESET)"
	hugo server -D --port $(LOCAL_PORT) --bind 0.0.0.0 --baseURL http://localhost:$(LOCAL_PORT)

serve: ## Start Hugo server only (assumes React components are built)
	@echo "$(BLUE)Starting Hugo server...$(RESET)"
	hugo server -D --port $(LOCAL_PORT) --bind 0.0.0.0 --baseURL http://localhost:$(LOCAL_PORT)

watch: ## Watch and build React components only
	@echo "$(BLUE)Watching React components...$(RESET)"
	npm run build:watch

build: ## Build production version (React + Hugo)
	@echo "$(BLUE)Building production version...$(RESET)"
	@echo "$(YELLOW)Building React components...$(RESET)"
	npm run build
	@echo "$(YELLOW)Building Hugo site...$(RESET)"
	hugo --gc --minify
	@echo "$(GREEN)✓ Production build complete$(RESET)"

build-dev: ## Build development version with drafts
	@echo "$(BLUE)Building development version...$(RESET)"
	@echo "$(YELLOW)Building React components...$(RESET)"
	npm run build
	@echo "$(YELLOW)Building Hugo site with drafts...$(RESET)"
	hugo -D --gc
	@echo "$(GREEN)✓ Development build complete$(RESET)"

# Quality Assurance
test: ## Run all tests (unit, integration, E2E)
	@echo "$(BLUE)Running all tests...$(RESET)"
	@echo "$(YELLOW)Unit tests...$(RESET)"
	npm run test
	@echo "$(YELLOW)E2E tests...$(RESET)"
	npm run test:e2e
	@echo "$(GREEN)✓ All tests passed$(RESET)"

test-unit: ## Run unit tests only
	@echo "$(BLUE)Running unit tests...$(RESET)"
	npm run test

test-e2e: ## Run E2E tests only
	@echo "$(BLUE)Running E2E tests...$(RESET)"
	npm run test:e2e

test-watch: ## Run tests in watch mode
	@echo "$(BLUE)Running tests in watch mode...$(RESET)"
	npm run test:watch

test-coverage: ## Generate test coverage report
	@echo "$(BLUE)Generating test coverage...$(RESET)"
	npm run test:coverage
	@echo "$(GREEN)✓ Coverage report generated$(RESET)"

lint: ## Run linting on all code
	@echo "$(BLUE)Running linters...$(RESET)"
	@echo "$(YELLOW)TypeScript/JavaScript linting...$(RESET)"
	npm run lint
	@echo "$(YELLOW)Markdown linting...$(RESET)"
	npx markdownlint content/**/*.md || echo "$(YELLOW)Warning: Markdown linting issues found$(RESET)"
	@echo "$(GREEN)✓ Linting complete$(RESET)"

lint-fix: ## Fix auto-fixable linting issues
	@echo "$(BLUE)Fixing linting issues...$(RESET)"
	npm run lint:fix
	@echo "$(GREEN)✓ Auto-fixable issues resolved$(RESET)"

format: ## Format all code with Prettier
	@echo "$(BLUE)Formatting code...$(RESET)"
	npm run format
	@echo "$(GREEN)✓ Code formatted$(RESET)"

format-check: ## Check code formatting
	@echo "$(BLUE)Checking code formatting...$(RESET)"
	npm run format:check

validate: ## Validate all content and configuration
	@echo "$(BLUE)Validating content...$(RESET)"
	@echo "$(YELLOW)Author data validation...$(RESET)"
	npm run validate:authors
	@echo "$(YELLOW)Front matter validation...$(RESET)"
	npm run validate:frontmatter
	@echo "$(YELLOW)Content validation...$(RESET)"
	npm run validate:content
	@echo "$(GREEN)✓ All validation passed$(RESET)"

security: ## Run security audit
	@echo "$(BLUE)Running security audit...$(RESET)"
	npm audit --audit-level moderate
	@echo "$(GREEN)✓ Security audit complete$(RESET)"

security-fix: ## Fix security vulnerabilities
	@echo "$(BLUE)Fixing security vulnerabilities...$(RESET)"
	npm audit fix
	@echo "$(GREEN)✓ Security issues fixed$(RESET)"

# CI/CD and Local Testing
ci-local: ## Test GitHub Actions locally using act
	@echo "$(BLUE)Testing GitHub Actions locally...$(RESET)"
	@echo "$(YELLOW)Testing main workflow...$(RESET)"
	act -W .github/workflows/gh-pages.yml
	@echo "$(GREEN)✓ Local CI test complete$(RESET)"

ci-test: ## Test specific GitHub Actions workflow
	@echo "$(BLUE)Testing specific workflow...$(RESET)"
	@read -p "Enter workflow file name (e.g., gh-pages.yml): " workflow; \
	act -W .github/workflows/$$workflow

ci-validate: ## Validate GitHub Actions workflows
	@echo "$(BLUE)Validating GitHub Actions workflows...$(RESET)"
	@for workflow in .github/workflows/*.yml; do \
		echo "$(YELLOW)Validating $$workflow...$(RESET)"; \
		act -W $$workflow --dryrun || echo "$(RED)Issues found in $$workflow$(RESET)"; \
	done
	@echo "$(GREEN)✓ Workflow validation complete$(RESET)"

ci-secrets: ## Show required secrets for GitHub Actions
	@echo "$(BLUE)Required GitHub Actions secrets:$(RESET)"
	@echo "$(YELLOW)Repository secrets:$(RESET)"
	@echo "  - GITHUB_TOKEN (automatic)"
	@echo "$(YELLOW)Optional secrets:$(RESET)"
	@echo "  - GOOGLE_ANALYTICS_ID"
	@echo "  - PLAUSIBLE_DOMAIN"

# Deployment
deploy: build ## Deploy to GitHub Pages (manual)
	@echo "$(BLUE)Deploying to GitHub Pages...$(RESET)"
	@echo "$(YELLOW)Note: Automatic deployment via GitHub Actions is recommended$(RESET)"
	@echo "$(YELLOW)Pushing to main branch will trigger automatic deployment$(RESET)"
	git add .
	git status
	@read -p "Continue with manual deployment? [y/N]: " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		git commit -m "deploy: manual deployment $$(date)" && \
		git push origin main; \
	else \
		echo "$(YELLOW)Deployment cancelled$(RESET)"; \
	fi

deploy-preview: build-dev ## Create deployment preview
	@echo "$(BLUE)Creating deployment preview...$(RESET)"
	@echo "$(YELLOW)Building development version...$(RESET)"
	hugo server --port 8080 --bind 0.0.0.0 --baseURL http://localhost:8080 &
	@echo "$(GREEN)Preview available at: http://localhost:8080$(RESET)"
	@echo "$(YELLOW)Press Ctrl+C to stop preview$(RESET)"

# Maintenance
clean: ## Clean all generated files
	@echo "$(BLUE)Cleaning generated files...$(RESET)"
	rm -rf public/
	rm -rf static/js/*.js
	rm -rf static/js/*.map
	rm -rf node_modules/.cache/
	rm -rf .hugo_build.lock
	@echo "$(GREEN)✓ Cleanup complete$(RESET)"

clean-all: clean ## Clean everything including node_modules
	@echo "$(BLUE)Deep cleaning...$(RESET)"
	rm -rf node_modules/
	rm -rf package-lock.json
	@echo "$(GREEN)✓ Deep cleanup complete$(RESET)"

update-deps: ## Update all dependencies
	@echo "$(BLUE)Updating dependencies...$(RESET)"
	npm update
	@echo "$(GREEN)✓ Dependencies updated$(RESET)"

# Content Management
new-post: ## Create new blog post
	@echo "$(BLUE)Creating new blog post...$(RESET)"
	@read -p "Enter post title: " title; \
	slug=$$(echo "$$title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$$//g'); \
	hugo new content/posts/$$slug.md; \
	echo "$(GREEN)✓ New post created: content/posts/$$slug.md$(RESET)"

new-author: ## Add new author profile
	@echo "$(BLUE)Adding new author...$(RESET)"
	@echo "$(YELLOW)Please edit data/authors.json manually$(RESET)"
	@echo "$(YELLOW)Then run: make validate$(RESET)"

# Documentation
docs: ## Generate and serve documentation
	@echo "$(BLUE)Generating documentation...$(RESET)"
	@echo "$(YELLOW)Documentation is available in README.md$(RESET)"
	@echo "$(YELLOW)Architecture documentation in ARCHITECTURE.md$(RESET)"
	@echo "$(YELLOW)Serving on http://localhost:$(LOCAL_PORT)$(RESET)"
	make serve

docs-update: ## Update documentation
	@echo "$(BLUE)Updating documentation...$(RESET)"
	@echo "$(YELLOW)Please update README.md and ARCHITECTURE.md manually$(RESET)"
	@echo "$(YELLOW)Consider updating:$(RESET)"
	@echo "  - Installation instructions"
	@echo "  - API documentation"
	@echo "  - Deployment guides"
	@echo "  - Contributing guidelines"

# Performance and Analytics
perf: ## Run performance tests
	@echo "$(BLUE)Running performance tests...$(RESET)"
	@echo "$(YELLOW)Building production version...$(RESET)"
	make build
	@echo "$(YELLOW)Starting server for testing...$(RESET)"
	hugo server --port 8081 --bind 0.0.0.0 &
	sleep 3
	@echo "$(YELLOW)Running Lighthouse audit...$(RESET)"
	npx lighthouse http://localhost:8081 --output html --output-path ./lighthouse-report.html || echo "$(YELLOW)Lighthouse not available$(RESET)"
	@echo "$(GREEN)✓ Performance test complete$(RESET)"

analyze: ## Analyze bundle size and dependencies
	@echo "$(BLUE)Analyzing project...$(RESET)"
	@echo "$(YELLOW)Bundle analysis...$(RESET)"
	npm run build
	@echo "$(YELLOW)Dependency analysis...$(RESET)"
	npm ls --depth=0
	@echo "$(YELLOW)Security analysis...$(RESET)"
	npm audit
	@echo "$(GREEN)✓ Analysis complete$(RESET)"

# Git Hooks and Automation
hooks: ## Install Git hooks
	@echo "$(BLUE)Installing Git hooks...$(RESET)"
	@echo "#!/bin/sh\nmake lint && make test-unit" > .git/hooks/pre-commit
	chmod +x .git/hooks/pre-commit
	@echo "#!/bin/sh\nmake validate" > .git/hooks/pre-push
	chmod +x .git/hooks/pre-push
	@echo "$(GREEN)✓ Git hooks installed$(RESET)"

# Status and Information
status: ## Show project status
	@echo "$(BLUE)Project Status$(RESET)"
	@echo "$(YELLOW)Git status:$(RESET)"
	git status --short
	@echo "$(YELLOW)Dependencies:$(RESET)"
	npm outdated || echo "All dependencies up to date"
	@echo "$(YELLOW)Build status:$(RESET)"
	@if [ -d "public" ]; then echo "✓ Built"; else echo "✗ Not built"; fi
	@echo "$(YELLOW)Security:$(RESET)"
	npm audit --audit-level high --summary

version: ## Show version information
	@echo "$(BLUE)Version Information$(RESET)"
	@echo "$(YELLOW)Hugo:$(RESET) $$(hugo version)"
	@echo "$(YELLOW)Node.js:$(RESET) $$(node --version)"
	@echo "$(YELLOW)npm:$(RESET) $$(npm --version)"
	@echo "$(YELLOW)act:$(RESET) $$(act --version 2>/dev/null || echo 'not installed')"

# Environment setup for different stages
env-dev: ## Set up development environment
	@echo "$(BLUE)Setting up development environment...$(RESET)"
	@echo "NODE_ENV=development" > .env.local
	@echo "HUGO_ENV=development" >> .env.local
	@echo "$(GREEN)✓ Development environment configured$(RESET)"

env-staging: ## Set up staging environment
	@echo "$(BLUE)Setting up staging environment...$(RESET)"
	@echo "NODE_ENV=production" > .env.staging
	@echo "HUGO_ENV=staging" >> .env.staging
	@echo "$(GREEN)✓ Staging environment configured$(RESET)"

env-prod: ## Set up production environment
	@echo "$(BLUE)Setting up production environment...$(RESET)"
	@echo "NODE_ENV=production" > .env.production
	@echo "HUGO_ENV=production" >> .env.production
	@echo "$(GREEN)✓ Production environment configured$(RESET)"

# All-in-one commands
quick-start: install dev ## Quick start for new developers
	@echo "$(GREEN)✓ Quick start complete - development server running$(RESET)"

full-test: clean install lint test build ## Full test suite
	@echo "$(GREEN)✓ Full test suite complete$(RESET)"

pre-deploy: clean install lint test build validate ## Pre-deployment checks
	@echo "$(GREEN)✓ Pre-deployment checks complete$(RESET)"

# Help for specific workflows
help-dev: ## Show development workflow help
	@echo "$(CYAN)Development Workflow:$(RESET)"
	@echo "1. $(YELLOW)make install$(RESET) - Install dependencies"
	@echo "2. $(YELLOW)make dev$(RESET) - Start development server"
	@echo "3. $(YELLOW)make new-post$(RESET) - Create new blog post"
	@echo "4. $(YELLOW)make test$(RESET) - Run tests"
	@echo "5. $(YELLOW)make lint$(RESET) - Check code quality"

help-deploy: ## Show deployment workflow help
	@echo "$(CYAN)Deployment Workflow:$(RESET)"
	@echo "1. $(YELLOW)make pre-deploy$(RESET) - Run all checks"
	@echo "2. $(YELLOW)git add . && git commit -m 'feat: new feature'$(RESET)"
	@echo "3. $(YELLOW)git push origin main$(RESET) - Triggers auto-deployment"
	@echo "4. $(YELLOW)make ci-local$(RESET) - Test locally first (optional)"

help-content: ## Show content creation help
	@echo "$(CYAN)Content Creation:$(RESET)"
	@echo "1. $(YELLOW)make new-post$(RESET) - Create new blog post"
	@echo "2. $(YELLOW)make new-author$(RESET) - Add author profile"
	@echo "3. $(YELLOW)make validate$(RESET) - Validate content"
	@echo "4. $(YELLOW)make dev$(RESET) - Preview changes"
