import { Controller, Get, Param } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response/response.helper';
import { DataResponse } from '@Types/data-response.type';
import { UserService } from '@Services/user/user.service';
import { UserOwner } from '@Decorators/user-owner.decorator';
import { Statistics } from '@Types/user/statistics.type';
import { GameSessionDto } from '@Dtos/game-session.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId/statistics')
  @UserOwner()
  async statistics(
    @Param('userId') userId: number,
  ): Promise<DataResponse<Statistics>> {
    return ResponseHelper.buildResponse(
      await this.userService.getUserStatistics(userId),
    );
  }

  @Get(':userId/game-sessions')
  @UserOwner()
  async gameSessions(
    @Param('userId') userId: number,
  ): Promise<DataResponse<GameSessionDto[]>> {
    return ResponseHelper.buildResponse(
      await this.userService.getUserGameSessions(userId),
    );
  }
}
