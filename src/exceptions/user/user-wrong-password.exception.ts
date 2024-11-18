import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response/response.helper';
import { ErrorEnum } from '@Enums/error.enum';

export class UserWrongPasswordException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.USER_WRONG_PASSWORD,
        HttpStatus.BAD_REQUEST,
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
