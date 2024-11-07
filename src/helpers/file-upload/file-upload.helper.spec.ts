import { FileUploadHelper } from './file-upload.helper';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import slugify from 'slugify';

jest.mock('fs');
jest.mock('slugify');

describe('FileUploadHelper', () => {
  let fileUploadHelper: FileUploadHelper;
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'fileUpload') {
          return {
            serverUrl: 'http://localhost:3000',
            uploadsPath: 'C:/project/public',
          };
        }
      }),
    } as unknown as ConfigService;

    fileUploadHelper = new FileUploadHelper(configService);
  });

  describe('generateFileInterceptor', () => {
    it('should return a FileInterceptor with memory storage', () => {
      const interceptor = FileUploadHelper.generateFileInterceptor();
      expect(interceptor).toBeDefined();
    });
  });

  describe('generateParseFilePipe', () => {
    it('should return a ParseFilePipe with maxSize and fileType validators', () => {
      const maxSize = 1024 * 1024; // 1 MB
      const fileType = /image\/.*/;
      const pipe = FileUploadHelper.generateParseFilePipe(maxSize, fileType);
      expect(pipe).toBeDefined();
    });
  });

  describe('localToRelativePath', () => {
    it('should convert a local path to a relative path', () => {
      const localPath = 'C:/project/public/file.jpg';
      const result = FileUploadHelper.localToRelativePath(localPath);
      expect(result).toBe('/public/file.jpg');
    });
  });

  describe('generateFileName', () => {
    it('should generate a slugified file name with a timestamp', () => {
      const originalName = 'My File.jpg';
      (slugify as unknown as jest.Mock).mockReturnValue('my-file');
      const timestamp = 123456789;
      jest.spyOn(Date, 'now').mockReturnValue(timestamp);

      const result = FileUploadHelper.generateFileName(originalName);
      expect(result).toBe(`${timestamp}-my-file.jpg`);
    });
  });

  describe('localToRemotePath', () => {
    it('should convert a local path to a remote path', () => {
      const localPath = 'C:/project/public/file.jpg';

      const result = fileUploadHelper.localToRemotePath(localPath);
      expect(result).toBe('http://localhost:3000/public/file.jpg');
    });
  });

  describe('remoteToLocalPath', () => {
    it('should convert a remote path to a local path', () => {
      const remotePath = 'http://localhost:3000/public/file.jpg';

      const result = fileUploadHelper.remoteToLocalPath(remotePath);
      expect(result).toBe('C:/project/public/file.jpg');
    });
  });

  describe('generateDestinationPath', () => {
    it('should generate a destination path and create directories if specified', () => {
      const path = 'images';
      const destinationPath = 'C:/project/public/images';
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = fileUploadHelper.generateDestinationPath(path, true);
      expect(fs.mkdirSync).toHaveBeenCalledWith(destinationPath, {
        recursive: true,
      });
      expect(result).toBe(destinationPath);
    });
  });

  describe('saveFile', () => {
    it('should save the file to the specified path', () => {
      const file = {
        originalname: 'test.jpg',
        buffer: Buffer.from('data'),
      } as Express.Multer.File;
      const path = 'files';
      const generatedFileName = '123456789-test.jpg';
      jest
        .spyOn(FileUploadHelper, 'generateFileName')
        .mockReturnValue(generatedFileName);

      const result = fileUploadHelper.saveFile(file, path);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `${path}/${generatedFileName}`,
        file.buffer,
      );
      expect(result).toBe(`${path}/${generatedFileName}`);
    });

    it('should return null if saving the file fails', () => {
      const file = {
        originalname: 'test.jpg',
        buffer: Buffer.from('data'),
      } as Express.Multer.File;
      const path = 'files';
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to save file');
      });

      const result = fileUploadHelper.saveFile(file, path);
      expect(result).toBeNull();
    });
  });

  describe('deleteFile', () => {
    it('should delete the file and return true if successful', () => {
      const path = 'C:/project/public/files/file.jpg';
      (fs.unlinkSync as jest.Mock).mockReturnValue(true);

      const result = fileUploadHelper.deleteFile(path);
      expect(fs.unlinkSync).toHaveBeenCalledWith(path);
      expect(result).toBe(true);
    });

    it('should return false if deleting the file fails', () => {
      const path = 'C:/project/public/files/file.jpg';
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to delete file');
      });

      const result = fileUploadHelper.deleteFile(path);
      expect(result).toBe(false);
    });
  });

  describe('deleteDirectory', () => {
    it('should delete the directory and return true if successful', () => {
      const path = 'C:/project/public/files';
      (fs.rmdirSync as jest.Mock).mockReturnValue(true);

      const result = fileUploadHelper.deleteDirectory(path, true);
      expect(fs.rmdirSync).toHaveBeenCalledWith(path, { recursive: true });
      expect(result).toBe(true);
    });

    it('should return false if deleting the directory fails', () => {
      const path = 'C:/project/public/files';
      (fs.rmdirSync as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to delete directory');
      });

      const result = fileUploadHelper.deleteDirectory(path, true);
      expect(result).toBe(false);
    });
  });
});
