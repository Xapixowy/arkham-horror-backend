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
import { CardService } from '@services/card.service';
import { CardDto } from '@dtos/card.dto';
import { ResponseHelper } from '@helpers/response.helper';
import { DataResponse } from '@custom-types/data-response.type';
import { CreateCardRequest } from '@requests/card/create-card.request';
import { UpdateCardRequest } from '@requests/card/update-card.request';
import { FileUploadHelper } from '@helpers/file-upload.helper';
import { CharacterDto } from '@dtos/character.dto';
import { Public } from '@decorators/public.decorator';
import { UserRoles } from '@decorators/user-roles.decorator';
import { UserRole } from '@enums/user/user-role.enum';
import { RequestHelper } from '@helpers/request.helper';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@configs/app.config';

@Controller('cards')
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Public()
  async index(
    @Headers() headers: Record<string, string>,
  ): Promise<DataResponse<CardDto[]>> {
    const language = RequestHelper.getLanguage(
      headers,
      this.configService.get<AppConfig>('app').language,
    );

    return ResponseHelper.buildResponse(
      await this.cardService.findAll(language),
    );
  }

  @Get(':id')
  @Public()
  async show(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ): Promise<DataResponse<CardDto>> {
    const language = RequestHelper.getLanguage(
      headers,
      this.configService.get<AppConfig>('app').language,
    );

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
