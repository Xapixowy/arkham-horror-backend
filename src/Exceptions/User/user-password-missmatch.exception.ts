import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response.helper';
import { ErrorEnum } from '@Enums/error.enum';

export class UserPasswordMissmatchException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.USER_PASSWORD_MISMATCH,
        HttpStatus.BAD_REQUEST,
        ['User password and confirmation password are not the same'],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
