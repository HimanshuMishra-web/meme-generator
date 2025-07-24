import { Request, Response } from 'express';
import { ImageGeneratorService } from '../services/ImageGeneratorService';
import GeneratedImage from '../models/GeneratedImage';
import Meme from '../models/Meme';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import User from '../models/User';

const imageService = new ImageGeneratorService(process.env.OPENAI_API_KEY!);

// Multer setup for meme image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save to assets/memes/{userId}/
    const userId = req.user?.id || 'anonymous';
    const dir = path.join(__dirname, '../../assets/memes', userId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.png');
  }
});
export const memeUpload = multer({ storage });

export const generateImage = async (req: Request, res: Response) => {
  const { prompt, style, model, is_public = false } = req.body;
  const userId = req.user?.id;

  if (!prompt || !style || !model) {
    return res.status(400).json({ error: "Prompt, style, and model are required" });
  }
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const imageUrls = await imageService.generateImage({
      prompt,
      style,
      model,
      n: 1,
      size: '1024x1024'
    });

    if (imageUrls.length === 0) {
      return res.status(500).json({ error: "No image returned from OpenAI" });
    }

    // Save image locally
    const localPath = await ImageGeneratorService.saveImageFromUrl(imageUrls[0], userId);

    // Store metadata in MongoDB
    const imageDoc = await GeneratedImage.create({
      url: localPath,
      prompt,
      style,
      modelUsed: model,
      createdAt: new Date(),
      is_public,
      user: userId
    });

    res.json({
      image: {
        url: imageDoc.url,
        prompt: imageDoc.prompt,
        style: imageDoc.style,
        modelUsed: imageDoc.modelUsed,
        createdAt: imageDoc.createdAt,
        is_public: imageDoc.is_public,
        user: imageDoc.user
      }
    });
  } catch (error: any) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: error.message || "Failed to generate image" });
  }
};

export const saveToCollection = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  try {
    const fileUrl = `/assets/memes/${userId}/${req.file.filename}`;
    
    // Get all the metadata from the request
    const overlays = req.body.overlays ? JSON.parse(req.body.overlays) : undefined;
    const isPublic = req.body.is_public === 'true' || req.body.is_public === true;
    const title = req.body.title?.trim() || undefined;
    const description = req.body.description?.trim() || undefined;
    
    // Validate title and description lengths
    if (title && title.length > 100) {
      return res.status(400).json({ error: 'Title must be 100 characters or less' });
    }
    if (description && description.length > 500) {
      return res.status(400).json({ error: 'Description must be 500 characters or less' });
    }

    const memeData = {
      url: fileUrl,
      title,
      description,
      overlays,
      createdAt: new Date(),
      is_public: isPublic,
      user: userId
    };

    // If it's an AI-generated image, save to GeneratedImage model
    if (req.body.prompt || req.body.style || req.body.modelUsed) {
      const newDoc = await GeneratedImage.create({
        ...memeData,
        prompt: req.body.prompt || undefined,
        style: req.body.style || undefined,
        modelUsed: req.body.modelUsed || undefined
      });
      res.status(201).json({ message: 'Saved to your collection', meme: newDoc, type: 'GeneratedImage' });
    } else {
      // Otherwise save as regular Meme
      const newDoc = await Meme.create(memeData);
      res.status(201).json({ message: 'Saved to your collection', meme: newDoc, type: 'Meme' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save to collection' });
  }
};

export const getMyMemes = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  try {
    const memes = await Meme.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ memes });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch memes' });
  }
};

export const getCommunityMemes = async (req: Request, res: Response) => {
  try {
    // First get all public users
    const publicUsers = await User.find({ isPublic: true }).select('_id');
    const publicUserIds = publicUsers.map(user => user._id);
    
    // Get public memes from public users (both GeneratedImages and Memes)
    const [generatedImages, savedMemes] = await Promise.all([
      GeneratedImage.find({ 
        user: { $in: publicUserIds },
        is_public: true  // Only get memes marked as public
      })
      .populate('user', 'username profileImage isPublic')
      .populate('likeCount')
      .populate('reviewCount')
      .sort({ createdAt: -1 }),
      
      Meme.find({ 
        user: { $in: publicUserIds },
        is_public: true  // Only get memes marked as public
      })
      .populate('user', 'username profileImage isPublic')
      .populate('likeCount')
      .populate('reviewCount')
      .sort({ createdAt: -1 })
    ]);
    
    // Add memeType field to each meme for frontend use
    const allMemes = [
      ...generatedImages.map(meme => ({ ...meme.toObject(), memeType: 'GeneratedImage' })),
      ...savedMemes.map(meme => ({ ...meme.toObject(), memeType: 'Meme' }))
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50); // Limit to latest 50 community memes
    
    res.json({ memes: allMemes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch community memes', error });
  }
};

export const getUserPublicMemes = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists and is public
    const user = await User.findById(userId);
    if (!user || !user.isPublic) {
      return res.status(404).json({ message: 'User not found or profile not public' });
    }
    
    // Get public memes from this user
    const [generatedImages, savedMemes] = await Promise.all([
      GeneratedImage.find({ 
        user: userId,
        is_public: true
      })
      .populate('user', 'username profileImage isPublic'),
      
      Meme.find({ 
        user: userId,
        is_public: true
      })
      .populate('user', 'username profileImage isPublic')
    ]);
    
    // Combine both types and sort by creation date
    const allMemes = [...generatedImages, ...savedMemes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json({ 
      user: {
        _id: user._id,
        username: user.username,
        bio: user.bio,
        profileImage: user.profileImage,
        isPublic: user.isPublic
      },
      memes: allMemes 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user memes', error });
  }
};

// Update privacy status for a generated image
export const updateGeneratedImagePrivacy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_public } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (typeof is_public !== 'boolean') {
      return res.status(400).json({ message: 'is_public must be a boolean value' });
    }

    // Find the generated image and verify ownership
    const generatedImage = await GeneratedImage.findOne({ _id: id, user: userId });
    if (!generatedImage) {
      return res.status(404).json({ message: 'Generated image not found or access denied' });
    }

    // Update privacy status
    generatedImage.is_public = is_public;
    await generatedImage.save();

    res.json({ 
      message: `Generated image ${is_public ? 'made public' : 'made private'} successfully`,
      meme: generatedImage 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update generated image privacy', error });
  }
};

// Update privacy status for a saved meme
export const updateMemePrivacy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_public } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (typeof is_public !== 'boolean') {
      return res.status(400).json({ message: 'is_public must be a boolean value' });
    }

    // Find the meme and verify ownership
    const meme = await Meme.findOne({ _id: id, user: userId });
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found or access denied' });
    }

    // Update privacy status
    meme.is_public = is_public;
    await meme.save();

    res.json({ 
      message: `Meme ${is_public ? 'made public' : 'made private'} successfully`,
      meme: meme 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update meme privacy', error });
  }
};
