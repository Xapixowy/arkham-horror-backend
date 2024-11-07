import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { FileUploadConfig } from '@Configs/file-upload.config';
import { AppConfig } from '@Configs/app.config';
import { User } from '@Entities/user.entity';
import { I18nService } from 'nestjs-i18n';
import { Language } from '@Enums/language';

@Injectable()
export class EmailService {
  private readonly serverUrl: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly i18nService: I18nService,
  ) {
    this.serverUrl =
      this.configService.get<FileUploadConfig>('fileUpload').serverUrl;
    this.frontendUrl = this.configService.get<AppConfig>('app').frontend_url;
  }

  async sendRegister(
    user: User,
    lang: Language = Language.ENGLISH,
  ): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: this.i18nService.translate('email.register_email.subject', {
          lang,
        }),
        template: 'basic',
        context: {
          title: this.i18nService.translate('email.register_email.title', {
            lang,
          }),
          header: {
            top: `${this.serverUrl}/public/assets/images/email/banner-top.jpeg`,
            bottom: `${this.serverUrl}/public/assets/images/email/banner-bottom.jpeg`,
          },
          button: {
            text: this.i18nService.translate('email.register_email.button', {
              lang,
            }),
            link: `${this.frontendUrl}/auth/verify/${user.verification_token}`,
          },
          greeting: this.i18nService.translate(
            'email.register_email.greeting',
            {
              lang,
              args: { name: user.name },
            },
          ),
          content: `${this.i18nService.translate('email.register_email.content', { lang })}<br><br><b>${this.i18nService.translate('email.register_email.instructions', { lang })}</b>`,
          farewell: `${this.i18nService.translate('email.register_email.farewell', { lang })}<br>${this.i18nService.translate('email.register_email.signature', { lang })}`,
          footer: this.i18nService.translate('email.register_email.footer', {
            lang,
          }),
        },
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  async sendRemindPassword(
    user: User,
    lang: Language = Language.ENGLISH,
  ): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: this.i18nService.translate(
          'email.remind_password_email.subject',
          {
            lang,
          },
        ),
        template: 'basic',
        context: {
          title: this.i18nService.translate(
            'email.remind_password_email.title',
            {
              lang,
            },
          ),
          header: {
            top: `${this.serverUrl}/public/assets/images/email/banner-top.jpeg`,
            bottom: `${this.serverUrl}/public/assets/images/email/banner-bottom.jpeg`,
          },
          button: {
            text: this.i18nService.translate(
              'email.remind_password_email.button',
              {
                lang,
              },
            ),
            link: `${this.frontendUrl}/auth/reset-password/${user.reset_token}`,
          },
          greeting: this.i18nService.translate(
            'email.remind_password_email.greeting',
            {
              lang,
              args: { name: user.name },
            },
          ),
          content: `${this.i18nService.translate('email.remind_password_email.content', { lang })}<br><br><b>${this.i18nService.translate('email.remind_password_email.instructions', { lang })}</b>`,
          farewell: `${this.i18nService.translate('email.remind_password_email.farewell', { lang })}<br>${this.i18nService.translate('email.remind_password_email.signature', { lang })}`,
          footer: this.i18nService.translate(
            'email.remind_password_email.footer',
            {
              lang,
            },
          ),
        },
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}
