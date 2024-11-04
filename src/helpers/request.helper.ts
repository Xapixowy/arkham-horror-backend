import { Language } from '@enums/language';
import { EnumHelper } from '@helpers/enum.helper';

export class RequestHelper {
  static getLanguage(
    headers: Record<string, string>,
    defaultLanguage: Language,
  ): Language {
    const headerLanguage = headers['accept-language']?.split(',')[0];
    const isLanguageHeaderValid = EnumHelper.isEnumContainsValue(
      Language,
      headerLanguage,
    );

    return isLanguageHeaderValid
      ? EnumHelper.getEnumByValue(Language, headerLanguage)
      : defaultLanguage;
  }

  static extractTokenFromHeaders(
    headers: Record<string, string>,
  ): string | undefined {
    const [type, token] = headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
