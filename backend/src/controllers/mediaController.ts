import { Request, Response } from 'express';
import Media from '../models/Media';
import { VideoProcessingService } from '../services/VideoProcessingService';
import path from 'path';

// Helper function to determine media type from MIME type
const getMediaTypeFromMime = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType.startsWith('video/')) {
    return 'video';
  } else if (mimeType.startsWith('audio/')) {
    return 'audio';
  } else if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) {
    return 'document';
  } else {
    return 'other';
  }
};

// POST /api/media/upload
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    // File uploaded by multer middleware
    const file = req.file;
    const { type, isPublic = true, title } = req.body;
    const userId = req.user?.id; // Assume req.user is set by auth middleware

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    if (!type) {
      return res.status(400).json({ message: 'Type is required.' });
    }

    let thumbnailPath: string | undefined;

    // Generate thumbnail for video files
    if (VideoProcessingService.isVideoFile(file.filename)) {
      try {
        const videoPath = path.join(__dirname, '../../assets/media', file.filename);
        const thumbnailFilename = `thumb_${path.parse(file.filename).name}.jpg`;
        const thumbnailFullPath = path.join(__dirname, '../../assets/media', thumbnailFilename);
        
        await VideoProcessingService.generateThumbnail(videoPath, thumbnailFullPath);
        thumbnailPath = `/assets/media/${thumbnailFilename}`;
        
        console.log('Thumbnail generated for video:', file.filename);
      } catch (thumbnailError) {
        console.error('Failed to generate thumbnail:', thumbnailError);
        // Continue without thumbnail if generation fails
      }
    }

    const media = new Media({
      url: `/assets/media/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      title: title || file.originalname, // Use provided title or fallback to original filename
      thumbnail: thumbnailPath, // Add thumbnail path if generated
      type,
      mediaType: getMediaTypeFromMime(file.mimetype), // Automatically detect media type
      uploadedBy: userId,
      isPublic: isPublic === 'true' || isPublic === true,
    });
    await media.save();
    res.status(201).json({ message: 'Media uploaded successfully.', media });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload media.', error });
  }
};

// GET /api/media/templates - Get all meme templates
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await Media.find({ type: 'template' })
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch templates.', error });
  }
};

// DELETE /api/media/templates/:id - Delete a template
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const template = await Media.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found.' });
    }
    res.json({ message: 'Template deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete template.', error });
  }
};

// PUT /api/media/templates/:id/status - Update template status (super admin only)
export const updateTemplateStatus = async (req: Request, res: Response) => {
  try {
    const { isPublic } = req.body;
    
    if (typeof isPublic !== 'boolean') {
      return res.status(400).json({ message: 'isPublic must be a boolean value.' });
    }

    const template = await Media.findByIdAndUpdate(
      req.params.id,
      { isPublic },
      { new: true }
    ).populate('uploadedBy', 'username');

    if (!template) {
      return res.status(404).json({ message: 'Template not found.' });
    }

    res.json({ 
      message: `Template ${isPublic ? 'made public' : 'made private'} successfully.`,
      template 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update template status.', error });
  }
};

// GET /api/media/public/templates - Get public templates for users
export const getPublicTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await Media.find({ type: 'template', isPublic: true })
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch public templates.', error });
  }
}; 