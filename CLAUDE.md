# Community Board Project - Claude Code Rules

## Project Overview
A Node.js/Express community board application with MongoDB for posting stories and comments. Users require admin approval before accessing the platform.

## Code Style & Standards
- Use semicolons in JavaScript
- Prefer async/await over .then() chains
- Use 2-space indentation
- Use const/let instead of var
- Follow existing naming conventions (camelCase for variables, PascalCase for models)

## Security Requirements
- **CRITICAL**: Never commit secrets, passwords, or API keys to git
- Always use environment variables for sensitive configuration
- Validate all user input with express-validator
- Use bcrypt for password hashing (already implemented)
- JWT tokens must use strong secrets from environment variables
- Always check user approval status before granting access

## Database Guidelines
- Use MongoDB with Mongoose ODM
- Always use proper error handling for database operations
- Use transactions for multi-step operations
- Follow existing schema patterns in models/ directory

## Testing & Quality
- Run tests with: `npm test`
- Run linting with: `npm run lint` (if available)
- Always test authentication flows after changes
- Verify environment variables are properly loaded

## Development Workflow
- Use Docker Compose for local development
- Copy .env.example to .env and update passwords before first run
- Start services with: `docker-compose up -d`
- Access mongo-express at http://localhost:8081 (requires auth)

## File Structure
- `/routes/` - API endpoints (auth, stories, users)
- `/models/` - Mongoose schemas (User, Story)
- `/middleware/` - Authentication and authorization
- `/public/` - Static frontend files
- `server.js` - Main application entry point

## Authentication Flow
1. Users register via `/api/auth/signup` (pending approval)
2. Admin approves users (sets isApproved: true)
3. Users login via `/api/auth/login` to receive JWT
4. JWT required for protected routes via Authorization header

## Environment Variables
Always ensure these are set in .env:
- `JWT_SECRET` - Strong secret for JWT signing
- `MONGODB_URI` - Database connection string
- `MONGO_ROOT_PASSWORD` - Database admin password
- `MONGO_EXPRESS_PASSWORD` - Admin interface password

## Before Making Public
- [ ] Change all default passwords in .env
- [ ] Remove any test/debug code
- [ ] Verify .gitignore includes .env
- [ ] Test Docker setup from scratch
- [ ] Review all routes for security issues