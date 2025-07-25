import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMeme extends Document {
  url: string;
  title?: string;
  description?: string;
  overlays?: any[];
  createdAt: Date;
  is_public: boolean;
  user: Types.ObjectId;
  likeCount?: number;
  reviewCount?: number;
}

const MemeSchema: Schema = new Schema({
  url: { type: String, required: true },
  title: { type: String, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  overlays: { type: Array },
  createdAt: { type: Date, default: Date.now },
  is_public: { type: Boolean, default: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// Virtual fields for like and review counts
MemeSchema.virtual('likeCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'meme',
  count: true,
  match: { memeType: 'Meme' }
});

MemeSchema.virtual('reviewCount', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'meme',
  count: true,
  match: { memeType: 'Meme' }
});

// Ensure virtual fields are included in JSON output
MemeSchema.set('toJSON', { virtuals: true });
MemeSchema.set('toObject', { virtuals: true });

export default mongoose.model<IMeme>('Meme', MemeSchema); 