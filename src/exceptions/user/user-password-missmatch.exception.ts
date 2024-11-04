import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@helpers/response.helper';
import { ErrorEnum } from '@enums/error.enum';

export class UserPasswordMissmatchException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.USER_PASSWORD_MISMATCH,
        HttpStatus.BAD_REQUEST,
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
