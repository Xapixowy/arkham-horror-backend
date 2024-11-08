import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { EnumHelper } from '@Helpers/enum/enum.helper';
import { Language } from '@Enums/language';

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const defaultLanguage = this.configService.get<Language>('app.language');
    const headerLanguages = req.headers['accept-language']?.split(',') ?? [];
    const validHeaderLanguages = headerLanguages.filter((language) =>
      EnumHelper.isEnumContainsValue(Language, language),
    );
    const hasValidHeaderLanguages = validHeaderLanguages.length > 0;

    req['language'] = hasValidHeaderLanguages
      ? EnumHelper.getEnumByValue(Language, validHeaderLanguages[0])
      : defaultLanguage;

    next();
  }
}
