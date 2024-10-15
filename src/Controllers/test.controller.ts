import { Controller, Get } from '@nestjs/common';
import { Public } from '@Decorators/public.decorator';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { FileUploadConfig } from '../Config/file-upload.config';

@Controller('test')
export class TestController {
  // private readonly receiver: string = 'xapixowy@gmail.com';
  private readonly receiver: string = 'm.rzasa.977@gmail.com';

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Get('test')
  async mailRegister() {
    const serverUrl =
      this.configService.get<FileUploadConfig>('fileUpload').serverUrl;

    await this.mailerService.sendMail({
      to: this.receiver,
      subject: 'Arkham Horror - Account Verification',
      template: 'basic',
      context: {
        title: 'Your Journey into Arkham Awaits - Verify Your Account',
        // header: {
        //   top: `${serverUrl}/public/assets/images/email/banner-top.jpeg`,
        //   bottom: `${serverUrl}/public/assets/images/email/banner-bottom.jpeg`,
        // },
        header: {
          top: `https://i.ibb.co/fDKD0qg/banner-top.jpg`,
          bottom: `https://i.ibb.co/zrRhQ0M/banner-bottom.jpg`,
        },

        button: {
          text: 'Verify Account',
          link: '#',
        },
        greeting: 'Dear Seeker of Forbidden Knowledge,',
        content:
          'In the shadowy streets of Arkham, ancient secrets stir, and you’ve taken your first step into the abyss by registering for an account. But before the veil can be fully lifted, one final rite remains to confirm your presence among us.<br><br><b>Click the button below to complete the verification and unlock the mysteries that await!</b>',
        farewell:
          'May the Elder Gods watch over you... from a distance<br>The Gatekeepers of Arkham',
        footer:
          'If you did not request this, do not be alarmed. The cosmic entities may have whispered in error, and you can safely ignore this message. However, if you wish to delve deeper into the unknown, your journey starts here.',
      },
    });

    return 'test';
  }
}
