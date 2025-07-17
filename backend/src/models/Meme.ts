import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMeme extends Document {
  url: string;
  overlays?: any[];
  createdAt: Date;
  is_public: boolean;
  user: Types.ObjectId;
}

const MemeSchema: Schema = new Schema({
  url: { type: String, required: true },
  overlays: { type: Array },
  createdAt: { type: Date, default: Date.now },
  is_public: { type: Boolean, default: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model<IMeme>('Meme', MemeSchema); 