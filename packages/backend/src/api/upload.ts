/**
 * Upload API Router
 * 
 * Provides endpoints for uploading images and videos
 */

import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import multer from 'multer';
import { minioService } from '../services/minio.service';
import { logger } from '../utils/logger';
import { randomUUID } from 'crypto';

const router: RouterType = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept images and videos
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, MOV, AVI) are allowed.'));
    }
  },
});

/**
 * POST /api/upload/image
 * 
 * Upload an image file
 */
router.post('/image', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    logger.info('Image upload request', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    // Generate unique filename
    const fileId = randomUUID();
    const extension = req.file.originalname.split('.').pop() || 'jpg';
    const fileName = `upload-${fileId}.${extension}`;

    // Upload to MinIO
    const imageUrl = await minioService.uploadImageFromBuffer(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );

    // Generate presigned URL for external access (24 hours)
    const presignedUrl = await minioService.getPresignedUrl(fileName, 86400);

    logger.info('Image uploaded successfully', { imageUrl, presignedUrl });

    res.json({
      success: true,
      imageUrl: presignedUrl, // Use presigned URL for external access
      minioUrl: imageUrl, // Keep internal URL for reference
      fileName,
    });
  } catch (error) {
    logger.error('Image upload failed', { error: (error as Error).message });

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    });
  }
});

/**
 * POST /api/upload/video
 * 
 * Upload a video file
 */
router.post('/video', upload.single('video'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    logger.info('Video upload request', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    // Generate unique filename
    const fileId = randomUUID();
    const extension = req.file.originalname.split('.').pop() || 'mp4';
    const fileName = `upload-${fileId}.${extension}`;

    // Upload to MinIO
    const videoUrl = await minioService.uploadImageFromBuffer(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );

    logger.info('Video uploaded successfully', { videoUrl });

    res.json({
      success: true,
      videoUrl,
      fileName,
    });
  } catch (error) {
    logger.error('Video upload failed', { error: (error as Error).message });

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload video',
    });
  }
});

export default router;
