import { ErrorEnum } from '@Enums/error.enum';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response.helper';

export class FileMissingException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.FILE_MISSING,
        HttpStatus.BAD_REQUEST,
        ['file must be a file'],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
