.PHONY: dev build start lint typecheck test check ci install help

.DEFAULT_GOAL := help

help:
	@echo Available commands:
	@echo   make dev        - Start Next.js development server
	@echo   make build      - Run production build
	@echo   make start      - Start production server
	@echo   make lint       - Run ESLint checks
	@echo   make typecheck  - Run TypeScript compiler check
	@echo   make test       - Run Vitest test suite
	@echo   make check      - Run all verification checks (lint, typecheck, test, build)
	@echo   make ci         - Alias for make check
	@echo   make install    - Install dependencies

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

typecheck:
	npm run typecheck

test:
	npm test

check: lint typecheck test build

ci: check

install:
	npm install
