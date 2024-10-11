import { FILE_UPLOAD_CONFIG } from '../Config/file-upload.config';
import slugify from 'slugify';
import * as fs from 'fs';

export class FileUploadHelper {
  static localToRemotePath(localPath: string): string {
    const filePath = this.localToRelativePath(localPath);
    const serverUrl = FILE_UPLOAD_CONFIG.serverUrl;

    return `${serverUrl}${filePath}`;
  }

  static localToRelativePath(localPath: string): string {
    return '/public' + localPath.split('public', 2)[1].replace(/\\/g, '/');
  }

  static generateFileName(originalName: string): string {
    const fileNameArray = originalName.split('.');
    const extension = fileNameArray[fileNameArray.length - 1];
    const fileName = slugify(
      fileNameArray.slice(0, fileNameArray.length - 1).join('.'),
      {
        lower: true,
        strict: true,
      },
    );
    const timestamp = Date.now();

    return `${timestamp}-${fileName}.${extension}`;
  }

  static generateDestinationPath(
    path: string,
    createDirectories: boolean = false,
  ): string {
    const destinationPath = `${FILE_UPLOAD_CONFIG.uploadsPath}/${path}`;

    if (createDirectories && !fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }

    return destinationPath;
  }
}
