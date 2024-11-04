import {
  IsEmail,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetUserPasswordRequest {
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
