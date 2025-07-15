const mongoose = require('mongoose');

const boardConfigSchema = new mongoose.Schema({
  lanes: [{
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

boardConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BoardConfig', boardConfigSchema);