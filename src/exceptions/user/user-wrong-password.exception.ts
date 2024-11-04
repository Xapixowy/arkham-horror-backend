import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@helpers/response.helper';
import { ErrorEnum } from '@enums/error.enum';

export class UserWrongPasswordException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.USER_WRONG_PASSWORD,
        HttpStatus.UNAUTHORIZED,
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
