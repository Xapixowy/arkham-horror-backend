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
import { CardService } from '@Services/card.service';
import { CardDto } from '@DTOs/Card/card.dto';
import { ResponseHelper } from '@Helpers/response.helper';
import { Response } from '@Types/response.type';
import { CreateCardRequest } from '@Requests/Card/create-card.request';
import { UpdateCardRequest } from '@Requests/Card/update-card.request';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  async index(): Promise<Response<CardDto[]>> {
    return ResponseHelper.buildResponse(await this.cardService.findAll());
  }

  @Get(':id')
  async show(@Param('id') id: string): Promise<Response<CardDto>> {
    return ResponseHelper.buildResponse(await this.cardService.findOne(+id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() card: CreateCardRequest): Promise<Response<CardDto>> {
    return ResponseHelper.buildResponse(await this.cardService.add(card));
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() editedCard: UpdateCardRequest,
  ): Promise<Response<CardDto>> {
    return ResponseHelper.buildResponse(
      await this.cardService.edit(+id, editedCard),
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Response<CardDto>> {
    return ResponseHelper.buildResponse(await this.cardService.remove(+id));
  }
}
