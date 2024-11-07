import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from '@Entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { UserDto } from '@Dtos/user.dto';
import { RegisterUserRequest } from '@Requests/user/register-user.request';
import { UserPasswordMissmatchException } from '@Exceptions/user/user-password-missmatch.exception';
import { EmailSendFailureException } from '@Exceptions/email-send-failure.exception';
import { UserExistsException } from '@Exceptions/user/user-exists.exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@Enums/user/user-role.enum';
import { LoginUserRequest } from '@Requests/user/login-user.request';
import { NotFoundException } from '@Exceptions/not-found.exception';
import { UserNotVerifiedException } from '@Exceptions/user/user-not-verified.exception';
import { UserWrongPasswordException } from '@Exceptions/user/user-wrong-password.exception';
import { VerifyUserRequest } from '@Requests/user/verify-user.request';
import { UserEmailAndTokenMismatchException } from '@Exceptions/user/user-email-and-token-mismatch.exception';
import { RemindPasswordRequest } from '@Requests/user/remind-password.request';
import { ResetUserPasswordRequest } from '@Requests/user/reset-user-password.request';

describe('AuthService', () => {
  let authService: AuthService;
  let dataSource: DataSource;
  let configService: ConfigService;
  let emailService: EmailService;
  let jwtService: JwtService;

  const hash = 'hashedPassword';
  const randomUUID: `${string}-${string}-${string}-${string}-${string}` =
    '1-2-3-4-5';
  const jwtToken = 'jwtToken';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: DataSource, useValue: { transaction: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
        {
          provide: EmailService,
          useValue: { sendRegister: jest.fn(), sendRemindPassword: jest.fn() },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    dataSource = module.get<DataSource>(DataSource);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);

    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => hash);
    jest.spyOn(crypto, 'randomUUID').mockReturnValue(randomUUID);
    jest.spyOn(configService, 'get').mockReturnValue({ saltRounds: 10 });
  });

  describe('register', () => {
    let userRequest: RegisterUserRequest;
    let userEntity: User;
    let userEntityWithId: User;
    let userDto: UserDto;
    let mockManager: {
      findOneBy: jest.Mock;
      create: jest.Mock;
      save: jest.Mock;
    };

    beforeEach(() => {
      userRequest = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
      };
      userEntity = {
        name: userRequest.name,
        email: userRequest.email,
        password: hash,
        role: UserRole.USER,
        verification_token: randomUUID,
        created_at: new Date(),
        updated_at: new Date(),
      } as User;
      userEntityWithId = { id: 1, ...userEntity };
      userDto = UserDto.fromEntity(userEntityWithId);
      mockManager = {
        findOneBy: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(userEntity),
        save: jest.fn().mockResolvedValue(userEntityWithId),
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => await cb(mockManager));
    });

    it('should register a user successfully', async () => {
      jest.spyOn(emailService, 'sendRegister').mockResolvedValue(true);

      const result = await authService.register(userRequest);

      expect(result).toBeInstanceOf(UserDto);
      expect(result).toEqual(userDto);
      expect(mockManager.save).toHaveBeenCalled();
      expect(emailService.sendRegister).toHaveBeenCalled();
    });

    it('should throw UserPasswordMissmatchException if passwords do not match', async () => {
      const userRequestWithPasswordMissmatch = {
        ...userRequest,
        password: 'password',
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => await cb({}));

      await expect(
        authService.register(userRequestWithPasswordMissmatch),
      ).rejects.toThrow(UserPasswordMissmatchException);
    });

    it('should throw UserExistsException if user already exists', async () => {
      const mockManager = {
        findOneBy: jest.fn().mockResolvedValue(new User()),
        save: jest.fn(),
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => await cb(mockManager));

      await expect(authService.register(userRequest)).rejects.toThrow(
        UserExistsException,
      );
    });

    it('should throw EmailSendFailureException if email sending fails', async () => {
      jest.spyOn(emailService, 'sendRegister').mockResolvedValue(false);

      await expect(authService.register(userRequest)).rejects.toThrow(
        EmailSendFailureException,
      );
      expect(emailService.sendRegister).toHaveBeenCalled();
    });
  });

  describe('verify', () => {
    let userRequest: VerifyUserRequest;
    let userEntity: User;
    let userDto: UserDto;
    let mockManager: {
      findOneBy: jest.Mock;
      save: jest.Mock;
    };

    beforeEach(() => {
      userRequest = {
        email: 'test@example.com',
      };
      userEntity = {
        id: 1,
        email: userRequest.email,
        verification_token: null,
        verified_at: new Date(),
        updated_at: new Date(),
      } as User;
      userDto = UserDto.fromEntity(userEntity);
      mockManager = {
        findOneBy: jest.fn().mockResolvedValue(userEntity),
        save: jest.fn().mockResolvedValue(userEntity),
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => await cb(mockManager));
    });

    it('should verify a user successfully', async () => {
      const result = await authService.verify(randomUUID, userRequest);
      userDto.verified_at = result.verified_at;
      userDto.updated_at = result.updated_at;

      expect(result).toBeInstanceOf(UserDto);
      expect(result).toEqual(userDto);
      expect(mockManager.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user with token does not exist', async () => {
      mockManager.findOneBy.mockResolvedValue(null);

      await expect(authService.verify(randomUUID, userRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UserEmailAndTokenMismatchException if email does not match', async () => {
      userEntity.email = 'different@example.com';

      await expect(authService.verify(randomUUID, userRequest)).rejects.toThrow(
        UserEmailAndTokenMismatchException,
      );
    });
  });

  describe('login', () => {
    let userRequest: LoginUserRequest;
    let userEntity: User;
    let mockManager: {
      findOneBy: jest.Mock;
    };

    beforeEach(() => {
      userRequest = {
        email: 'test@example.com',
        password: 'password123',
      };
      userEntity = {
        id: 1,
        email: userRequest.email,
        name: 'Test User',
        password: hash,
        verified_at: new Date(),
        role: UserRole.USER,
      } as User;
      mockManager = {
        findOneBy: jest.fn().mockResolvedValue(userEntity),
      };

      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => await cb(mockManager));
    });

    it('should login a user successfully', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockImplementation(async () => jwtToken);

      const result = await authService.login(userRequest);

      expect(result).toBeInstanceOf(UserDto);
      expect(result.access_token).toEqual(jwtToken);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockManager.findOneBy.mockResolvedValue(null);

      await expect(authService.login(userRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UserNotVerifiedException if user is not verified', async () => {
      userEntity.verified_at = null;

      await expect(authService.login(userRequest)).rejects.toThrow(
        UserNotVerifiedException,
      );
    });

    it('should throw UserWrongPasswordException if password is incorrect', async () => {
      const loginRequestWithWrongPassword: LoginUserRequest = {
        ...userRequest,
        password: 'wrongPassword',
      };

      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(
        authService.login(loginRequestWithWrongPassword),
      ).rejects.toThrow(UserWrongPasswordException);
    });
  });

  describe('remindPassword', () => {
    let userRequest: RemindPasswordRequest;
    let userEntity: User;
    let userDto: UserDto;
    let mockManager: {
      findOneBy: jest.Mock;
      save: jest.Mock;
    };

    beforeEach(() => {
      userRequest = {
        email: 'test@example.com',
      };
      userEntity = {
        id: 1,
        email: userRequest.email,
        reset_token: jwtToken,
        updated_at: new Date(),
      } as User;
      userDto = UserDto.fromEntity(userEntity);
      mockManager = {
        findOneBy: jest.fn().mockResolvedValue(userEntity),
        save: jest.fn().mockResolvedValue(userEntity),
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => await cb(mockManager));
    });

    it('should remind password successfully', async () => {
      jest.spyOn(emailService, 'sendRemindPassword').mockResolvedValue(true);

      const result = await authService.remindPassword(userRequest);

      expect(result).toBeInstanceOf(UserDto);
      expect(result).toEqual(userDto);
      expect(mockManager.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockManager.findOneBy.mockResolvedValue(null);

      await expect(authService.remindPassword(userRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw EmailSendFailureException if email sending fails', async () => {
      jest.spyOn(emailService, 'sendRemindPassword').mockResolvedValue(false);

      await expect(authService.remindPassword(userRequest)).rejects.toThrow(
        EmailSendFailureException,
      );
    });
  });

  describe('resetPassword', () => {
    let userRequest: ResetUserPasswordRequest;
    let userEntity: User;
    let userDto: UserDto;
    let mockManager: {
      findOneBy: jest.Mock;
      save: jest.Mock;
    };

    beforeEach(() => {
      userRequest = {
        email: 'test@example.com',
        password: 'newPassword123',
        password_confirmation: 'newPassword123',
      };
      userEntity = {
        id: 1,
        email: userRequest.email,
        reset_token: randomUUID,
        password: hash,
        updated_at: new Date(),
      } as User;
      userDto = UserDto.fromEntity(userEntity);
      mockManager = {
        findOneBy: jest.fn().mockResolvedValue(userEntity),
        save: jest.fn().mockResolvedValue(userEntity),
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => await cb(mockManager));
    });

    it('should reset password successfully', async () => {
      const result = await authService.resetPassword(randomUUID, userRequest);
      userDto.updated_at = result.updated_at;

      expect(result).toBeInstanceOf(UserDto);
      expect(result).toEqual(userDto);
      expect(mockManager.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user with reset token does not exist', async () => {
      mockManager.findOneBy.mockResolvedValue(null);

      await expect(
        authService.resetPassword(randomUUID, userRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UserEmailAndTokenMismatchException if email does not match', async () => {
      userEntity.email = 'different@example.com';

      await expect(
        authService.resetPassword(randomUUID, userRequest),
      ).rejects.toThrow(UserEmailAndTokenMismatchException);
    });

    it('should throw UserPasswordMissmatchException if passwords do not match', async () => {
      const resetRequestWithMismatch = {
        ...userRequest,
        password_confirmation: 'differentPassword',
      };

      await expect(
        authService.resetPassword(randomUUID, resetRequestWithMismatch),
      ).rejects.toThrow(UserPasswordMissmatchException);
    });
  });
});
