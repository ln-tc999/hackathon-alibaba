/**
 * Direct Twitter API Integration (OAuth 1.0a)
 * Supports media upload and tweet creation without Composio
 */

import axios, { AxiosInstance } from 'axios';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

export interface TwitterCredentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

export interface TwitterMediaUploadResponse {
  media_id: number;
  media_id_string: string;
  size: number;
  expires_after_secs: number;
  image?: {
    image_type: string;
    w: number;
    h: number;
  };
  video?: {
    video_type: string;
  };
}

export interface TwitterTweetResponse {
  data: {
    id: string;
    text: string;
  };
}

export class TwitterDirectClient {
  private oauth: OAuth;
  private credentials: TwitterCredentials;
  private apiBaseUrl = 'https://api.twitter.com';
  private uploadBaseUrl = 'https://upload.twitter.com';

  constructor(credentials: TwitterCredentials) {
    this.credentials = credentials;
    
    // Initialize OAuth 1.0a
    this.oauth = new OAuth({
      consumer: {
        key: credentials.consumerKey,
        secret: credentials.consumerSecret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64');
      },
    });
  }

  /**
   * Upload media (image or video) to Twitter
   */
  async uploadMedia(filePath: string): Promise<string> {
    try {
      console.log('[Twitter Direct] Uploading media:', filePath);

      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fs.statSync(filePath).size;
      
      console.log('[Twitter Direct] File size:', fileSize, 'bytes');

      // Determine media type
      const ext = path.extname(filePath).toLowerCase();
      const isVideo = ['.mp4', '.mov'].includes(ext);
      
      if (isVideo) {
        // Use chunked upload for videos
        return await this.uploadMediaChunked(filePath, fileBuffer, fileSize);
      } else {
        // Use simple upload for images
        return await this.uploadMediaSimple(fileBuffer);
      }
    } catch (error) {
      console.error('[Twitter Direct] Media upload failed:', error);
      throw error;
    }
  }

  /**
   * Simple media upload (for images)
   */
  private async uploadMediaSimple(fileBuffer: Buffer): Promise<string> {
    const url = `${this.uploadBaseUrl}/1.1/media/upload.json`;
    
    const token = {
      key: this.credentials.accessToken,
      secret: this.credentials.accessTokenSecret,
    };

    const authHeader = this.oauth.toHeader(
      this.oauth.authorize({ url, method: 'POST' }, token)
    );

    const formData = new FormData();
    formData.append('media', fileBuffer, {
      filename: 'media.jpg',
      contentType: 'image/jpeg',
    });

    const response = await axios.post<TwitterMediaUploadResponse>(url, formData, {
      headers: {
        ...authHeader,
        ...formData.getHeaders(),
      },
    });

    console.log('[Twitter Direct] Media uploaded, ID:', response.data.media_id_string);
    return response.data.media_id_string;
  }

