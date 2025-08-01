import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSettings extends Document {
  commissionRate: number;
  minimumPrice: number;
  maximumPrice: number;
  updatedBy: string;
  updatedAt: Date;
}

const PlatformSettingsSchema: Schema = new Schema({
  commissionRate: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100, 
    default: 10 
  },
  minimumPrice: { 
    type: Number, 
    required: true, 
    min: 0, 
    default: 1 
  },
  maximumPrice: { 
    type: Number, 
    required: true, 
    min: 0, 
    default: 1000 
  },
  updatedBy: { 
    type: String, 
    required: true 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema); 