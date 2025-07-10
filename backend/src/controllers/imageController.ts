import { Request, Response } from 'express';
import { ImageGeneratorService } from '../services/ImageGeneratorService';
import GeneratedImage from '../models/GeneratedImage';

const imageService = new ImageGeneratorService(process.env.OPENAI_API_KEY!);

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
