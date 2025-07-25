import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGeneratedImage extends Document {
  url: string;
  title?: string;
  description?: string;
  prompt?: string;
  style?: string;
  modelUsed?: string;
  createdAt: Date;
  is_public: boolean;
  user: Types.ObjectId;
  likeCount?: number;
  reviewCount?: number;
}

const GeneratedImageSchema: Schema = new Schema({
  url: { type: String, required: true },
  title: { type: String, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  prompt: { type: String },
  style: { type: String },
  modelUsed: { type: String },
  createdAt: { type: Date, default: Date.now },
  is_public: { type: Boolean, default: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// Virtual fields for like and review counts
GeneratedImageSchema.virtual('likeCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'meme',
  count: true,
  match: { memeType: 'GeneratedImage' }
});

GeneratedImageSchema.virtual('reviewCount', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'meme',
  count: true,
  match: { memeType: 'GeneratedImage' }
});

// Ensure virtual fields are included in JSON output
GeneratedImageSchema.set('toJSON', { virtuals: true });
GeneratedImageSchema.set('toObject', { virtuals: true });

export default mongoose.model<IGeneratedImage>('GeneratedImage', GeneratedImageSchema); 