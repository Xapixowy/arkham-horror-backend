import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ResponseHelper } from '@helpers/response.helper';
import { DataResponse } from '@custom-types/data-response.type';
import { UserRoles } from '@decorators/user-roles.decorator';
import { UserRole } from '@enums/user/user-role.enum';
import { Public } from '@decorators/public.decorator';
import { GameSessionDto } from '@dtos/game-session.dto';
import { PlayerService } from '@services/player.service';
import { PlayerDto } from '@dtos/player.dto';

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
