import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  buyer: Types.ObjectId;
  seller: Types.ObjectId;
  memeId: string;
  memeType: 'Meme' | 'GeneratedImage';
  price: number;
  commission: number;
  sellerEarnings: number;
  platformEarnings: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionDate: Date;
  paymentMethod?: string;
  transactionId?: string;
}

const TransactionSchema: Schema = new Schema({
  buyer: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  seller: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  memeId: { 
    type: String, 
    required: true 
  },
  memeType: { 
    type: String, 
    enum: ['Meme', 'GeneratedImage'], 
    required: true 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  commission: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  sellerEarnings: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  platformEarnings: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  transactionDate: { 
    type: Date, 
    default: Date.now 
  },
  paymentMethod: { 
    type: String 
  },
  transactionId: { 
    type: String 
  }
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema); 