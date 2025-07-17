import { Request, Response } from 'express';
import { ImageGeneratorService } from '../services/ImageGeneratorService';
import GeneratedImage from '../models/GeneratedImage';
import Meme from '../models/Meme';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

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
    // Optionally get overlays from req.body
    const overlays = req.body.overlays ? JSON.parse(req.body.overlays) : undefined;
    const newDoc = await Meme.create({
      url: fileUrl,
      overlays,
      createdAt: new Date(),
      is_public: false,
      user: userId
    });
    res.status(201).json({ message: 'Saved to your collection', meme: newDoc });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save to collection' });
  }
};
