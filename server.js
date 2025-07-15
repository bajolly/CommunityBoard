const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/stories');
const userRoutes = require('./routes/users');
const boardRoutes = require('./routes/board');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/communityboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  logger.info('Connected to MongoDB');
}).catch((err) => {
  logger.error('MongoDB connection error:', err);
  process.exit(1);
});

app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/board', boardRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV === 'debug' || process.env.DEBUG === 'true') {
    logger.debug('Debug mode enabled');
  }
});