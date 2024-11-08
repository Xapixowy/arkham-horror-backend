import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '@Decorators/public.decorator';
import { PlayerRole } from '@Enums/player/player-role.enum';
import { PlayerRoles } from '@Decorators/player-roles.decorator';

@Controller('test')
export class TestController {
  constructor() {}

  @Get()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Public()
  @PlayerRoles(PlayerRole.HOST)
  async test() {}
}
