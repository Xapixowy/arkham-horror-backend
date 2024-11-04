import { DataResponse } from '@custom-types/data-response.type';
import { ErrorEnum } from '@enums/error.enum';
import { HttpStatus } from '@nestjs/common';
import { ExceptionResponse } from '@custom-types/exception.response';

export class ResponseHelper {
  static buildResponse(data: any): DataResponse<any> {
    return {
      data,
    };
  }

  static buildExceptionResponse(
    error: ErrorEnum,
    statusCode: HttpStatus,
    message?: string | string[],
  ): ExceptionResponse {
    return {
      error,
      statusCode,
      message,
    };
  }
}
