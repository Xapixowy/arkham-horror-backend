import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '@Services/auth.service';
import { RegisterUserRequest } from '@Requests/User/register-user.request';
import { DataResponse } from '@Types/data-response.type';
import { UserDto } from '@DTOs/user.dto';
import { ResponseHelper } from '@Helpers/response.helper';
import { VerifyUserRequest } from '@Requests/User/verify-user.request';
import { LoginUserRequest } from '@Requests/User/login-user.request';
import { RemindPasswordRequest } from '@Requests/User/remind-password.request';
import { ResetUserPasswordRequest } from '@Requests/User/reset-user-password.request';
import { AuthGuard } from '@Guards/auth.guard';
import { ConfigService } from '@nestjs/config';
import { RequestHelper } from '@Helpers/request.helper';
import { AppConfig } from '../Config/app.config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Headers() headers: Record<string, string>,
    @Body() user: RegisterUserRequest,
  ): Promise<DataResponse<UserDto>> {
    const language = RequestHelper.getLanguage(
      headers,
      this.configService.get<AppConfig>('app').language,
    );

    return ResponseHelper.buildResponse(
      await this.authService.register(user, language),
    );
  }

  @Post('verify/:token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async verify(
    @Param('token') token: string,
    @Body() user: VerifyUserRequest,
  ): Promise<void> {
    ResponseHelper.buildResponse(await this.authService.verify(token, user));
  }

  @Post('login')
  async login(@Body() user: LoginUserRequest): Promise<DataResponse<UserDto>> {
    return ResponseHelper.buildResponse(await this.authService.login(user));
  }

  @Post('remind-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remindPassword(
    @Headers() headers: Record<string, string>,
    @Body() user: RemindPasswordRequest,
  ): Promise<void> {
    const language = RequestHelper.getLanguage(
      headers,
      this.configService.get<AppConfig>('app').language,
    );
    try {
      await this.authService.remindPassword(user, language);
    } catch (e) {}
  }

  @Post('reset-password/:token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(
    @Param('token') token: string,
    @Body() user: ResetUserPasswordRequest,
  ): Promise<DataResponse<UserDto>> {
    return ResponseHelper.buildResponse(
      await this.authService.resetPassword(token, user),
    );
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Request() request): Promise<DataResponse<UserDto>> {
    return ResponseHelper.buildResponse(request['user']);
  }
}
