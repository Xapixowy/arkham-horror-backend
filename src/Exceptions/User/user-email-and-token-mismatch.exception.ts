import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response.helper';
import { ErrorEnum } from '@Enums/error.enum';

export class UserEmailAndTokenMismatchException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.USER_EMAIL_AND_TOKEN_MISMATCH,
        HttpStatus.CONFLICT,
        ['User email does not match the token'],
      ),
      HttpStatus.CONFLICT,
    );
  }
}
