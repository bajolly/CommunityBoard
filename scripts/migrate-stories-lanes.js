const mongoose = require('mongoose');
const Story = require('../models/Story');
require('dotenv').config();

async function migrateStories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/communityboard', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find all stories without a lane field
    const storiesWithoutLane = await Story.find({ lane: { $exists: false } });
    console.log(`Found ${storiesWithoutLane.length} stories without lane field`);

    // Update each story to have lane '0' (To Do) and appropriate position
    for (let i = 0; i < storiesWithoutLane.length; i++) {
      const story = storiesWithoutLane[i];
      story.lane = '0';
      story.position = i;
      await story.save();
      console.log(`Updated story: ${story.title}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateStories();