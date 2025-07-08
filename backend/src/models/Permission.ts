import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  slug: string;
  description: string;
}

const PermissionSchema: Schema<IPermission> = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
});

export default mongoose.model<IPermission>('Permission', PermissionSchema); 