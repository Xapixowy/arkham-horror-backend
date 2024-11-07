import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from '@Entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtUser } from '@Types/user/jwt-user.type';
import { JwtConfig } from '@Configs/jwt.config';
import { UserDto } from '@Dtos/user.dto';
import { UserRole } from '@Enums/user/user-role.enum';

describe('UserService', () => {
  let userService: UserService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'jwt') {
                return { secret: 'test-secret' } as JwtConfig;
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findOne', () => {
    it('should return UserDto if user is found by token', async () => {
      const token = 'test-token';
      const user = { id: 1, email: 'test@example.com' } as User;
      jest.spyOn(userService, 'getUserByToken').mockResolvedValue(user);

      const result = await userService.findOne(token);

      expect(result).toEqual(UserDto.fromEntity(user));
      expect(userService.getUserByToken).toHaveBeenCalledWith(token);
    });

    it('should return null if user is not found by token', async () => {
      const token = 'invalid-token';
      jest.spyOn(userService, 'getUserByToken').mockResolvedValue(null);

      const result = await userService.findOne(token);

      expect(result).toBeNull();
    });
  });

  describe('getUserByToken', () => {
    let jwtPayload: JwtUser;
    let user: User;

    beforeEach(() => {
      jwtPayload = {
        sub: 1,
        email: 'test@example.com',
        username: 'Test User',
        role: UserRole.USER,
      };
      user = { id: 1, email: 'test@example.com' } as User;
    });

    it('should return user if JWT is valid and user is found', async () => {
      const token = 'valid-token';

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(jwtPayload);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await userService.getUserByToken(token);

      expect(result).toEqual(user);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'test-secret',
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: jwtPayload.sub },
      });
    });

    it('should return null if JWT is invalid', async () => {
      const token = 'invalid-token';
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));

      const result = await userService.getUserByToken(token);

      expect(result).toBeNull();
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'test-secret',
      });
    });

    it('should return null if user is not found', async () => {
      const token = 'valid-token';

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(jwtPayload);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await userService.getUserByToken(token);

      expect(result).toBeNull();
    });
  });

  describe('isUserExist', () => {
    let jwtPayload: JwtUser;
    let user: User;

    beforeEach(() => {
      jwtPayload = {
        sub: 1,
        email: 'test@example.com',
        username: 'Test User',
        role: UserRole.USER,
      };
      user = { id: 1, email: 'test@example.com' } as User;
    });

    it('should return true if user exists by id', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await userService.isUserExist({ id: 1 });

      expect(result).toBe(true);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
      });
    });

    it('should return true if user exists by email', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await userService.isUserExist({
        email: 'test@example.com',
      });

      expect(result).toBe(true);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
      });
    });

    it('should return true if user exists by token', async () => {
      const token = 'valid-token';

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(jwtPayload);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await userService.isUserExist({ token });

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'test-secret',
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: jwtPayload.sub },
      });
    });

    it('should return false if user does not exist by id, email, or token', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(null);

      const resultById = await userService.isUserExist({ id: 999 });
      const resultByEmail = await userService.isUserExist({
        email: 'nonexistent@example.com',
      });
      const resultByToken = await userService.isUserExist({
        token: 'invalid-token',
      });

      expect(resultById).toBe(false);
      expect(resultByEmail).toBe(false);
      expect(resultByToken).toBe(false);
    });
  });
});
