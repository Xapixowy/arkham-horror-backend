import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '@Entities/user.entity';
import { RegisterUserRequest } from '@Requests/User/register-user.request';
import { UserExistsException } from '@Exceptions/User/user-exists.exception';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@Enums/User/user-role.enum';
import { UserDto } from '@DTOs/user.dto';
import { VerifyUserRequest } from '@Requests/User/verify-user.request';
import { NotFoundException } from '@Exceptions/not-found.exception';
import { UserEmailAndTokenMismatchException } from '@Exceptions/User/user-email-and-token-mismatch.exception';
import { LoginUserRequest } from '@Requests/User/login-user.request';
import { UserNotVerifiedException } from '@Exceptions/User/user-not-verified.exception';
import { UserWrongPasswordException } from '@Exceptions/User/user-wrong-password.exception';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RemindPasswordRequest } from '@Requests/User/remind-password.request';
import { ResetUserPasswordRequest } from '@Requests/User/reset-user-password.request';
import { UserPasswordMissmatchException } from '@Exceptions/User/user-password-missmatch.exception';
import { EmailService } from '@Services/email.service';
import { EmailSendFailureException } from '@Exceptions/email-send-failure.exception';
import { Language } from '@Enums/language';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
    private configService: ConfigService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(
    user: RegisterUserRequest,
    language?: Language,
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
        this.userRepository.create({
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
        throw new NotFoundException();
      }

      if (existingUser.email !== user.email) {
        throw new UserEmailAndTokenMismatchException();
      }

      existingUser.verified_at = new Date();
      existingUser.verification_token = null;

      return UserDto.fromEntity(await manager.save(User, existingUser));
    });
  }

  async login(user: LoginUserRequest): Promise<UserDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingUser = await manager.findOneBy(User, { email: user.email });
      if (!existingUser) {
        throw new NotFoundException();
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
    language?: Language,
  ): Promise<UserDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingUser = await manager.findOneBy(User, { email: user.email });
      if (!existingUser) {
        throw new NotFoundException();
      }

      existingUser.reset_token = crypto.randomUUID();

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
        throw new NotFoundException();
      }

      if (existingUser.email !== user.email) {
        throw new UserEmailAndTokenMismatchException();
      }

      existingUser.password = await bcrypt.hash(
        user.password,
        this.configService.get('bcrypt').saltRounds,
      );
      existingUser.reset_token = null;

      return UserDto.fromEntity(await manager.save(User, existingUser));
    });
  }
}
