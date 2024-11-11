import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { AuthService } from '@Services/auth/auth.service';
import { RegisterUserRequest } from '@Requests/user/register-user.request';
import { DataResponse } from '@Types/data-response.type';
import { UserDto } from '@Dtos/user.dto';
import { ResponseHelper } from '@Helpers/response/response.helper';
import { VerifyUserRequest } from '@Requests/user/verify-user.request';
import { LoginUserRequest } from '@Requests/user/login-user.request';
import { RemindPasswordRequest } from '@Requests/user/remind-password.request';
import { ResetUserPasswordRequest } from '@Requests/user/reset-user-password.request';
import { ConfigService } from '@nestjs/config';
import { Public } from '@Decorators/public.decorator';
import { RequestLanguage } from '@Decorators/param/request-language.decorator';
import { Language } from '@Enums/language';
import { RequestUser } from '@Decorators/param/request-user.decorator';
import { User } from '@Entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Public()
  async register(
    @RequestLanguage() language: Language,
    @Body() user: RegisterUserRequest,
  ): Promise<DataResponse<UserDto>> {
    return ResponseHelper.buildResponse(
      await this.authService.register(user, language),
    );
  }

  @Post('verify/:token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Public()
  async verify(
    @Param('token') token: string,
    @Body() user: VerifyUserRequest,
  ): Promise<void> {
    ResponseHelper.buildResponse(await this.authService.verify(token, user));
  }

  @Post('login')
  @Public()
  async login(@Body() user: LoginUserRequest): Promise<DataResponse<UserDto>> {
    return ResponseHelper.buildResponse(await this.authService.login(user));
  }

  @Post('remind-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Public()
  async remindPassword(
    @RequestLanguage() language: Language,
    @Body() user: RemindPasswordRequest,
  ): Promise<void> {
    try {
      await this.authService.remindPassword(user, language);
    } catch (e) {}
  }

  @Post('reset-password/:token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Public()
  async resetPassword(
    @Param('token') token: string,
    @Body() user: ResetUserPasswordRequest,
  ): Promise<DataResponse<UserDto>> {
    return ResponseHelper.buildResponse(
      await this.authService.resetPassword(token, user),
    );
  }

  @Get('me')
  async me(@RequestUser() user: User): Promise<DataResponse<UserDto>> {
    return ResponseHelper.buildResponse(user);
  }
}
