import { HttpException, HttpStatus, ValidationError } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response/response.helper';
import { ErrorEnum } from '@Enums/error.enum';

export class ValidationFailedException extends HttpException {
  constructor(errors: ValidationError[]) {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        ValidationFailedException.getErrorMessages(errors),
      ),
      HttpStatus.BAD_REQUEST,
    );
  }

  static getErrorMessages(
    errors: ValidationError[],
    messages: string[] = [],
  ): string[] {
    if (errors.length === 0) {
      return messages;
    }

    errors.forEach((error) => {
      if (error.constraints) {
        Object.values(error.constraints).forEach((value) =>
          messages.push(value),
        );
      }

      if (error.children && error.children.length > 0) {
        this.getErrorMessages(error.children, messages);
      }
    });

    return messages;
  }
}
