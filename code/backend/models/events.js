import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  comments: [{
    userId: String,
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  selected_dropdown: {
    type: String,
    default: 'General'
  },
  image_path: {  // Make sure this field exists
    type: String
  },
  locations: [{
    type: String
  }],
  projects: [{
    type: String
  }]
});

const Event = mongoose.model('Event', eventSchema);
export default Event;