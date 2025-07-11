// MongoDB initialization script
db = db.getSiblingDB('communityboard');

// Create collections
db.createCollection('users');
db.createCollection('stories');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.stories.createIndex({ "createdAt": -1 });
db.stories.createIndex({ "author": 1 });

// Create an admin user (password: admin123)
db.users.insertOne({
  fullname: "System Administrator",
  email: "admin@communityboard.com",
  password: "$2a$10$D6OKBMBUvK/AN7y4rWYmO.cOmXityem8m6glMVXpa7ObJ2U1N78nq", // admin123
  address: "System",
  role: "admin",
  isApproved: true,
  createdAt: new Date()
});

print('Database initialization completed');
print('Admin user created: admin@communityboard.com / admin123');