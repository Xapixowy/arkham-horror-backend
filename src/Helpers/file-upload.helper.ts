import { FILE_UPLOAD_CONFIG } from '../Config/file-upload.config';
import slugify from 'slugify';
import * as fs from 'fs';
import { filesize } from 'filesize';
import {
  HttpStatus,
  NestInterceptor,
  ParseFilePipe,
  ParseFilePipeBuilder,
  Type,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export class FileUploadHelper {
  static localToRemotePath(localPath: string): string {
    const filePath = this.localToRelativePath(localPath);
    const serverUrl = FILE_UPLOAD_CONFIG.serverUrl;

    return `${serverUrl}${filePath}`;
  }

  static localToRelativePath(localPath: string): string {
    return '/public' + localPath.split('public', 2)[1].replace(/\\/g, '/');
  }

  static remoteToLocalPath(remotePath: string): string {
    const filePath = remotePath.split(FILE_UPLOAD_CONFIG.serverUrl)[1];
    const projectPath = FILE_UPLOAD_CONFIG.uploadsPath.replace('/public', '');

    return `${projectPath}${filePath}`;
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

  static saveFile(
    file: Express.Multer.File,
    path: string,
    keepOriginalName: boolean = false,
  ): string | null {
    const filePath = `${path}/${keepOriginalName ? file.originalname : FileUploadHelper.generateFileName(file.originalname)}`;
    try {
      fs.writeFileSync(filePath, file.buffer);
      return filePath;
    } catch (e) {
      return null;
    }
  }

  static deleteFile(path: string): boolean {
    try {
      fs.unlinkSync(path);
      return true;
    } catch (e) {
      return false;
    }
  }

  static deleteDirectory(path: string, recursive: boolean = false): boolean {
    try {
      fs.rmdirSync(path, { recursive });
      return true;
    } catch (e) {
      return false;
    }
  }

  static generateFileInterceptor(): Type<NestInterceptor> {
    return FileInterceptor('file', {
      storage: memoryStorage(),
    });
  }

  static generateParseFilePipe(
    maxSize: number,
    fileType: RegExp,
  ): ParseFilePipe {
    return new ParseFilePipeBuilder()
      .addMaxSizeValidator({
        maxSize,
        message:
          'File size exceeds the maximum allowed size of ' + filesize(maxSize),
      })
      .addFileTypeValidator({
        fileType,
      })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
  }
}
