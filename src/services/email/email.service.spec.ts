import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { User } from '@Entities/user.entity';
import { Language } from '@Enums/language';

jest.mock('@nestjs-modules/mailer');
jest.mock('@nestjs/config');
jest.mock('nestjs-i18n', () => ({
  I18nService: jest.fn().mockImplementation(() => ({
    translate: jest.fn((key: string) => `${key}_translated`),
  })),
}));

describe('EmailService', () => {
  let emailService: EmailService;
  let mailerService: MailerService;
  let configService: ConfigService;
  let i18nService: I18nService;

  beforeEach(() => {
    mailerService = {
      sendMail: jest.fn(),
    } as unknown as MailerService;

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'fileUpload') return { serverUrl: 'http://localhost:3000' };
        if (key === 'app') return { frontend_url: 'http://frontend.com' };
      }),
    } as unknown as ConfigService;

    i18nService = {
      translate: jest.fn((key: string, options?: any) => `${key}_translated`),
    } as unknown as I18nService;

    emailService = new EmailService(mailerService, configService, i18nService);
  });

  describe('sendRegister', () => {
    it('should send a registration email with correct parameters', async () => {
      const user = new User();
      user.email = 'test@example.com';
      user.name = 'John Doe';
      user.verification_token = 'verificationToken';

      const result = await emailService.sendRegister(user, Language.ENGLISH);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: user.email,
        subject: 'email.register_email.subject_translated',
        template: 'basic',
        context: {
          title: 'email.register_email.title_translated',
          header: {
            top: 'http://localhost:3000/public/assets/images/email/banner-top.jpeg',
            bottom:
              'http://localhost:3000/public/assets/images/email/banner-bottom.jpeg',
          },
          button: {
            text: 'email.register_email.button_translated',
            link: 'http://frontend.com/auth/verify/verificationToken',
          },
          greeting: 'email.register_email.greeting_translated',
          content:
            'email.register_email.content_translated<br><br><b>email.register_email.instructions_translated</b>',
          farewell:
            'email.register_email.farewell_translated<br>email.register_email.signature_translated',
          footer: 'email.register_email.footer_translated',
        },
      });
      expect(result).toBe(true);
    });

    it('should return false if sending the registration email fails', async () => {
      (mailerService.sendMail as jest.Mock).mockRejectedValue(
        new Error('Send error'),
      );

      const user = new User();
      user.email = 'test@example.com';
      user.verification_token = 'verificationToken';

      const result = await emailService.sendRegister(user, Language.ENGLISH);

      expect(result).toBe(false);
    });
  });

  describe('sendRemindPassword', () => {
    it('should send a password reminder email with correct parameters', async () => {
      const user = new User();
      user.email = 'test@example.com';
      user.name = 'John Doe';
      user.reset_token = 'resetToken';

      const result = await emailService.sendRemindPassword(
        user,
        Language.ENGLISH,
      );

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: user.email,
        subject: 'email.remind_password_email.subject_translated',
        template: 'basic',
        context: {
          title: 'email.remind_password_email.title_translated',
          header: {
            top: 'http://localhost:3000/public/assets/images/email/banner-top.jpeg',
            bottom:
              'http://localhost:3000/public/assets/images/email/banner-bottom.jpeg',
          },
          button: {
            text: 'email.remind_password_email.button_translated',
            link: 'http://frontend.com/auth/reset-password/resetToken',
          },
          greeting: 'email.remind_password_email.greeting_translated',
          content:
            'email.remind_password_email.content_translated<br><br><b>email.remind_password_email.instructions_translated</b>',
          farewell:
            'email.remind_password_email.farewell_translated<br>email.remind_password_email.signature_translated',
          footer: 'email.remind_password_email.footer_translated',
        },
      });
      expect(result).toBe(true);
    });

    it('should return false if sending the password reminder email fails', async () => {
      (mailerService.sendMail as jest.Mock).mockRejectedValue(
        new Error('Send error'),
      );

      const user = new User();
      user.email = 'test@example.com';
      user.reset_token = 'resetToken';

      const result = await emailService.sendRemindPassword(
        user,
        Language.ENGLISH,
      );

      expect(result).toBe(false);
    });
  });
});
