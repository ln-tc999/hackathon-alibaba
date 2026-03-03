/**
 * MinIO Object Storage Service
 * 
 * Handles image storage to MinIO for lightweight backend container
 */

import * as Minio from 'minio';
import axios from 'axios';
import { Readable } from 'stream';

export class MinIOService {
  private client: Minio.Client;
  private bucketName: string;

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = parseInt(process.env.MINIO_PORT || '9000');
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
    const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';
    this.bucketName = process.env.MINIO_BUCKET_NAME || 'vlowgen-images';

    this.client = new Minio.Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    this.initializeBucket();
  }

  /**
   * Initialize bucket if it doesn't exist
   */
  private async initializeBucket(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName, 'us-east-1');
        console.log(`[MinIO] Created bucket: ${this.bucketName}`);

        // Set bucket policy to allow public read access
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };

        await this.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        console.log(`[MinIO] Set public read policy for bucket: ${this.bucketName}`);
      }
    } catch (error) {
      console.error('[MinIO] Failed to initialize bucket:', error);
    }
  }

  /**
   * Download image from URL and upload to MinIO
   * 
   * @param imageUrl - URL of the image to download
   * @param fileName - Name to save the file as (without extension)
   * @returns MinIO URL of the uploaded image
   */
  async uploadImageFromUrl(imageUrl: string, fileName: string): Promise<string> {
    try {
      console.log(`[MinIO] Downloading image from: ${imageUrl}`);

      // Download image from DashScope URL
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout
      });

      const imageBuffer = Buffer.from(response.data);
      const contentType = response.headers['content-type'] || 'image/png';

      // Determine file extension from content type
      const extension = contentType.split('/')[1] || 'png';
      const objectName = `${fileName}.${extension}`;

      console.log(`[MinIO] Uploading to MinIO: ${objectName} (${imageBuffer.length} bytes)`);

      // Upload to MinIO
      await this.client.putObject(
        this.bucketName,
        objectName,
        imageBuffer,
        imageBuffer.length,
        {
          'Content-Type': contentType,
        }
      );

      // Generate public URL
      const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
      const port = process.env.MINIO_PORT || '9000';
      const useSSL = process.env.MINIO_USE_SSL === 'true';
      const protocol = useSSL ? 'https' : 'http';
      const portSuffix = (useSSL && port === '443') || (!useSSL && port === '80') ? '' : `:${port}`;

      const minioUrl = `${protocol}://${endpoint}${portSuffix}/${this.bucketName}/${objectName}`;

      console.log(`[MinIO] Upload successful: ${minioUrl}`);

      return minioUrl;
    } catch (error) {
      console.error('[MinIO] Failed to upload image:', error);
      throw new Error(`Failed to upload image to MinIO: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete an image from MinIO
   * 
   * @param objectName - Name of the object to delete
   */
  async deleteImage(objectName: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucketName, objectName);
      console.log(`[MinIO] Deleted object: ${objectName}`);
    } catch (error) {
      console.error('[MinIO] Failed to delete object:', error);
      throw new Error(`Failed to delete image from MinIO: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Singleton instance
export const minioService = new MinIOService();
