import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response/response.helper';
import { ErrorEnum } from '@Enums/error.enum';

export class PlayersLimitReachedException extends HttpException {
  constructor() {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.PLAYERS_LIMIT_REACHED,
        HttpStatus.CONFLICT,
      ),
      HttpStatus.CONFLICT,
    );
  }
}
