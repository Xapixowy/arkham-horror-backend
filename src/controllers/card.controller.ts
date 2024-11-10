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
import { CardService } from '@Services/card/card.service';
import { CardDto } from '@Dtos/card.dto';
import { ResponseHelper } from '@Helpers/response/response.helper';
import { DataResponse } from '@Types/data-response.type';
import { CreateCardRequest } from '@Requests/card/create-card.request';
import { UpdateCardRequest } from '@Requests/card/update-card.request';
import { FileUploadHelper } from '@Helpers/file-upload/file-upload.helper';
import { CharacterDto } from '@Dtos/character.dto';
import { Public } from '@Decorators/public.decorator';
import { UserRoles } from '@Decorators/user-roles.decorator';
import { UserRole } from '@Enums/user/user-role.enum';
import { ConfigService } from '@nestjs/config';
import { RequestLanguage } from '@Decorators/param/request-language.decorator';
import { Language } from '@Enums/language';

@Controller('cards')
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Public()
  async index(
    @RequestLanguage() language: Language,
  ): Promise<DataResponse<CardDto[]>> {
    return ResponseHelper.buildResponse(
      await this.cardService.findAll(language),
    );
  }

  @Get(':id')
  @Public()
  async show(
    @RequestLanguage() language: Language,
    @Param('id') id: string,
  ): Promise<DataResponse<CardDto>> {
    return ResponseHelper.buildResponse(
      await this.cardService.findOne(+id, language),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UserRoles(UserRole.ADMIN)
  async create(
    @Body() card: CreateCardRequest,
  ): Promise<DataResponse<CardDto>> {
    return ResponseHelper.buildResponse(await this.cardService.add(card));
  }

  @Put(':id')
  @UserRoles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() editedCard: UpdateCardRequest,
  ): Promise<DataResponse<CardDto>> {
    return ResponseHelper.buildResponse(
      await this.cardService.edit(+id, editedCard),
    );
  }

  @Delete(':id')
  @UserRoles(UserRole.ADMIN)
  async delete(@Param('id') id: string): Promise<DataResponse<CardDto>> {
    return ResponseHelper.buildResponse(await this.cardService.remove(+id));
  }

  @Post(':id/front-photo')
  @UseInterceptors(FileUploadHelper.generateFileInterceptor())
  @UserRoles(UserRole.ADMIN)
  async setFrontPhoto(
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
      await this.cardService.setFrontPhoto(+id, file),
    );
  }

  @Delete(':id/front-photo')
  @UserRoles(UserRole.ADMIN)
  async deleteFrontPhoto(
    @Param('id') id: string,
  ): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.cardService.deleteFrontPhoto(+id),
    );
  }

  @Post(':id/back-photo')
  @UseInterceptors(FileUploadHelper.generateFileInterceptor())
  @UserRoles(UserRole.ADMIN)
  async setBackPhoto(
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
      await this.cardService.setBackPhoto(+id, file),
    );
  }

  @Delete(':id/back-photo')
  @UserRoles(UserRole.ADMIN)
  async deleteBackPhoto(
    @Param('id') id: string,
  ): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.cardService.deleteBackPhoto(+id),
    );
  }
}
