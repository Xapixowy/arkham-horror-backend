import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response.helper';
import { ErrorEnum } from '@Enums/error.enum';

export class UserNotVerifiedException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.USER_NOT_VERIFIED,
        HttpStatus.BAD_REQUEST,
        ['User is not verified'],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
