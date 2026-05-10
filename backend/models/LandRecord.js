const mongoose = require('mongoose');

const landRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  coordinates: [
    {
      lat: Number,
      lng: Number
    }
  ],
  area: {
    value: Number,
    unit: {
      type: String,
      enum: ['sq.ft', 'sq.meter', 'acre', 'hectare', 'vigha', 'guntha'],
      default: 'sq.meter'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  documents: [
    {
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  surveyMode: {
    type: String,
    enum: ['manual', 'gps'],
    default: 'manual'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LandRecord', landRecordSchema);
