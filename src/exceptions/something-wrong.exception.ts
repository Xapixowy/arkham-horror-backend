import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response/response.helper';
import { ErrorEnum } from '@Enums/error.enum';

export class SomethingWrongException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.SOMETHING_WRONG,
        HttpStatus.BAD_REQUEST,
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
