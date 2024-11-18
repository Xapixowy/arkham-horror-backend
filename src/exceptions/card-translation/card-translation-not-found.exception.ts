import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorEnum } from '@Enums/error.enum';
import { ResponseHelper } from '@Helpers/response/response.helper';

export class CardTranslationNotFoundException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.CARD_TRANSLATION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
