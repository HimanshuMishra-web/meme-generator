import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
  url: string;
  filename: string;
  originalName: string;
  title?: string; // Add optional title field
  thumbnail?: string; // Add optional thumbnail field for videos
  type: string;
  mediaType: string; // Add media type field (image, video, etc.)
  uploadedBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
}

const MediaSchema: Schema = new Schema({
  url: { type: String, required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  title: { type: String }, // Add optional title field
  thumbnail: { type: String }, // Add optional thumbnail field for videos
  type: { type: String, required: true, enum: ['template', 'meme', 'banner', 'other'] },
  mediaType: { type: String, required: true, enum: ['image', 'video', 'audio', 'document', 'other'] },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IMedia>('Media', MediaSchema); 