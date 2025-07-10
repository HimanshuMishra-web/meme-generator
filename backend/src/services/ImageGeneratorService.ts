import { OpenAI } from 'openai';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

type ImageStyle = 'realistic' | 'anime' | 'cartoon' | 'storybook' | 'pixel' | 'cyberpunk';
type ModelType = 'dall-e-2' | 'dall-e-3';

interface GenerateImageOptions {
  prompt: string;
  style: ImageStyle;
  model: ModelType;
  size?: '256x256' | '512x512' | '1024x1024';
  n?: number;
}

export class ImageGeneratorService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  private improvePrompt(prompt: string, style: ImageStyle): string {
    const styleMap: Record<ImageStyle, string> = {
      realistic: 'in a realistic photography style',
      anime: 'in detailed anime style, vibrant and clean lines',
      cartoon: 'in a cartoon style, bold outlines, playful',
      storybook: 'storybook illustration style, warm and imaginative',
      pixel: 'in retro pixel-art style, 8-bit',
      cyberpunk: 'in a neon-lit cyberpunk art style'
    };

    return `${prompt.trim()}, ${styleMap[style]}`;
  }

  public async generateImage(options: GenerateImageOptions): Promise<string[]> {
    const { prompt, style, model, size = '512x512', n = 1 } = options;
    const enhancedPrompt = this.improvePrompt(prompt, style);

    try {
      const response = await this.openai.images.generate({
        prompt: enhancedPrompt,
        model,
        size,
        n,
        response_format: 'url'
      });

      return response.data?.map((item) => item.url!) ?? [];
    } catch (error) {
      console.error('[ImageGeneratorService] Error:', error);
      throw error;
    }
  }

  /**
   * Downloads an image from a URL and saves it to assets/generated/{user_id}/
   * Returns the local file path (relative to project root)
   */
  public static async saveImageFromUrl(imageUrl: string, userId: string): Promise<string> {
    const dir = path.join('assets', 'generated', userId);
    await fs.promises.mkdir(dir, { recursive: true });
    const ext = path.extname(new URL(imageUrl).pathname) || '.png';
    const filename = `${Date.now()}${ext}`;
    const filePath = path.join(dir, filename);

    const response = await axios.get(imageUrl, { responseType: 'stream' });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', () => resolve());
      writer.on('error', (error) => reject(error));
    });

    return filePath.replace(/\\/g, '/'); // Normalize for DB storage
  }
}
