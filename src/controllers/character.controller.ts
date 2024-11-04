import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CharacterService } from '@services/character.service';
import { CharacterDto } from '@dtos/character.dto';
import { ResponseHelper } from '@helpers/response.helper';
import { DataResponse } from '@custom-types/data-response.type';
import { CreateCharacterRequest } from '@requests/character/create-character.request';
import { UpdateCharacterRequest } from '@requests/character/update-character.request';
import { FileUploadHelper } from '@helpers/file-upload.helper';
import { UserRoles } from '@decorators/user-roles.decorator';
import { UserRole } from '@enums/user/user-role.enum';
import { Public } from '@decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@configs/app.config';
import { RequestHelper } from '@helpers/request.helper';

@Controller('characters')
export class CharacterController {
  constructor(
    private readonly characterService: CharacterService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Public()
  async index(
    @Headers() headers: Record<string, string>,
  ): Promise<DataResponse<CharacterDto[]>> {
    const language = RequestHelper.getLanguage(
      headers,
      this.configService.get<AppConfig>('app').language,
    );

    return ResponseHelper.buildResponse(
      await this.characterService.findAll(language),
    );
  }

  @Get(':id')
  @Public()
  async show(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ): Promise<DataResponse<CharacterDto>> {
    const language = RequestHelper.getLanguage(
      headers,
      this.configService.get<AppConfig>('app').language,
    );

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
