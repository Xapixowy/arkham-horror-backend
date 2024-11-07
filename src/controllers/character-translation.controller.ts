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
import { CharacterTranslationService } from '@Services/character-translation/character-translation.service';
import { CharacterTranslationDto } from '@Dtos/character-translation.dto';
import { CreateCharacterTranslationRequest } from '@Requests/character-translation/create-character-translation.request';
import { UpdateCharacterTranslationRequest } from '@Requests/character-translation/update-character-translation.request';

@Controller('characters/:characterId/translations')
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
  @HttpCode(HttpStatus.CREATED)
  @UserRoles(UserRole.ADMIN)
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
  @UserRoles(UserRole.ADMIN)
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
  @UserRoles(UserRole.ADMIN)
  async delete(
    @Param('characterId') characterId: string,
    @Param('locale') locale: string,
  ): Promise<DataResponse<CharacterTranslationDto>> {
    return ResponseHelper.buildResponse(
      await this.characterTranslationService.delete(+characterId, locale),
    );
  }
}
