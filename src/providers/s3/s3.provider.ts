// src/providers/s3.provider.ts
import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { AppConfigService } from '../../config/config.service';

@Injectable()
export class S3Provider {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private appConfigService: AppConfigService) {
    const s3Config = this.appConfigService.config.s3;
    this.bucketName = s3Config.bucket;

    this.s3Client = new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
      endpoint: s3Config.endpoint, // 👈 THIS MUST BE set
      forcePathStyle: false,
    });
  }

  async uploadFile(
    file: import('multer').File,
    folder: string = '',
  ): Promise<string> {
    const key = folder
      ? `${folder}/${Date.now()}-${file.originalname}`
      : `${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read' as ObjectCannedACL,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(params));
      return `${this.appConfigService.config.s3.endpoint}/${this.bucketName}/${key}`;
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const key = fileUrl.split('.com/')[1];
    console.log('File key extracted:', key); // Log the extracted key
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      await this.s3Client.send(new DeleteObjectCommand(params));
    } catch (error) {
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  async getFileBuffer(key: string): Promise<Buffer> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      const response = await this.s3Client.send(new GetObjectCommand(params));
      const responseStream = response.Body as any;

      return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        responseStream.on('data', (chunk: Buffer) => chunks.push(chunk));
        responseStream.on('end', () => resolve(Buffer.concat(chunks)));
        responseStream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to retrieve file from S3: ${error.message}`);
    }
  }
}
