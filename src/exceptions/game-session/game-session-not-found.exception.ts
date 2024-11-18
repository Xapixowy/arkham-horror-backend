import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorEnum } from '@Enums/error.enum';
import { ResponseHelper } from '@Helpers/response/response.helper';

export class GameSessionNotFoundException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.GAME_SESSION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
