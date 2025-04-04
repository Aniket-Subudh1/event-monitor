# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Backend: `cd backend && npm run dev` - Start backend development server
- Frontend: `cd frontend && npm start` - Start frontend development server
- Backend Debug: `cd backend && npm run debug` - Start backend in debug mode

## Test Commands
- Frontend: `cd frontend && npm test` - Run all frontend tests
- Frontend (single test): `cd frontend && npm test -- -t 'test name'` - Run specific test

## Lint/Format
- Frontend has ESLint configured via `eslintConfig` in package.json
- Use standard React/ES2015+ JavaScript style

## Code Style Guidelines
- Backend: Node.js with Express, MongoDB via Mongoose
- Frontend: React with TailwindCSS for styling
- Error handling: Use try/catch with async/await, use logger for errors
- Imports: Group dependencies, internal modules, models, utils
- Components: Functional React components with props destructuring
- Naming: camelCase for variables/functions, PascalCase for components/classes
- Documentation: JSDoc for backend functions
- Async code: Use async/await pattern over promises chaining