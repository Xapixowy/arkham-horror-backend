import { registerAs } from '@nestjs/config';

export type FileUploadConfig = {
  serverUrl: string;
  uploadsPath: string;
};

export const fileUploadConfig = registerAs(
  'fileUpload',
  (): FileUploadConfig => {
    console.log(`${__dirname}/../../../public`);
    return {
      serverUrl: process.env.APP_URL || 'http://localhost:3000',
      uploadsPath: `${__dirname}/../../../public`,
    };
  },
);
