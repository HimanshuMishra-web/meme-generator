import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGeneratedImage extends Document {
  url: string;
  prompt: string;
  style: string;
  modelUsed: string;
  createdAt: Date;
  is_public: boolean;
  user: Types.ObjectId;
}

const GeneratedImageSchema: Schema = new Schema({
  url: { type: String, required: true },
  prompt: { type: String, required: true },
  style: { type: String, required: true },
  modelUsed: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  is_public: { type: Boolean, default: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model<IGeneratedImage>('GeneratedImage', GeneratedImageSchema); 