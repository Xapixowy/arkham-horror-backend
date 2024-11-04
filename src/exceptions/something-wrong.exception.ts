import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@helpers/response.helper';
import { ErrorEnum } from '@enums/error.enum';

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
