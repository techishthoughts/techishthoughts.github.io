.PHONY: help serve build clean new-post

# Variables
HUGO := hugo
PORT := 1313
POST_NAME ?= new-post
AUTHOR ?= default-author

help: ## Show this help message
	@echo 'Usage:'
	@echo '  make <target>'
	@echo ''
	@echo 'Targets:'
	@egrep '^(.+)\:\ ##\ (.+)' ${MAKEFILE_LIST} | column -t -c 2 -s ':#'

serve: ## Start Hugo server with drafts enabled
	$(HUGO) server -D --port $(PORT)

build: clean ## Build the site
	$(HUGO) --minify

clean: ## Clean public directory
	rm -rf public/

new-post: ## Create a new post (usage: make new-post POST_NAME="my-post-title" AUTHOR="author-id")
	$(HUGO) new content/posts/$(POST_NAME).md
	@sed -i '' '4i\author: $(AUTHOR)' content/posts/$(POST_NAME).md

check: ## Run link checker and validation
	$(HUGO)
	@echo "Checking links..."
	@# Add your preferred link checker here

install: ## Install dependencies
	@echo "Checking Hugo installation..."
	@if ! command -v hugo >/dev/null 2>&1; then \
		echo "Hugo not found. Please install Hugo: https://gohugo.io/installation/"; \
		exit 1; \
	fi