// MongoDB initialization script
db = db.getSiblingDB('communityboard');

// Create collections
db.createCollection('users');
db.createCollection('stories');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.stories.createIndex({ "createdAt": -1 });
db.stories.createIndex({ "author": 1 });

// Create an admin user with environment-based configuration
const adminEmail = process.env.ADMIN_EMAIL || "admin@communityboard.com";

// SECURITY WARNING: Change this password hash in production!
// This is a pre-computed bcrypt hash for password "admin123" (salt rounds: 10)
// 
// To generate a new hash for production:
// 1. Install bcryptjs: npm install bcryptjs
// 2. Generate hash: node -e "console.log(require('bcryptjs').hashSync('your_new_password', 10))"
// 3. Set ADMIN_PASSWORD_HASH environment variable with the generated hash
// 
// Example for password "mySecurePassword123":
// ADMIN_PASSWORD_HASH=$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop
const defaultPasswordHash = "$2a$10$D6OKBMBUvK/AN7y4rWYmO.cOmXityem8m6glMVXpa7ObJ2U1N78nq"; // admin123

// Use custom hash from environment, or fall back to default (NOT SECURE for production)
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || defaultPasswordHash;

db.users.insertOne({
  fullname: "System Administrator",
  email: adminEmail,
  password: adminPasswordHash,
  address: "System",
  role: "admin",
  isApproved: true,
  createdAt: new Date()
});

print('Database initialization completed');
print('Admin user created with email: ' + adminEmail);
if (!process.env.ADMIN_PASSWORD_HASH) {
  print('⚠️  WARNING: Using default password "admin123" - CHANGE THIS IN PRODUCTION!');
  print('Set ADMIN_PASSWORD_HASH environment variable with a secure bcrypt hash');
}