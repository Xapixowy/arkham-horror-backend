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
import { UserRoles } from '@Decorators/user-roles.decorator';
import { UserRole } from '@Enums/user/user-role.enum';
import { Public } from '@Decorators/public.decorator';
import { CardTranslationService } from '@Services/card-translation/card-translation.service';
import { CardTranslationDto } from '@Dtos/card-translation.dto';
import { CreateCardTranslationRequest } from '@Requests/card-translation/create-card-translation.request';
import { UpdateCardTranslationRequest } from '@Requests/card-translation/update-card-translation.request';

@Controller('cards/:cardId/translations')
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
  @HttpCode(HttpStatus.CREATED)
  @UserRoles(UserRole.ADMIN)
  async create(
    @Param('cardId') cardId: string,
    @Body() cardTranslation: CreateCardTranslationRequest,
  ): Promise<DataResponse<CardTranslationDto>> {
    return ResponseHelper.buildResponse(
      await this.cardTranslationService.add(+cardId, cardTranslation),
    );
  }

  @Put(':locale')
  @UserRoles(UserRole.ADMIN)
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
  @UserRoles(UserRole.ADMIN)
  async delete(
    @Param('cardId') cardId: string,
    @Param('locale') locale: string,
  ): Promise<DataResponse<CardTranslationDto>> {
    return ResponseHelper.buildResponse(
      await this.cardTranslationService.delete(+cardId, locale),
    );
  }
}
