import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response.helper';
import { DataResponse } from '@Types/data-response.type';
import { Roles } from '@Decorators/roles.decorator';
import { UserRole } from '@Enums/User/user-role.enum';
import { AuthGuard } from '@Guards/auth.guard';
import { RolesGuard } from '@Guards/roles.guard';
import { Public } from '@Decorators/public.decorator';
import { GameSessionService } from '@Services/game_session.service';
import { GameSessionDto } from '@DTOs/game-session.dto';
import { CreateGameSessionRequest } from '@Requests/GameSession/create-game-session.request';

@Controller('game-sessions/:gameSessionToken/players')
@UseGuards(AuthGuard, RolesGuard)
export class GameSessionController {
  constructor(private readonly gameSessionService: GameSessionService) {}

  @Get()
  @Public()
  async index(): Promise<DataResponse<GameSessionDto[]>> {
    return ResponseHelper.buildResponse(
      await this.gameSessionService.findAll(),
    );
  }

  @Get(':token')
  @Public()
  async show(
    @Param('token') token: string,
  ): Promise<DataResponse<GameSessionDto>> {
    return ResponseHelper.buildResponse(
      await this.gameSessionService.findOne(token),
    );
  }

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() gameSession: CreateGameSessionRequest,
  ): Promise<DataResponse<GameSessionDto>> {
    return ResponseHelper.buildResponse(
      await this.gameSessionService.add(gameSession.user_id),
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
