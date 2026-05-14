import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createWriteStream } from 'fs';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import type { Readable } from 'stream';
import { pipeline } from 'stream/promises';

export type StorageProvider = {
  upload(key: string, body: Buffer | Readable, contentType: string): Promise<void>;
  getDownloadUrl(key: string): Promise<string>;
  getBuffer(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
};

class LocalStorage implements StorageProvider {
  private basePath: string;

  constructor() {
    this.basePath = process.env.LOCAL_STORAGE_PATH || join(process.cwd(), 'uploads');
  }

  async upload(key: string, body: Buffer | Readable, _contentType: string): Promise<void> {
    const filePath = join(this.basePath, key);
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    await mkdir(dir, { recursive: true });

    if (Buffer.isBuffer(body)) {
      const ws = createWriteStream(filePath);
      ws.write(body);
      ws.end();
      await new Promise<void>((resolve, reject) => {
        ws.on('finish', resolve);
        ws.on('error', reject);
      });
    } else {
      const ws = createWriteStream(filePath);
      await pipeline(body, ws);
    }
  }

  async getDownloadUrl(key: string): Promise<string> {
    return `/api/files/download/${encodeURIComponent(key)}`;
  }

  async getBuffer(key: string): Promise<Buffer> {
    const filePath = join(this.basePath, key);
    const { createReadStream: crs } = await import('fs');
    const chunks: Buffer[] = [];
    const stream = crs(filePath);
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async delete(key: string): Promise<void> {
    const filePath = join(this.basePath, key);
    try {
      await rm(filePath);
    } catch {
      // file may not exist
    }
  }
}

class S3Storage implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET!;
    const config: ConstructorParameters<typeof S3Client>[0] = {
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    };
    if (process.env.S3_ENDPOINT) {
      config.endpoint = process.env.S3_ENDPOINT;
      config.forcePathStyle = true;
    }
    this.client = new S3Client(config);
  }

  async upload(key: string, body: Buffer | Readable, contentType: string): Promise<void> {
    let bodyBuffer: Buffer;
    if (Buffer.isBuffer(body)) {
      bodyBuffer = body;
    } else {
      const chunks: Buffer[] = [];
      for await (const chunk of body) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      bodyBuffer = Buffer.concat(chunks);
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: bodyBuffer,
        ContentType: contentType,
      }),
    );
  }

  async getDownloadUrl(_key: string): Promise<string> {
    throw new Error('Use getBuffer instead - presigned URLs removed');
  }

  async getBuffer(key: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}

function createStorage(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  if (provider === 's3') {
    return new S3Storage();
  }
  return new LocalStorage();
}

export const storage = createStorage();
