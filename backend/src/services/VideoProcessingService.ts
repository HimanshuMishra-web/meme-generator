import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

// Set ffmpeg path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

export class VideoProcessingService {
  /**
   * Generates a thumbnail from a video file
   * @param videoPath - Path to the video file
   * @param outputPath - Path where the thumbnail should be saved
   * @param time - Time in seconds to extract the frame (default: 1 second)
   * @returns Promise<string> - Path to the generated thumbnail
   */
  public static async generateThumbnail(
    videoPath: string, 
    outputPath: string, 
    time: string = '00:00:01'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Ensure the output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      ffmpeg(videoPath)
        .screenshots({
          timestamps: [time],
          filename: path.basename(outputPath),
          folder: outputDir,
          size: '320x240' // Standard thumbnail size
        })
        .on('end', () => {
          console.log('Thumbnail generated successfully');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('Error generating thumbnail:', err);
          reject(err);
        });
    });
  }

  /**
   * Checks if a file is a video based on its extension
   * @param filename - The filename to check
   * @returns boolean - True if the file is a video
   */
  public static isVideoFile(filename: string): boolean {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv', '.wmv'];
    const ext = path.extname(filename).toLowerCase();
    return videoExtensions.includes(ext);
  }

  /**
   * Gets video duration in seconds
   * @param videoPath - Path to the video file
   * @returns Promise<number> - Duration in seconds
   */
  public static async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(metadata.format.duration || 0);
      });
    });
  }
} 