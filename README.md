# Community Board Application

A Node.js/Express community board with a kanban-style interface where users can share stories and comments. Features admin approval system for new users, customizable swimlanes, and drag-and-drop functionality.

## Prerequisites

- Docker and Docker Compose
- Node.js (if running without Docker)
- MongoDB (if running without Docker)

## Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd CommunityBoard
```

### 2. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` and update the following:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this
MONGODB_URI=mongodb://root:yourmongopassword@mongodb:27017/communityboard?authSource=admin
MONGO_ROOT_PASSWORD=yourmongopassword
MONGO_EXPRESS_PASSWORD=youradminpassword
```

### 3. Start the application with Docker
```bash
docker-compose up -d
```

This starts:
- MongoDB database
- Mongo Express admin interface on http://localhost:8081
- Community Board application on http://localhost:3000

### 4. Access the application
Open http://localhost:3000 in your browser

## Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

Response:
```json
{
  "message": "User registered successfully. Waiting for admin approval."
}
```

### Admin approval (via Mongo Express)
1. Visit http://localhost:8081
2. Login with credentials from `.env`
3. Navigate to `communityboard` database → `users` collection
4. Find the user and set `isApproved: true`

### Login (after approval)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Create a story (authenticated)
```bash
curl -X POST http://localhost:3000/api/stories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My First Story",
    "content": "This is an amazing story about...",
    "category": "general"
  }'
```

### Get all stories
```bash
curl http://localhost:3000/api/stories
```

### Add a comment to a story
```bash
curl -X POST http://localhost:3000/api/stories/STORY_ID/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Great story!"
  }'
```

## Features

### Kanban Board
- Customizable swimlanes (lanes)
- Drag-and-drop stories between lanes
- Admin can configure lane names and order
- Stories automatically map to new lanes when configuration changes

### User Roles
- **User**: Can view stories and add comments
- **Editor**: Can create stories and move them between lanes
- **Admin**: Full access including user management and board configuration

### Logging
- File-based logging with rotation
- Environment-based logging levels:
  - `production`: Logs to files only (info level)
  - `debug`: Verbose logging to console and files
  - `development`: Console and file logging (debug level)
- Logs stored in `logs/` directory:
  - `combined.log`: All application logs
  - `error.log`: Error-level logs only

## Default Admin Account

- Email: admin@communityboard.com
- Password: admin123

**Important**: Change these credentials before deploying to production!

## Development

### View logs
```bash
# Docker logs
docker-compose logs -f app

# Application logs
tail -f logs/combined.log
```

### Stop the application
```bash
docker-compose down
```

### Reset database
```bash
docker-compose down -v
docker-compose up -d
```

### Run without Docker
```bash
# Install dependencies
npm install

# Start MongoDB locally
# Update MONGODB_URI in .env to point to local MongoDB

# Start the application
npm start
```

## Testing

Run tests:
```bash
npm test
```

## Deployment Scripts

The project includes several deployment scripts in the `scripts/` directory:

### Deploy Script (`scripts/deploy.sh`)
General purpose deployment script for development and testing:
```bash
./scripts/deploy.sh                    # Build and deploy
./scripts/deploy.sh --build-only       # Only build Docker image
./scripts/deploy.sh --restart          # Stop and restart all containers
./scripts/deploy.sh --logs             # Deploy and show logs
```

### Production Deploy Script (`scripts/deploy-production.sh`)
Production deployment with safety checks:
```bash
./scripts/deploy-production.sh         # Full production deployment
```
This script:
- Verifies environment configuration
- Ensures secure passwords are set
- Runs database migrations
- Creates default admin user if needed

### Update Script (`scripts/update.sh`)
Quick update after code changes:
```bash
./scripts/update.sh                    # Rebuild and restart app only
```

## Security Notes

- Change all default passwords in `.env` before deployment
- Never commit `.env` file to version control
- Use strong JWT secrets
- All users require admin approval before accessing the platform

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Stories
- `GET /api/stories` - Get all stories
- `POST /api/stories` - Create story (editor/admin required)
- `GET /api/stories/:id` - Get single story
- `PUT /api/stories/:id` - Update story (editor/admin required)
- `DELETE /api/stories/:id` - Delete story (editor/admin required)
- `POST /api/stories/:id/comments` - Add comment (auth required)

### Board Management
- `GET /api/board/config` - Get board configuration (auth required)
- `PUT /api/board/config` - Update board configuration (admin required)
- `PUT /api/board/stories/:id/move` - Move story between lanes (editor/admin required)

### Users
- `GET /api/users` - Get all users (admin required)
- `GET /api/users/pending` - Get pending users (admin required)
- `PATCH /api/users/:id/approve` - Approve user (admin required)
- `DELETE /api/users/:id` - Delete user (admin required)