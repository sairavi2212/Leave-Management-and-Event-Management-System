import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

export default mongoose.model('Location', locationSchema);
