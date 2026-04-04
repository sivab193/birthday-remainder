.PHONY: up down restart logs ps prune build test test-smtp test-telegram test-discord help

# Start all workers in background
up:
	docker compose up -d

# Start all workers and rebuild images
build:
	docker compose up -d --build

# Stop and remove containers
down:
	docker compose down

# Restart all workers
restart:
	docker compose restart

# View follow logs
logs:
	docker compose logs -f

# Check status of containers
ps:
	docker compose ps

# Clean up unused images/volumes
prune:
	docker image prune -f

# Run all integration tests
test: test-smtp test-telegram test-discord
	@echo "All integration tests completed"

# Run all integration tests with a single command
test-all:
	python run_tests.py

# Test SMTP configuration
test-smtp:
	@echo "Testing SMTP configuration..."
	python tests/test_smtp.py

# Test Telegram bot
test-telegram:
	@echo "Testing Telegram bot..."
	python tests/test_telegram.py

# Test Discord webhook
test-discord:
	@echo "Testing Discord webhook..."
	python tests/test_discord.py

# Run bulk import (requires events.csv and USER_UID env var)
bulk-import:
	@echo "Running bulk import..."
	docker compose --profile import run --rm bulk_import

# Show help
help:
	@echo "Available commands:"
	@echo "  make up      - Start workers in background"
	@echo "  make build   - Rebuild and start workers"
	@echo "  make down    - Stop workers"
	@echo "  make restart - Restart workers"
	@echo "  make logs    - View real-time logs"
	@echo "  make ps      - Check container status"
	@echo "  make prune   - Clean up Docker history"
	@echo "  make test    - Run all integration tests (individual)"
	@echo "  make test-all - Run all integration tests (single command)"
	@echo "  make test-smtp      - Test SMTP configuration"
	@echo "  make test-telegram  - Test Telegram bot"
	@echo "  make test-discord   - Test Discord webhook"
	@echo "  make bulk-import    - Run bulk import (requires events.csv)"
