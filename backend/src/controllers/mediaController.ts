import { Request, Response } from 'express';
import Media from '../models/Media';

// POST /api/media/upload
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    // File uploaded by multer middleware
    const file = req.file;
    const { type } = req.body;
    const userId = req.user?.id; // Assume req.user is set by auth middleware

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    if (!type) {
      return res.status(400).json({ message: 'Type is required.' });
    }

    const media = new Media({
      url: `/assets/media/${file.filename}`,
      type,
      uploadedBy: userId,
    });
    await media.save();
    res.status(201).json({ message: 'Media uploaded successfully.', media });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload media.', error });
  }
}; 