import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MONGO_URI } from '../constants';
dotenv.config();


export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
