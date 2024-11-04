import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserRequest {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  @MinLength(8)
  @MaxLength(64)
  password: string;

  @IsStrongPassword()
  @MinLength(8)
  @MaxLength(64)
  password_confirmation: string;
}
