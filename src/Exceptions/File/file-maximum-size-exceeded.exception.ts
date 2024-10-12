import { ErrorEnum } from '@Enums/error.enum';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response.helper';
import { filesize } from 'filesize';

export class FileMaximumSizeExceededException extends HttpException {
  constructor(maxSize: number) {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.FILE_MAXIMUM_SIZE_EXCEEDED,
        HttpStatus.BAD_REQUEST,
        ['file size exceeds the maximum allowed size of ' + filesize(maxSize)],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
