import mongoose, { Document, Schema } from 'mongoose';

export interface IToken extends Document {
  user: mongoose.Types.ObjectId;
  token: string;
  expiry: Date;
}

const TokenSchema: Schema<IToken> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expiry: { type: Date, required: true },
});

export default mongoose.model<IToken>('Token', TokenSchema); 