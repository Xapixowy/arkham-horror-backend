import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { FileUploadConfig } from '../Config/file-upload.config';
import { AppConfig } from '../Config/app.config';
import { User } from '@Entities/user.entity';

@Injectable()
export class EmailService {
  private readonly serverUrl: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private configService: ConfigService,
  ) {
    this.serverUrl =
      this.configService.get<FileUploadConfig>('fileUpload').serverUrl;
    this.frontendUrl = this.configService.get<AppConfig>('app').frontend_url;
  }

  async sendRegister(user: User): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Arkham Horror - Account Verification',
        template: 'basic',
        context: {
          title: 'Your Journey into Arkham Awaits - Verify Your Account',
          header: {
            // top: `${this.serverUrl}/public/assets/images/email/banner-top.jpeg`,
            // bottom: `${this.serverUrl}/public/assets/images/email/banner-bottom.jpeg`,
            top: `https://i.ibb.co/fDKD0qg/banner-top.jpg`,
            bottom: `https://i.ibb.co/zrRhQ0M/banner-bottom.jpg`,
          },
          button: {
            text: 'Verify Account',
            link: `${this.frontendUrl}/auth/verify/${user.verification_token}`,
          },
          greeting: `Dear ${user.name},`,
          content:
            'In the shadowy streets of Arkham, ancient secrets stir, and you’ve taken your first step into the abyss by registering for an account. But before the veil can be fully lifted, one final rite remains to confirm your presence among us.<br><br><b>Click the button below to complete the verification and unlock the mysteries that await!</b>',
          farewell:
            'May the Elder Gods watch over you... from a distance<br>The Gatekeepers of Arkham',
          footer:
            'If you did not request this, do not be alarmed. The cosmic entities may have whispered in error, and you can safely ignore this message. However, if you wish to delve deeper into the unknown, your journey starts here.',
        },
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  async sendRemindPassword(user: User): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Arkham Horror - Reset your password',
        template: 'basic',
        context: {
          title: 'Beware! A Password Reset Has Been Requested',
          header: {
            // top: `${this.serverUrl}/public/assets/images/email/banner-top.jpeg`,
            // bottom: `${this.serverUrl}/public/assets/images/email/banner-bottom.jpeg`,
            top: `https://i.ibb.co/fDKD0qg/banner-top.jpg`,
            bottom: `https://i.ibb.co/zrRhQ0M/banner-bottom.jpg`,
          },
          button: {
            text: 'Reset Password',
            link: `${this.frontendUrl}/auth/reset-password/${user.verification_token}`,
          },
          greeting: `Dear ${user.name},`,
          content:
            'The cryptic forces have spoken, and someone has sought to change the key to your Arkham account.<br><br><b>If it was you, click the link below to reset your password before the ancient texts are lost!</b>',
          farewell:
            'Beware of the lurking terrors, but know that we stand vigilant beside you<br>The Gatekeepers of Arkham',
          footer:
            'If this was not your doing, pay no heed to this summoning. Simply ignore this message, and no action will be taken—though the shadows may linger, they will not intrude.',
        },
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}
