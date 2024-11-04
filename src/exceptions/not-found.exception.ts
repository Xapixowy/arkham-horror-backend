import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorEnum } from '@enums/error.enum';
import { ResponseHelper } from '@helpers/response.helper';

export class NotFoundException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
