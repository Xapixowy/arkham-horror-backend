import { HttpException, HttpStatus, ValidationError } from '@nestjs/common';
import { ResponseHelper } from '@helpers/response.helper';
import { ErrorEnum } from '@enums/error.enum';

export class ValidationFailedException extends HttpException {
  constructor(errors: ValidationError[]) {
    const errorsArray = errors
      .map((error) => Object.values(error.constraints))
      .flat();

    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        errorsArray,
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
