import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  permissions: string[];
}

const RoleSchema: Schema<IRole> = new Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String }],
});

export default mongoose.model<IRole>('Role', RoleSchema); 