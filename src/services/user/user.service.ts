import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@Entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtUser } from '@Types/user/jwt-user.type';
import { JwtConfig } from '@Configs/jwt.config';
import { UserDto } from '@Dtos/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async findOne(token: string): Promise<UserDto | null> {
    const user = await this.getUserByToken(token);

    if (!user) {
      return null;
    }

    return UserDto.fromEntity(user);
  }

  async getUserByToken(token: string): Promise<User | null> {
    const userJwt = await this.extractUserJwt(token);

    if (!userJwt) {
      return null;
    }

    return await this.userRepository.findOne({
      where: { id: userJwt.sub },
    });
  }

  async isUserExist(user: {
    id?: number;
    email?: string;
    token?: string;
  }): Promise<boolean> {
    let existingUser: User | undefined;

    if (user.id) {
      existingUser = await this.userRepository.findOne({
        where: { id: user.id },
      });
    }

    if (user.email) {
      existingUser = await this.userRepository.findOne({
        where: { email: user.email },
      });
    }

    if (user.token) {
      const userJwt = await this.extractUserJwt(user.token);

      if (userJwt) {
        existingUser = await this.userRepository.findOne({
          where: { id: userJwt.sub },
        });
      }
    }

    return !!existingUser;
  }

  private async extractUserJwt(token: string): Promise<JwtUser | null> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<JwtConfig>('jwt').secret,
      });
    } catch {
      return null;
    }
  }
}
