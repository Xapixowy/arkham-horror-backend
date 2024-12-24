import slugify from 'slugify';
import * as fs from 'fs';
import { filesize } from 'filesize';
import {
  HttpStatus,
  Injectable,
  NestInterceptor,
  ParseFilePipe,
  ParseFilePipeBuilder,
  Type,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { FileUploadConfig } from '@Configs/file-upload.config';

@Injectable()
export class FileUploadHelper {
  constructor(private configService: ConfigService) {}

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
          'file size exceeds the maximum allowed size of ' + filesize(maxSize),
      })
      .addFileTypeValidator({
        fileType,
      })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
  }

  static localToRelativePath(localPath: string): string {
    console.log(
      '🔥 localToRelativePath',
      '/public' + localPath.split('public', 2)[1].replace(/\\/g, '/'),
    );
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

  localToRemotePath(localPath: string): string {
    const filePath = FileUploadHelper.localToRelativePath(localPath);
    const serverUrl =
      this.configService.get<FileUploadConfig>('fileUpload').serverUrl;

    console.log('🔥 localToRemotePath', `${serverUrl}${filePath}`);

    return `${serverUrl}${filePath}`;
  }

  remoteToLocalPath(remotePath: string): string {
    const filePath = remotePath.split(
      this.configService.get<FileUploadConfig>('fileUpload').serverUrl,
    )[1];
    const projectPath = this.configService
      .get<FileUploadConfig>('fileUpload')
      .uploadsPath.replace('/public', '');

    return `${projectPath}${filePath}`;
  }

  generateDestinationPath(
    path: string,
    createDirectories: boolean = false,
  ): string {
    const destinationPath = `${this.configService.get<FileUploadConfig>('fileUpload').uploadsPath}/${path}`;
    console.log('🔥 generateDestinationPath', destinationPath);

    if (createDirectories && !fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }

    return destinationPath;
  }

  saveFile(
    file: Express.Multer.File,
    path: string,
    keepOriginalName: boolean = false,
  ): string | null {
    const filePath = `${path}/${keepOriginalName ? file.originalname : FileUploadHelper.generateFileName(file.originalname)}`;
    try {
      fs.writeFileSync(filePath, file.buffer);
      return filePath;
    } catch {
      return null;
    }
  }

  deleteFile(path: string): boolean {
    try {
      fs.unlinkSync(path);
      return true;
    } catch {
      return false;
    }
  }

  deleteDirectory(path: string, recursive: boolean = false): boolean {
    try {
      fs.rmdirSync(path, { recursive });
      return true;
    } catch {
      return false;
    }
  }
}
