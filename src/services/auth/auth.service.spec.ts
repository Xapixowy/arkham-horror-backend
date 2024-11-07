import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from '@Entities/user.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { UserDto } from '@Dtos/user.dto';
import { RegisterUserRequest } from '@Requests/user/register-user.request';
import { UserPasswordMissmatchException } from '@Exceptions/user/user-password-missmatch.exception';
import { EmailSendFailureException } from '@Exceptions/email-send-failure.exception';
import { UserExistsException } from '@Exceptions/user/user-exists.exception';

describe('AuthService', () => {
  let authService: AuthService;
  let dataSource: DataSource;
  let configService: ConfigService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DataSource, useValue: { transaction: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: EmailService, useValue: { sendRegister: jest.fn() } },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    dataSource = module.get<DataSource>(DataSource);
    configService = module.get<ConfigService>(ConfigService);
    emailService = module.get<EmailService>(EmailService);
  });

  describe('register', () => {
    let userRequest: RegisterUserRequest;

    beforeEach(() => {
      userRequest = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
      };

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(
          async (data: string | Buffer, saltOrRounds: string | number) =>
            'hashedPassword',
        );
    });

    it('should register a user successfully', async () => {
      const mockManager = {
        findOneBy: jest.fn().mockResolvedValue(null),
        save: jest
          .fn()
          .mockResolvedValue({ id: 1, email: userRequest.email } as User),
      };
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb) => await cb(mockManager));
      jest.spyOn(emailService, 'sendRegister').mockResolvedValue(true);
      jest.spyOn(configService, 'get').mockReturnValue({ saltRounds: 10 });

      const result = await authService.register(userRequest);

      expect(result).toBeInstanceOf(UserDto);
      expect(mockManager.save).toHaveBeenCalled();
      expect(emailService.sendRegister).toHaveBeenCalled();
    });

    it('should throw UserPasswordMissmatchException if passwords do not match', async () => {
      await expect(authService.register(userRequest)).rejects.toThrow(
        UserPasswordMissmatchException,
      );
    });

    it('should throw UserExistsException if user already exists', async () => {
      const mockManager = {
        findOneBy: jest.fn().mockResolvedValue(new User()), // User already exists
        save: jest.fn(),
      };
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb) => await cb(mockManager));

      await expect(authService.register(userRequest)).rejects.toThrow(
        UserExistsException,
      );
    });

    it('should throw EmailSendFailureException if email sending fails', async () => {
      const mockManager = {
        findOneBy: jest.fn().mockResolvedValue(null),
        save: jest
          .fn()
          .mockResolvedValue({ id: 1, email: userRequest.email } as User),
      };
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb) => await cb(mockManager));
      jest.spyOn(emailService, 'sendRegister').mockResolvedValue(false);
      jest.spyOn(configService, 'get').mockReturnValue({ saltRounds: 10 });

      await expect(authService.register(userRequest)).rejects.toThrow(
        EmailSendFailureException,
      );
    });
  });
});
