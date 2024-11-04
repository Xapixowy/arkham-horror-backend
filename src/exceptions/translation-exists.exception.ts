import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorEnum } from '@enums/error.enum';
import { ResponseHelper } from '@helpers/response.helper';

export class TranslationExistsException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.TRANSLATION_EXISTS,
        HttpStatus.CONFLICT,
      ),
      HttpStatus.CONFLICT,
    );
  }
}
