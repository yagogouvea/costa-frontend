import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { awsConfig } from './aws';

export const s3Client = new S3Client({
  region: awsConfig.s3.region,
  credentials: awsConfig.credentials,
  forcePathStyle: true
});

export const uploadFile = async (file: File, key: string): Promise<string> => {
  try {
    const command = new PutObjectCommand({
      Bucket: awsConfig.s3.bucket,
      Key: key,
      Body: file,
      ContentType: file.type,
    });

    await s3Client.send(command);
    return `https://${awsConfig.s3.bucket}.s3.${awsConfig.s3.region}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Erro ao fazer upload para S3:', error);
    throw error;
  }
};

export const getFileUrl = (key: string): string => {
  return `https://${awsConfig.s3.bucket}.s3.${awsConfig.s3.region}.amazonaws.com/${key}`;
}; 