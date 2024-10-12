import { ErrorEnum } from '@Enums/error.enum';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response.helper';

export class FileDeleteFailedException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.FILE_DELETE_FAILED,
        HttpStatus.BAD_REQUEST,
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
