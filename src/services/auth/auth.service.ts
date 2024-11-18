import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '@Entities/user.entity';
import { RegisterUserRequest } from '@Requests/user/register-user.request';
import { UserExistsException } from '@Exceptions/user/user-exists.exception';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@Enums/user/user-role.enum';
import { UserDto } from '@Dtos/user.dto';
import { VerifyUserRequest } from '@Requests/user/verify-user.request';
import { UserEmailAndTokenMismatchException } from '@Exceptions/user/user-email-and-token-mismatch.exception';
import { LoginUserRequest } from '@Requests/user/login-user.request';
import { UserNotVerifiedException } from '@Exceptions/user/user-not-verified.exception';
import { UserWrongPasswordException } from '@Exceptions/user/user-wrong-password.exception';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RemindPasswordRequest } from '@Requests/user/remind-password.request';
import { ResetUserPasswordRequest } from '@Requests/user/reset-user-password.request';
import { UserPasswordMissmatchException } from '@Exceptions/user/user-password-missmatch.exception';
import { EmailService } from '../email/email.service';
import { EmailSendFailureException } from '@Exceptions/email-send-failure.exception';
import { Language } from '@Enums/language';
import { UserNotFoundException } from '@Exceptions/user/user-not-found.exception';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(
    user: RegisterUserRequest,
    language: Language,
  ): Promise<UserDto> {
    return this.dataSource.transaction(async (manager) => {
      if (user.password !== user.password_confirmation) {
        throw new UserPasswordMissmatchException();
      }

      const existingUser = await manager.findOneBy(User, { email: user.email });
      if (existingUser) {
        throw new UserExistsException();
      }

      const newUser = await manager.save(
        manager.create(User, {
          ...user,
          password: await bcrypt.hash(
            user.password,
            this.configService.get('bcrypt').saltRounds,
          ),
          role: UserRole.USER,
          verification_token: crypto.randomUUID(),
          created_at: new Date(),
          updated_at: new Date(),
        }),
      );

      const isEmailSent = await this.emailService.sendRegister(
        newUser,
        language,
      );

      if (!isEmailSent) {
        throw new EmailSendFailureException();
      }

      return UserDto.fromEntity(newUser);
    });
  }

  async verify(token: string, user: VerifyUserRequest): Promise<UserDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingUser = await manager.findOneBy(User, {
        verification_token: token,
      });
      if (!existingUser) {
        throw new UserNotFoundException();
      }

      if (existingUser.email !== user.email) {
        throw new UserEmailAndTokenMismatchException();
      }

      existingUser.verified_at = new Date();
      existingUser.verification_token = null;
      existingUser.updated_at = new Date();

      return UserDto.fromEntity(await manager.save(User, existingUser));
    });
  }

  async login(user: LoginUserRequest): Promise<UserDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingUser = await manager.findOneBy(User, { email: user.email });
      if (!existingUser) {
        throw new UserNotFoundException();
      }

      if (!existingUser.verified_at) {
        throw new UserNotVerifiedException();
      }

      if (!(await bcrypt.compare(user.password, existingUser.password))) {
        throw new UserWrongPasswordException();
      }

      const token = await this.jwtService.signAsync({
        sub: existingUser.id,
        email: existingUser.email,
        username: existingUser.name,
        role: existingUser.role,
      });

      const userDto = UserDto.fromEntity(existingUser);
      userDto.access_token = token;

      return userDto;
    });
  }

  async remindPassword(
    user: RemindPasswordRequest,
    language: Language,
  ): Promise<UserDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingUser = await manager.findOneBy(User, { email: user.email });
      if (!existingUser) {
        throw new UserNotFoundException();
      }

      existingUser.reset_token = crypto.randomUUID();
      existingUser.updated_at = new Date();

      const isEmailSent = await this.emailService.sendRemindPassword(
        existingUser,
        language,
      );

      if (!isEmailSent) {
        throw new EmailSendFailureException();
      }

      return UserDto.fromEntity(await manager.save(User, existingUser));
    });
  }

  async resetPassword(
    token: string,
    user: ResetUserPasswordRequest,
  ): Promise<UserDto> {
    return this.dataSource.transaction(async (manager) => {
      if (user.password !== user.password_confirmation) {
        throw new UserPasswordMissmatchException();
      }

      const existingUser = await manager.findOneBy(User, {
        reset_token: token,
      });
      if (!existingUser) {
        throw new UserNotFoundException();
      }

      if (existingUser.email !== user.email) {
        throw new UserEmailAndTokenMismatchException();
      }

      existingUser.password = await bcrypt.hash(
        user.password,
        this.configService.get('bcrypt').saltRounds,
      );
      existingUser.reset_token = null;
      existingUser.updated_at = new Date();

      return UserDto.fromEntity(await manager.save(User, existingUser));
    });
  }

  me(user: User): UserDto {
    return UserDto.fromEntity(user);
  }
}
