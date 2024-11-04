import { ErrorEnum } from '@enums/error.enum';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@helpers/response.helper';

export class FileMissingException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.FILE_MISSING,
        HttpStatus.BAD_REQUEST,
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
