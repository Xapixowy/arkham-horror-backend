import { registerAs } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export type MailerConfig = {
  transport: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  template: {
    dir: string;
    adapter: HandlebarsAdapter;
    options: {
      strict: boolean;
    }
  }
};

export const mailerConfig = registerAs(
  'mailer',
  (): MailerConfig => ({
    transport: {
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    },
    template: {
      dir: `${__dirname}/../../../templates`,
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  }),
);