  /**
   * Chunked media upload (for videos and large files)
   */
  private async uploadMediaChunked(
    filePath: string,
    fileBuffer: Buffer,
    fileSize: number
  ): Promise<string> {
    const token = {
      key: this.credentials.accessToken,
      secret: this.credentials.accessTokenSecret,
    };

    // Step 1: INIT
    console.log('[Twitter Direct] Chunked upload - INIT');
    const initUrl = `${this.uploadBaseUrl}/1.1/media/upload.json`;
    const initAuth = this.oauth.toHeader(
      this.oauth.authorize(
        {
          url: initUrl,
          method: 'POST',
          data: {
            command: 'INIT',
            total_bytes: fileSize,
            media_type: 'video/mp4',
            media_category: 'tweet_video',
          },
        },
        token
      )
    );

    const initResponse = await axios.post<TwitterMediaUploadResponse>(
      initUrl,
      new URLSearchParams({
        command: 'INIT',
        total_bytes: fileSize.toString(),
        media_type: 'video/mp4',
        media_category: 'tweet_video',
      }),
      {
        headers: {
          ...initAuth,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const mediaId = initResponse.data.media_id_string;
    console.log('[Twitter Direct] Media ID:', mediaId);

    // Step 2: APPEND (upload chunks)
    console.log('[Twitter Direct] Chunked upload - APPEND');
    const chunkSize = 5 * 1024 * 1024; // 5MB chunks
    let segmentIndex = 0;

    for (let i = 0; i < fileSize; i += chunkSize) {
      const chunk = fileBuffer.slice(i, Math.min(i + chunkSize, fileSize));
      
      const appendUrl = `${this.uploadBaseUrl}/1.1/media/upload.json`;
      const appendAuth = this.oauth.toHeader(
        this.oauth.authorize({ url: appendUrl, method: 'POST' }, token)
      );

      const formData = new FormData();
      formData.append('command', 'APPEND');
      formData.append('media_id', mediaId);
      formData.append('segment_index', segmentIndex.toString());
      formData.append('media', chunk);

      await axios.post(appendUrl, formData, {
        headers: {
          ...appendAuth,
          ...formData.getHeaders(),
        },
      });

      console.log(`[Twitter Direct] Uploaded chunk ${segmentIndex + 1}`);
      segmentIndex++;
    }

    // Step 3: FINALIZE
    console.log('[Twitter Direct] Chunked upload - FINALIZE');
    const finalizeUrl = `${this.uploadBaseUrl}/1.1/media/upload.json`;
    const finalizeAuth = this.oauth.toHeader(
      this.oauth.authorize(
        {
          url: finalizeUrl,
          method: 'POST',
          data: {
            command: 'FINALIZE',
            media_id: mediaId,
          },
        },
        token
      )
    );

    await axios.post(
      finalizeUrl,
      new URLSearchParams({
        command: 'FINALIZE',
        media_id: mediaId,
      }),
      {
        headers: {
          ...finalizeAuth,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('[Twitter Direct] Chunked upload complete');
    return mediaId;
  }

  /**
   * Create a tweet (with or without media)
   */
  async createTweet(text: string, mediaIds?: string[]): Promise<TwitterTweetResponse> {
    try {
      console.log('[Twitter Direct] Creating tweet...');

      const url = `${this.apiBaseUrl}/2/tweets`;
      
      const token = {
        key: this.credentials.accessToken,
        secret: this.credentials.accessTokenSecret,
      };

      const requestData: any = { text };
      
      if (mediaIds && mediaIds.length > 0) {
        requestData.media = {
          media_ids: mediaIds,
        };
      }

      const authHeader = this.oauth.toHeader(
        this.oauth.authorize(
          {
            url,
            method: 'POST',
          },
          token
        )
      );

      const response = await axios.post<TwitterTweetResponse>(url, requestData, {
        headers: {
          ...authHeader,
          'Content-Type': 'application/json',
        },
      });

      console.log('[Twitter Direct] Tweet created, ID:', response.data.data.id);
      return response.data;
    } catch (error) {
      console.error('[Twitter Direct] Tweet creation failed:', error);
      throw error;
    }
  }

  /**
   * Download media from URL to temp file
   */
  async downloadMedia(url: string): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const ext = url.includes('.mp4') || url.includes('video') ? '.mp4' : '.jpg';
    const fileName = `twitter-media-${Date.now()}${ext}`;
    const filePath = path.join(tempDir, fileName);

    console.log('[Twitter Direct] Downloading media from:', url);

    const response = await axios({
      method: 'GET',
      url,
      responseType: 'stream',
      timeout: 120000,
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('[Twitter Direct] Media downloaded to:', filePath);
        resolve(filePath);
      });
      writer.on('error', reject);
    });
  }

  /**
   * Delete temporary file
   */
  deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('[Twitter Direct] Temporary file deleted:', filePath);
      }
    } catch (error) {
      console.warn('[Twitter Direct] Failed to delete temporary file:', error);
    }
  }
}
