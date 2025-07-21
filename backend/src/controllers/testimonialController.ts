import { Request, Response } from 'express';
import Testimonial from '../models/Testimonial';
import path from 'path';

// Create a testimonial
export const createTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, content, rating } = req.body;
    let profileImage = req.body.profileImage;
    if (req.file) {
      // Save file path relative to assets
      profileImage = `/assets/testimonial-images/${req.file.filename}`;
    }
    const testimonial = new Testimonial({ profileImage, name, content, rating });
    await testimonial.save();
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create testimonial', error });
  }
};

// Get all testimonials
export const getTestimonials = async (req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch testimonials', error });
  }
};

// Get testimonial by ID
export const getTestimonialById = async (req: Request, res: Response): Promise<void> => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch testimonial', error });
  }
};

// Update testimonial
export const updateTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, content, rating } = req.body;
    let profileImage = req.body.profileImage;
    if (req.file) {
      profileImage = `/assets/testimonial-images/${req.file.filename}`;
    }
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { profileImage, name, content, rating },
      { new: true }
    );
    if (!testimonial) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update testimonial', error });
  }
};

// Delete testimonial
export const deleteTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }
    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete testimonial', error });
  }
}; 