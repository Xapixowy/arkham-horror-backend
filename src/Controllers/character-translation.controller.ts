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
import { CharacterTranslationService } from '@Services/character-translation.service';
import { CharacterTranslationDto } from '@DTOs/character-translation.dto';
import { CreateCharacterTranslationRequest } from '@Requests/CharacterTranslation/create-character-translation.request';
import { UpdateCharacterTranslationRequest } from '@Requests/CharacterTranslation/update-character-translation.request';

@Controller('characters/:characterId/translations')
@UseGuards(AuthGuard, RolesGuard)
export class CharacterTranslationController {
  constructor(
    private characterTranslationService: CharacterTranslationService,
  ) {}

  @Get()
  @Public()
  async index(
    @Param('characterId') characterId: string,
  ): Promise<DataResponse<CharacterTranslationDto[]>> {
    return ResponseHelper.buildResponse(
      await this.characterTranslationService.findAll(+characterId),
    );
  }

  @Get(':locale')
  @Public()
  async show(
    @Param('characterId') characterId: string,
    @Param('locale') locale: string,
  ): Promise<DataResponse<CharacterTranslationDto>> {
    return ResponseHelper.buildResponse(
      await this.characterTranslationService.findOne(+characterId, locale),
    );
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('characterId') characterId: string,
    @Body() characterTranslation: CreateCharacterTranslationRequest,
  ): Promise<DataResponse<CharacterTranslationDto>> {
    return ResponseHelper.buildResponse(
      await this.characterTranslationService.add(
        +characterId,
        characterTranslation,
      ),
    );
  }

  @Put(':locale')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('characterId') characterId: string,
    @Param('locale') locale: string,
    @Body() characterTranslation: UpdateCharacterTranslationRequest,
  ): Promise<DataResponse<CharacterTranslationDto>> {
    return ResponseHelper.buildResponse(
      await this.characterTranslationService.edit(
        +characterId,
        locale,
        characterTranslation,
      ),
    );
  }

  @Delete(':locale')
  @Roles(UserRole.ADMIN)
  async delete(
    @Param('characterId') characterId: string,
    @Param('locale') locale: string,
  ): Promise<DataResponse<CharacterTranslationDto>> {
    return ResponseHelper.buildResponse(
      await this.characterTranslationService.delete(+characterId, locale),
    );
  }
}
