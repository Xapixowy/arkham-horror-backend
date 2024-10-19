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
  UseGuards,
} from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response.helper';
import { DataResponse } from '@Types/data-response.type';
import { Roles } from '@Decorators/roles.decorator';
import { UserRole } from '@Enums/User/user-role.enum';
import { AuthGuard } from '@Guards/auth.guard';
import { RolesGuard } from '@Guards/roles.guard';
import { Public } from '@Decorators/public.decorator';
import { CardTranslationService } from '@Services/card-translation.service';
import { CardTranslationDto } from '@DTOs/card-translation.dto';
import { CreateCardTranslationRequest } from '@Requests/CardTranslation/create-card-translation.request';
import { UpdateCardTranslationRequest } from '@Requests/CardTranslation/update-card-translation.request';

@Controller('cards/:cardId/translations')
@UseGuards(AuthGuard, RolesGuard)
export class CardTranslationController {
  constructor(private cardTranslationService: CardTranslationService) {}

  @Get()
  @Public()
  async index(
    @Param('cardId') cardId: string,
  ): Promise<DataResponse<CardTranslationDto[]>> {
    return ResponseHelper.buildResponse(
      await this.cardTranslationService.findAll(+cardId),
    );
  }

  @Get(':locale')
  @Public()
  async show(
    @Param('cardId') cardId: string,
    @Param('locale') locale: string,
  ): Promise<DataResponse<CardTranslationDto>> {
    return ResponseHelper.buildResponse(
      await this.cardTranslationService.findOne(+cardId, locale),
    );
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('cardId') cardId: string,
    @Body() cardTranslation: CreateCardTranslationRequest,
  ): Promise<DataResponse<CardTranslationDto>> {
    return ResponseHelper.buildResponse(
      await this.cardTranslationService.add(+cardId, cardTranslation),
    );
  }

  @Put(':locale')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('cardId') cardId: string,
    @Param('locale') locale: string,
    @Body() cardTranslation: UpdateCardTranslationRequest,
  ): Promise<DataResponse<CardTranslationDto>> {
    return ResponseHelper.buildResponse(
      await this.cardTranslationService.edit(+cardId, locale, cardTranslation),
    );
  }

  @Delete(':locale')
  @Roles(UserRole.ADMIN)
  async delete(
    @Param('cardId') cardId: string,
    @Param('locale') locale: string,
  ): Promise<DataResponse<CardTranslationDto>> {
    return ResponseHelper.buildResponse(
      await this.cardTranslationService.delete(+cardId, locale),
    );
  }
}
