import { StringHelper } from './string.helper';

describe('StringHelper', () => {
  describe('generateRandomString', () => {
    it('should generate a string of the specified length', () => {
      const length = 10;
      const result = StringHelper.generateRandomString(length);
      expect(result).toHaveLength(length);
    });

    it('should include numbers by default', () => {
      const length = 100;
      const result = StringHelper.generateRandomString(length);
      const hasNumbers = /[0-9]/.test(result);
      expect(hasNumbers).toBe(true);
    });

    it('should include symbols by default', () => {
      const length = 100;
      const result = StringHelper.generateRandomString(length);
      const hasSymbols = /[!@#$%^&*_\-+=]/.test(result);
      expect(hasSymbols).toBe(true);
    });

    it('should only include letters if options exclude numbers and symbols', () => {
      const length = 100;
      const result = StringHelper.generateRandomString(length, {
        numbers: false,
        symbols: false,
      });
      const hasOnlyLetters = /^[a-zA-Z]+$/.test(result);
      expect(hasOnlyLetters).toBe(true);
    });

    it('should include numbers if options allow them', () => {
      const length = 100;
      const result = StringHelper.generateRandomString(length, {
        numbers: true,
        symbols: false,
      });
      const hasNumbers = /[0-9]/.test(result);
      expect(hasNumbers).toBe(true);
    });

    it('should include symbols if options allow them', () => {
      const length = 100;
      const result = StringHelper.generateRandomString(length, {
        numbers: false,
        symbols: true,
      });
      const hasSymbols = /[!@#$%^&*_\-+=]/.test(result);
      expect(hasSymbols).toBe(true);
    });

    it('should not include numbers if options exclude them', () => {
      const length = 100;
      const result = StringHelper.generateRandomString(length, {
        numbers: false,
      });
      const hasNumbers = /[0-9]/.test(result);
      expect(hasNumbers).toBe(false);
    });

    it('should not include symbols if options exclude them', () => {
      const length = 100;
      const result = StringHelper.generateRandomString(length, {
        symbols: false,
      });
      const hasSymbols = /[!@#$%^&*_\-+=]/.test(result);
      expect(hasSymbols).toBe(false);
    });

    it('should generate different strings on each call', () => {
      const length = 10;
      const result1 = StringHelper.generateRandomString(length);
      const result2 = StringHelper.generateRandomString(length);
      expect(result1).not.toBe(result2);
    });
  });
});
