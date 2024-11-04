import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@helpers/response.helper';
import { ErrorEnum } from '@enums/error.enum';

export class PlayerExistsException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.PLAYER_EXISTS,
        HttpStatus.CONFLICT,
      ),
      HttpStatus.CONFLICT,
    );
  }
}
