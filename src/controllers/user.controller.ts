import { Controller, Get, Param } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response/response.helper';
import { DataResponse } from '@Types/data-response.type';
import { UserService } from '@Services/user/user.service';
import { UserOwner } from '@Decorators/user-owner.decorator';
import { Statistics } from '@Types/user/statistics.type';

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
}
