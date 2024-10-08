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
import { CharacterService } from '@Services/character.service';
import { CharacterDto } from '@DTOs/character.dto';
import { ResponseHelper } from '@Helpers/response.helper';
import { Response } from '@Types/response.type';
import { CreateCharacterRequest } from '@Requests/Character/create-character.request';
import { UpdateCharacterRequest } from '@Requests/Character/update-character.request';

@Controller('characters')
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Get()
  async index(): Promise<Response<CharacterDto[]>> {
    return ResponseHelper.buildResponse(await this.characterService.findAll());
  }

  @Get(':id')
  async show(@Param('id') id: string): Promise<Response<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.findOne(+id),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() character: CreateCharacterRequest,
  ): Promise<Response<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.add(character),
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() editedCharacter: UpdateCharacterRequest,
  ): Promise<Response<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.edit(+id, editedCharacter),
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Response<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.remove(+id),
    );
  }
}
