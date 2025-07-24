import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILike extends Document {
  user: Types.ObjectId;
  meme: Types.ObjectId;
  memeType: 'Meme' | 'GeneratedImage'; // To handle both meme types
  createdAt: Date;
}

const LikeSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  meme: { type: Schema.Types.ObjectId, required: true, refPath: 'memeType' },
  memeType: { type: String, required: true, enum: ['Meme', 'GeneratedImage'] },
  createdAt: { type: Date, default: Date.now },
});

// Ensure one like per user per meme
LikeSchema.index({ user: 1, meme: 1, memeType: 1 }, { unique: true });

export default mongoose.model<ILike>('Like', LikeSchema); 