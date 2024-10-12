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
import { CharacterService } from '@Services/character.service';
import { CharacterDto } from '@DTOs/character.dto';
import { ResponseHelper } from '@Helpers/response.helper';
import { DataResponse } from '@Types/data-response.type';
import { CreateCharacterRequest } from '@Requests/Character/create-character.request';
import { UpdateCharacterRequest } from '@Requests/Character/update-character.request';
import { ConfigService } from '@nestjs/config';
import { FileUploadHelper } from '@Helpers/file-upload.helper';

@Controller('characters')
export class CharacterController {
  uploadsPath: string;

  constructor(
    private readonly characterService: CharacterService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async index(): Promise<DataResponse<CharacterDto[]>> {
    return ResponseHelper.buildResponse(await this.characterService.findAll());
  }

  @Get(':id')
  async show(@Param('id') id: string): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.findOne(+id),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() character: CreateCharacterRequest,
  ): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.add(character),
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() editedCharacter: UpdateCharacterRequest,
  ): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.edit(+id, editedCharacter),
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.remove(+id),
    );
  }

  @Post(':id/photo')
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
  async deletePhoto(
    @Param('id') id: string,
  ): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.deletePhoto(+id),
    );
  }
}
