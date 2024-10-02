import { ErrorEnum } from '@Enums/error.enum';
import { NotFoundException } from '@nestjs/common';
import { Response } from '@Types/response.type';
import { SomethingWrongException } from '@Exceptions/something-wrong.exception';

export class ResponseHelper {
  static buildResponse(data: any): Response<any> {
    return {
      data,
    };
  }

  static handleError(error: ErrorEnum): void {
    switch (error) {
      case ErrorEnum.NOT_FOUND:
        throw new NotFoundException();
      default:
        throw new SomethingWrongException();
    }
  }
}
