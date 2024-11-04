import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@helpers/response.helper';
import { ErrorEnum } from '@enums/error.enum';

export class UserEmailAndTokenMismatchException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.USER_EMAIL_AND_TOKEN_MISMATCH,
        HttpStatus.CONFLICT,
      ),
      HttpStatus.CONFLICT,
    );
  }
}
