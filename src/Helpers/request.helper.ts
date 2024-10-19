import { Language } from '@Enums/language';
import { EnumHelper } from '@Helpers/enum.helper';

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
}
