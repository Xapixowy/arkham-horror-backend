import { Language } from '@Enums/language';
import { EnumHelper } from '@Helpers/enum/enum.helper';

export class RequestHelper {
  static getLanguage(
    headers: Record<string, string>,
    defaultLanguage: Language,
  ): Language {
    const headerLanguages = headers['accept-language']?.split(',') ?? [];
    const validHeaderLanguages = headerLanguages.filter((language) =>
      EnumHelper.isEnumContainsValue(Language, language),
    );
    const hasValidHeaderLanguages = validHeaderLanguages.length > 0;

    return hasValidHeaderLanguages
      ? EnumHelper.getEnumByValue(Language, validHeaderLanguages[0])
      : defaultLanguage;
  }

  static extractTokenFromHeaders(
    headers: Record<string, string>,
  ): string | undefined {
    const [type, token] = headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
