import { RequestHelper } from './request.helper';
import { Language } from '@Enums/language';
import { EnumHelper } from '@Helpers/enum/enum.helper';

jest.mock('@Helpers/enum/enum.helper', () => ({
  EnumHelper: {
    isEnumContainsValue: jest.fn(),
    getEnumByValue: jest.fn(),
  },
}));

describe('RequestHelper', () => {
  describe('getLanguage', () => {
    const defaultLanguage = Language.ENGLISH;

    it('should return the language from the headers if valid', () => {
      const headers = { 'accept-language': 'es,fr;q=0.9,en' };
      (EnumHelper.isEnumContainsValue as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      (EnumHelper.getEnumByValue as jest.Mock).mockReturnValue(
        Language.ENGLISH,
      );

      const result = RequestHelper.getLanguage(headers, defaultLanguage);

      expect(EnumHelper.isEnumContainsValue).toHaveBeenCalledWith(
        Language,
        'es',
      );
      expect(EnumHelper.isEnumContainsValue).toHaveBeenCalledWith(
        Language,
        'fr;q=0.9',
      );
      expect(EnumHelper.isEnumContainsValue).toHaveBeenCalledWith(
        Language,
        'en',
      );
      expect(result).toBe(Language.ENGLISH);
    });

    it('should return the default language if the header language is invalid', () => {
      const headers = { 'accept-language': 'invalid' };
      (EnumHelper.isEnumContainsValue as jest.Mock).mockReturnValue(false);

      const result = RequestHelper.getLanguage(headers, defaultLanguage);

      expect(EnumHelper.isEnumContainsValue).toHaveBeenCalledWith(
        Language,
        'invalid',
      );
      expect(result).toBe(defaultLanguage);
    });

    it('should return the default language if no language header is present', () => {
      const headers = {};

      const result = RequestHelper.getLanguage(headers, defaultLanguage);

      expect(result).toBe(defaultLanguage);
    });
  });

  describe('extractTokenFromHeaders', () => {
    it('should return the token if authorization header is a valid Bearer token', () => {
      const headers = { authorization: 'Bearer abc123token' };
      const result = RequestHelper.extractTokenFromHeaders(headers);
      expect(result).toBe('abc123token');
    });

    it('should return undefined if authorization header does not start with Bearer', () => {
      const headers = { authorization: 'Basic abc123token' };
      const result = RequestHelper.extractTokenFromHeaders(headers);
      expect(result).toBeUndefined();
    });

    it('should return undefined if authorization header is missing', () => {
      const headers = {};
      const result = RequestHelper.extractTokenFromHeaders(headers);
      expect(result).toBeUndefined();
    });
  });
});
