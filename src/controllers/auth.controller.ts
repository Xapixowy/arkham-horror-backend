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
} from '@nestjs/common';
import { AuthService } from '@services/auth.service';
import { RegisterUserRequest } from '@requests/user/register-user.request';
import { DataResponse } from '@custom-types/data-response.type';
import { UserDto } from '@dtos/user.dto';
import { ResponseHelper } from '@helpers/response.helper';
import { VerifyUserRequest } from '@requests/user/verify-user.request';
import { LoginUserRequest } from '@requests/user/login-user.request';
import { RemindPasswordRequest } from '@requests/user/remind-password.request';
import { ResetUserPasswordRequest } from '@requests/user/reset-user-password.request';
import { ConfigService } from '@nestjs/config';
import { RequestHelper } from '@helpers/request.helper';
import { AppConfig } from '@configs/app.config';
import { Public } from '@decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Public()
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
  async me(@Request() request): Promise<DataResponse<UserDto>> {
    return ResponseHelper.buildResponse(request['user']);
  }
}
