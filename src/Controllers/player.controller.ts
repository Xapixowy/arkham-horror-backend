import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response.helper';
import { DataResponse } from '@Types/data-response.type';
import { Roles } from '@Decorators/roles.decorator';
import { UserRole } from '@Enums/User/user-role.enum';
import { AuthGuard } from '@Guards/auth.guard';
import { RolesGuard } from '@Guards/roles.guard';
import { Public } from '@Decorators/public.decorator';
import { GameSessionDto } from '@DTOs/game-session.dto';
import { PlayerService } from '@Services/player.service';
import { PlayerDto } from '@DTOs/player.dto';

@Controller('game-sessions/:gameSessionToken/players')
@UseGuards(AuthGuard, RolesGuard)
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
  @Roles(UserRole.ADMIN)
  async delete(
    @Param('token') token: string,
  ): Promise<DataResponse<GameSessionDto>> {
    return ResponseHelper.buildResponse(
      await this.gameSessionService.remove(token),
    );
  }
}
