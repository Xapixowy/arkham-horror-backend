import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response/response.helper';
import { ErrorEnum } from '@Enums/error.enum';

export class UserExistsException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.USER_EXISTS,
        HttpStatus.CONFLICT,
      ),
      HttpStatus.CONFLICT,
    );
  }
}
