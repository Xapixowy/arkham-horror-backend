import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorEnum } from '@Enums/error.enum';
import { ResponseHelper } from '@Helpers/response.helper';

export class EmailSendFailureException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.EMAIL_SEND_FAILURE,
        HttpStatus.INTERNAL_SERVER_ERROR,
      ),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
