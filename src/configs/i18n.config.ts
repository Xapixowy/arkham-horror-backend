import { Language } from '@Enums/language';
import { registerAs } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  QueryResolver,
} from 'nestjs-i18n';

export type I18nConfig = {
  fallbackLanguage: Language;
  loaderOptions: {
    path: string;
    watch: boolean;
  };
};

export const i18nConfig = registerAs(
  'i18n',
  (): I18nConfig => ({
    fallbackLanguage: Language.ENGLISH,
    loaderOptions: {
      path: `${__dirname}/../../../i18n`,
      watch: true,
    },
  }),
);

export const i18nResolvers = [
  { use: QueryResolver, options: ['lang'] },
  AcceptLanguageResolver,
  new HeaderResolver(['x-lang']),
];
