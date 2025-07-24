import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  user: Types.ObjectId;
  meme: Types.ObjectId;
  memeType: 'Meme' | 'GeneratedImage'; // To handle both meme types
  content: string;
  rating?: number; // Optional 1-5 star rating
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  meme: { type: Schema.Types.ObjectId, required: true, refPath: 'memeType' },
  memeType: { type: String, required: true, enum: ['Meme', 'GeneratedImage'] },
  content: { type: String, required: true, maxlength: 1000 },
  rating: { type: Number, min: 1, max: 5 }, // Optional star rating
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Ensure one review per user per meme
ReviewSchema.index({ user: 1, meme: 1, memeType: 1 }, { unique: true });

// Update the updatedAt field on save
ReviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IReview>('Review', ReviewSchema); 