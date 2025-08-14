export const awsConfig = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
  s3: {
    bucket: import.meta.env.VITE_AWS_S3_BUCKET,
    region: import.meta.env.VITE_AWS_S3_REGION || 'us-east-1',
  },
  rds: {
    host: import.meta.env.VITE_AWS_RDS_HOST,
    port: parseInt(import.meta.env.VITE_AWS_RDS_PORT || '5432'),
    database: import.meta.env.VITE_AWS_RDS_DATABASE,
    username: import.meta.env.VITE_AWS_RDS_USERNAME,
    password: import.meta.env.VITE_AWS_RDS_PASSWORD,
  }
}; 