import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response/response.helper';
import { DataResponse } from '@Types/data-response.type';
import { UserRoles } from '@Decorators/user-roles.decorator';
import { UserRole } from '@Enums/user/user-role.enum';
import { Public } from '@Decorators/public.decorator';
import { GameSessionService } from '@Services/game-session/game-session.service';
import { GameSessionDto } from '@Dtos/game-session.dto';
import { RequestUser } from '@Decorators/param/request-user.decorator';
import { User } from '@Entities/user.entity';

@Controller('game-sessions')
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
    @RequestUser() user: User,
  ): Promise<DataResponse<GameSessionDto>> {
    return ResponseHelper.buildResponse(
      await this.gameSessionService.add(user),
    );
  }

  @Delete(':token')
  @UserRoles(UserRole.ADMIN)
  async delete(
    @Param('token') token: string,
  ): Promise<DataResponse<GameSessionDto>> {
    return ResponseHelper.buildResponse(
      await this.gameSessionService.remove(token),
    );
  }
}
