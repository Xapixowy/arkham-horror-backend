import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorEnum } from '@enums/error.enum';
import { ResponseHelper } from '@helpers/response.helper';

export class LanguageNotSupportedExceptionException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.LANGUAGE_NOT_SUPPORTED,
        HttpStatus.BAD_REQUEST,
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
