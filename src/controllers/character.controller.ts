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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CharacterService } from '@Services/character/character.service';
import { CharacterDto } from '@Dtos/character.dto';
import { ResponseHelper } from '@Helpers/response/response.helper';
import { DataResponse } from '@Types/data-response.type';
import { CreateCharacterRequest } from '@Requests/character/create-character.request';
import { UpdateCharacterRequest } from '@Requests/character/update-character.request';
import { FileUploadHelper } from '@Helpers/file-upload/file-upload.helper';
import { UserRoles } from '@Decorators/user-roles.decorator';
import { UserRole } from '@Enums/user/user-role.enum';
import { Public } from '@Decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { RequestLanguage } from '@Decorators/params/request-language.decorator';
import { Language } from '@Enums/language';

@Controller('characters')
export class CharacterController {
  constructor(
    private readonly characterService: CharacterService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Public()
  async index(
    @RequestLanguage() language: Language,
  ): Promise<DataResponse<CharacterDto[]>> {
    return ResponseHelper.buildResponse(
      await this.characterService.findAll(language),
    );
  }

  @Get(':id')
  @Public()
  async show(
    @RequestLanguage() language: Language,
    @Param('id') id: string,
  ): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.findOne(+id, language),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UserRoles(UserRole.ADMIN)
  async create(
    @Body() character: CreateCharacterRequest,
  ): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.add(character),
    );
  }

  @Put(':id')
  @UserRoles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() editedCharacter: UpdateCharacterRequest,
  ): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.edit(+id, editedCharacter),
    );
  }

  @Delete(':id')
  @UserRoles(UserRole.ADMIN)
  async delete(@Param('id') id: string): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.remove(+id),
    );
  }

  @Post(':id/photo')
  @UserRoles(UserRole.ADMIN)
  @UseInterceptors(FileUploadHelper.generateFileInterceptor())
  async setPhoto(
    @Param('id') id: string,
    @UploadedFile(
      FileUploadHelper.generateParseFilePipe(
        5 * 1024 * 1024, // 5MB
        /image\/(jpeg|png)/,
      ),
    )
    file: Express.Multer.File,
  ): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.setPhoto(+id, file),
    );
  }

  @Delete(':id/photo')
  @UserRoles(UserRole.ADMIN)
  async deletePhoto(
    @Param('id') id: string,
  ): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.deletePhoto(+id),
    );
  }
}
