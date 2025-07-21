import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  profileImage: string;
  name: string;
  content: string;
  rating: number;
  createdAt: Date;
}

const TestimonialSchema: Schema = new Schema({
  profileImage: { type: String, required: true },
  name: { type: String, required: true },
  content: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ITestimonial>('Testimonial', TestimonialSchema); 