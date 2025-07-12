import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
  url: string;
  type: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const MediaSchema: Schema = new Schema({
  url: { type: String, required: true },
  type: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IMedia>('Media', MediaSchema); 