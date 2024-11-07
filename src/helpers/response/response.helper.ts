import { DataResponse } from '@Types/data-response.type';
import { ErrorEnum } from '@Enums/error.enum';
import { HttpStatus } from '@nestjs/common';
import { ExceptionResponse } from '@Types/exception.response';

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
