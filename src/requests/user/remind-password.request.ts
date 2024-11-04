import { IsEmail } from 'class-validator';

export class RemindPasswordRequest {
  @IsEmail()
  email: string;
}
