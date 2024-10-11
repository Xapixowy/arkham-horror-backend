import { registerAs } from '@nestjs/config';

export const FILE_UPLOAD_CONFIG = {
  serverUrl: process.env.APP_URL || 'http://localhost:3000',
  uploadsPath: `${__dirname}/../../../public`,
};

export const fileUploadConfig = registerAs(
  'fileUploads',
  () => FILE_UPLOAD_CONFIG,
);
