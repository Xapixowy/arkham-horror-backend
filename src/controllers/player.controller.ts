import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response/response.helper';
import { DataResponse } from '@Types/data-response.type';
import { Public } from '@Decorators/public.decorator';
import { GameSessionDto } from '@Dtos/game-session.dto';
import { PlayerService } from '@Services/player/player.service';
import { PlayerDto } from '@Dtos/player.dto';
import { User } from '@Entities/user.entity';
import { RequestUser } from '@Decorators/param/request-user.decorator';
import { PlayerRoles } from '@Decorators/player-roles.decorator';
import { PlayerRole } from '@Enums/player/player-role.enum';
import { RequestLanguage } from '@Decorators/param/request-language.decorator';
import { Language } from '@Enums/language';
import { PlayerCardDto } from '@Dtos/player-card.dto';
import { AssignPlayerCardsRequest } from '@Requests/player/assign-player-cards.request';
import { RemovePlayerCardsRequest } from '@Requests/player/remove-player-cards.request';
import { UpdatePlayerRequest } from '@Requests/player/update-player.request';

@Controller('game-sessions/:gameSessionToken/players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get()
  @Public()
  async index(
    @Param('gameSessionToken') gameSessionToken: string,
    @RequestLanguage() language: Language,
  ): Promise<DataResponse<PlayerDto[]>> {
    return ResponseHelper.buildResponse(
      await this.playerService.findAll(gameSessionToken, language),
    );
  }

  @Get('me')
  @Public()
  async me(
    @Param('gameSessionToken') gameSessionToken: string,
    @RequestUser() user: User,
    @RequestLanguage() language: Language,
  ): Promise<DataResponse<PlayerDto>> {
    return ResponseHelper.buildResponse(
      await this.playerService.findUserPlayer(gameSessionToken, user, language),
    );
  }

  @Get(':playerToken')
  @Public()
  async show(
    @Param('gameSessionToken') gameSessionToken: string,
    @Param('playerToken') playerToken: string,
    @RequestLanguage() language: Language,
  ): Promise<DataResponse<PlayerDto>> {
    return ResponseHelper.buildResponse(
      await this.playerService.findOne(gameSessionToken, playerToken, language),
    );
  }

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @RequestUser() user: User,
    @Param('gameSessionToken') gameSessionToken: string,
  ): Promise<DataResponse<PlayerDto>> {
    return ResponseHelper.buildResponse(
      await this.playerService.add(gameSessionToken, user),
    );
  }

  @Put(':playerToken/renew-character')
  @Public()
  async renewCharacter(
    @Param('gameSessionToken') gameSessionToken: string,
    @Param('playerToken') playerToken: string,
    @RequestLanguage() language: Language,
  ): Promise<DataResponse<PlayerDto>> {
    return ResponseHelper.buildResponse(
      await this.playerService.renewCharacter(
        gameSessionToken,
        playerToken,
        language,
      ),
    );
  }

  @Put(':playerToken/assign-cards')
  @Public()
  async assignCards(
    @Param('gameSessionToken') gameSessionToken: string,
    @Param('playerToken') playerToken: string,
    @RequestLanguage() language: Language,
    @Body() assignPlayerCardsRequest: AssignPlayerCardsRequest,
  ): Promise<DataResponse<PlayerCardDto[]>> {
    return ResponseHelper.buildResponse(
      await this.playerService.assignCards(
        gameSessionToken,
        playerToken,
        language,
        assignPlayerCardsRequest.cardIds,
      ),
    );
  }

  @Put(':playerToken/remove-cards')
  @Public()
  async removeCards(
    @Param('gameSessionToken') gameSessionToken: string,
    @Param('playerToken') playerToken: string,
    @RequestLanguage() language: Language,
    @Body() removePlayerCardsRequest: RemovePlayerCardsRequest,
  ): Promise<DataResponse<PlayerCardDto[]>> {
    return ResponseHelper.buildResponse(
      await this.playerService.removeCards(
        gameSessionToken,
        playerToken,
        language,
        removePlayerCardsRequest.cardIds,
      ),
    );
  }

  @Put(':playerToken/update-player')
  @Public()
  async updatePlayer(
    @Param('gameSessionToken') gameSessionToken: string,
    @Param('playerToken') playerToken: string,
    @RequestLanguage() language: Language,
    @Body() updatePlayerRequest: UpdatePlayerRequest,
  ): Promise<DataResponse<PlayerDto>> {
    return ResponseHelper.buildResponse(
      await this.playerService.updatePlayer(
        gameSessionToken,
        playerToken,
        language,
        updatePlayerRequest,
      ),
    );
  }

  @Delete(':token')
  @PlayerRoles(PlayerRole.HOST)
  async delete(
    @Param('token') token: string,
  ): Promise<DataResponse<GameSessionDto>> {
    return ResponseHelper.buildResponse(await this.playerService.remove(token));
  }
}
