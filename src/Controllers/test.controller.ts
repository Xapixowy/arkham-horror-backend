import { Controller, Get } from '@nestjs/common';
import { Public } from '@Decorators/public.decorator';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('test')
export class TestController {
  constructor(private mailerService: MailerService) {}

  @Public()
  @Get('mail')
  async test() {
    await this.mailerService.sendMail({
      to: 'xapixowy@gmail.com',
      subject: 'Test',
      template: 'basic',
      context: {
        title: 'Test',
        truncatedContent: 'This is a...',
        header: {
          top: 'https://res.cloudinary.com/dheck1ubc/image/upload/v1544156968/Email/Images/AnnouncementOffset/header-top.png',
          bottom:
            'https://res.cloudinary.com/dheck1ubc/image/upload/v1544156968/Email/Images/AnnouncementOffset/header-bottom.png',
        },
        greeting: 'Hello',
        content: 'This is a test',
        footer: 'Xapixowy',
        button: {
          text: 'Click Here',
          link: 'https://google.com',
        },
      },
    });

    return 'test';
  }
}
