.PHONY: help clean install build serve dev

default: clean install build serve
	@echo 'Default target: clean, install, build, serve'
	@echo 'To run a specific target, use: make <target>'
	@echo ''
	@echo 'Available targets:'
	@egrep '^(.+)\:\ ##\ (.+)' ${MAKEFILE_LIST} | column -t -c 2 -s ':#'
	@echo ''

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
	@echo 'Hugo server started at http://localhost:1313'
	@echo 'Press Ctrl+C to stop the server'
	@echo 'Note: You may need to refresh the page in your browser after stopping and starting the server.'
	

dev: ## Start development servers
	npm run watch & hugo server
	@echo 'Development server started at http://localhost:1313'
	@echo 'React app started at http://localhost:3000'
	@echo 'Press Ctrl+C to stop both servers'
	@echo 'Note: You may need to refresh the page in your browser after stopping and starting the servers.'
