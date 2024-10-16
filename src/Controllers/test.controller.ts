import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '@Decorators/public.decorator';
import { EmailService } from '@Services/email.service';
import { User } from '@Entities/user.entity';

@Controller('test')
export class TestController {
  constructor(private emailService: EmailService) {}

  @Public()
  @Get('test')
  @HttpCode(HttpStatus.NO_CONTENT)
  async mailRegister() {
    const user = new User();
    user.email = 'xapixowy@gmail.com';
    user.name = 'Jakub Chodziński';
    user.verification_token = '123456';
    user.reset_token = '654321';

    await this.emailService.sendRemindPassword(user);
  }
}
