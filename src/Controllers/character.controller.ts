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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CharacterService } from '@Services/character.service';
import { CharacterDto } from '@DTOs/character.dto';
import { ResponseHelper } from '@Helpers/response.helper';
import { DataResponse } from '@Types/data-response.type';
import { CreateCharacterRequest } from '@Requests/Character/create-character.request';
import { UpdateCharacterRequest } from '@Requests/Character/update-character.request';
import { FileUploadHelper } from '@Helpers/file-upload.helper';
import { Roles } from '@Decorators/roles.decorator';
import { UserRole } from '@Enums/User/user-role.enum';
import { AuthGuard } from '@Guards/auth.guard';
import { RolesGuard } from '@Guards/roles.guard';
import { Public } from '@Decorators/public.decorator';

@Controller('characters')
@UseGuards(AuthGuard, RolesGuard)
export class CharacterController {
  constructor(private characterService: CharacterService) {}

  @Get()
  @Public()
  async index(): Promise<DataResponse<CharacterDto[]>> {
    return ResponseHelper.buildResponse(await this.characterService.findAll());
  }

  @Get(':id')
  @Public()
  async show(@Param('id') id: string): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.findOne(+id),
    );
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() character: CreateCharacterRequest,
  ): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.add(character),
    );
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() editedCharacter: UpdateCharacterRequest,
  ): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.edit(+id, editedCharacter),
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.remove(+id),
    );
  }

  @Post(':id/photo')
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
  async deletePhoto(
    @Param('id') id: string,
  ): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.characterService.deletePhoto(+id),
    );
  }
}
