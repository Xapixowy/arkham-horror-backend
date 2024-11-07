import { EnumHelper } from './enum.helper';

enum TestEnum {
  ONE = 'one',
  TWO = 'two',
  THREE = 3,
}

describe('EnumHelper', () => {
  describe('getValues', () => {
    it('should return all values of an enum', () => {
      const values = EnumHelper.getValues(TestEnum);
      expect(values).toEqual(['one', 'two', 3]);
    });
  });

  describe('getKeys', () => {
    it('should return all keys of an enum', () => {
      const keys = EnumHelper.getKeys(TestEnum);
      expect(keys).toEqual(['ONE', 'TWO', 'THREE']);
    });
  });

  describe('getValue', () => {
    it('should return the value associated with a given key', () => {
      const value = EnumHelper.getValue(TestEnum, 'ONE');
      expect(value).toBe('one');
    });

    it('should return undefined if the key does not exist', () => {
      const value = EnumHelper.getValue(TestEnum, 'INVALID_KEY');
      expect(value).toBeUndefined();
    });
  });

  describe('getKey', () => {
    it('should return the key associated with a given value', () => {
      const key = EnumHelper.getKey(TestEnum, 'two');
      expect(key).toBe('TWO');
    });

    it('should return undefined if the value does not exist', () => {
      const key = EnumHelper.getKey(TestEnum, 'nonexistent');
      expect(key).toBeUndefined();
    });
  });

  describe('getEnumByValue', () => {
    it('should return the enum value when a matching value is found', () => {
      const enumValue = EnumHelper.getEnumByValue(TestEnum, 'one');
      expect(enumValue).toBe('one');
    });

    it('should return undefined if no matching value is found', () => {
      const enumValue = EnumHelper.getEnumByValue(TestEnum, 'nonexistent');
      expect(enumValue).toBeUndefined();
    });
  });

  describe('isEnumContainsValue', () => {
    it('should return true if the enum contains the number value', () => {
      const containsValue = EnumHelper.isEnumContainsValue(TestEnum, 3);
      expect(containsValue).toBe(true);
    });

    it('should return true if the enum contains the string value', () => {
      const containsValue = EnumHelper.isEnumContainsValue(TestEnum, 'two');
      expect(containsValue).toBe(true);
    });

    it('should return false if the enum does not contain the number value', () => {
      const containsValue = EnumHelper.isEnumContainsValue(TestEnum, 4);
      expect(containsValue).toBe(false);
    });

    it('should return false if the enum does not contain the string value', () => {
      const containsValue = EnumHelper.isEnumContainsValue(TestEnum, 'four');
      expect(containsValue).toBe(false);
    });
  });

  describe('isEnumContainsKey', () => {
    it('should return true if the enum contains the key', () => {
      const containsKey = EnumHelper.isEnumContainsKey(TestEnum, 'THREE');
      expect(containsKey).toBe(true);
    });

    it('should return false if the enum does not contain the key', () => {
      const containsKey = EnumHelper.isEnumContainsKey(TestEnum, 'INVALID_KEY');
      expect(containsKey).toBe(false);
    });
  });
});
