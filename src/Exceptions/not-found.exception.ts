import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorEnum } from '@Enums/error.enum';

export class NotFoundException extends HttpException {
  constructor() {
    super(ErrorEnum.NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}
