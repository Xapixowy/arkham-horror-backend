import { ErrorEnum } from '@Enums/error.enum';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response.helper';

export class FileMissingException extends HttpException {
  constructor(message?: string | string[]) {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.FILE_MISSING,
        HttpStatus.BAD_REQUEST,
        message && typeof message === 'string' ? [message] : message,
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
