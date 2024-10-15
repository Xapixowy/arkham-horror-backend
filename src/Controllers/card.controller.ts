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
import { CardService } from '@Services/card.service';
import { CardDto } from '@DTOs/card.dto';
import { ResponseHelper } from '@Helpers/response.helper';
import { DataResponse } from '@Types/data-response.type';
import { CreateCardRequest } from '@Requests/Card/create-card.request';
import { UpdateCardRequest } from '@Requests/Card/update-card.request';
import { FileUploadHelper } from '@Helpers/file-upload.helper';
import { CharacterDto } from '@DTOs/character.dto';
import { AuthGuard } from '@Guards/auth.guard';
import { RolesGuard } from '@Guards/roles.guard';
import { Public } from '@Decorators/public.decorator';
import { Roles } from '@Decorators/roles.decorator';
import { UserRole } from '@Enums/User/user-role.enum';

@Controller('cards')
@UseGuards(AuthGuard, RolesGuard)
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  @Public()
  async index(): Promise<DataResponse<CardDto[]>> {
    return ResponseHelper.buildResponse(await this.cardService.findAll());
  }

  @Get(':id')
  @Public()
  async show(@Param('id') id: string): Promise<DataResponse<CardDto>> {
    return ResponseHelper.buildResponse(await this.cardService.findOne(+id));
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() card: CreateCardRequest,
  ): Promise<DataResponse<CardDto>> {
    return ResponseHelper.buildResponse(await this.cardService.add(card));
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() editedCard: UpdateCardRequest,
  ): Promise<DataResponse<CardDto>> {
    return ResponseHelper.buildResponse(
      await this.cardService.edit(+id, editedCard),
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string): Promise<DataResponse<CardDto>> {
    return ResponseHelper.buildResponse(await this.cardService.remove(+id));
  }

  @Post(':id/front-photo')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileUploadHelper.generateFileInterceptor())
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
  @Roles(UserRole.ADMIN)
  async deleteFrontPhoto(
    @Param('id') id: string,
  ): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.cardService.deleteFrontPhoto(+id),
    );
  }

  @Post(':id/back-photo')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileUploadHelper.generateFileInterceptor())
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
  @Roles(UserRole.ADMIN)
  async deleteBackPhoto(
    @Param('id') id: string,
  ): Promise<DataResponse<CharacterDto>> {
    return ResponseHelper.buildResponse(
      await this.cardService.deleteBackPhoto(+id),
    );
  }
}
