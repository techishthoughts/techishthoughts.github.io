.PHONY: help clean install build serve dev

help: ## Show this help message
	@echo 'Usage:'
	@echo '  make <target>'
	@echo ''
	@echo 'Targets:'
	@egrep '^(.+)\:\ ##\ (.+)' ${MAKEFILE_LIST} | column -t -c 2 -s ':#'

clean: ## Clean generated files
	rm -rf public/
	rm -rf static/js/
	rm -rf node_modules/
	rm -f package-lock.json

install: ## Install dependencies
	npm install

build: ## Build both Hugo and React
	npm run build
	hugo --minify

serve: ## Start Hugo server
	hugo server

dev: ## Start development servers
	npm run watch & hugo server