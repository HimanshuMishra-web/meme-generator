import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISupport extends Document {
  user: Types.ObjectId;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: Types.ObjectId;
  attachments?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupportSchema: Schema<ISupport> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['technical', 'billing', 'feature_request', 'bug_report', 'general'], 
    default: 'general' 
  },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'resolved', 'closed'], 
    default: 'open' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  attachments: [{ type: String }],
  notes: { type: String },
}, {
  timestamps: true
});

export default mongoose.model<ISupport>('Support', SupportSchema); 