import { IsEmail } from 'class-validator';

export class VerifyUserRequest {
  @IsEmail()
  email: string;
}
