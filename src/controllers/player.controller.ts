import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response/response.helper';
import { DataResponse } from '@Types/data-response.type';
import { UserRoles } from '@Decorators/user-roles.decorator';
import { UserRole } from '@Enums/user/user-role.enum';
import { Public } from '@Decorators/public.decorator';
import { GameSessionDto } from '@Dtos/game-session.dto';
import { PlayerService } from '@Services/player/player.service';
import { PlayerDto } from '@Dtos/player.dto';

@Controller('game-sessions/:gameSessionToken/players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get()
  @Public()
  async index(
    @Param('gameSessionToken') gameSessionToken: string,
  ): Promise<DataResponse<PlayerDto[]>> {
    return ResponseHelper.buildResponse(
      await this.playerService.findAll(gameSessionToken),
    );
  }

  @Get(':playerToken')
  @Public()
  async show(
    @Param('gameSessionToken') gameSessionToken: string,
    @Param('playerToken') playerToken: string,
  ): Promise<DataResponse<PlayerDto>> {
    return ResponseHelper.buildResponse(
      await this.playerService.findOne(gameSessionToken, playerToken),
    );
  }

  @Delete(':token')
  @UserRoles(UserRole.ADMIN)
  async delete(
    @Param('token') token: string,
  ): Promise<DataResponse<GameSessionDto>> {
    return ResponseHelper.buildResponse(await this.playerService.remove(token));
  }
}
