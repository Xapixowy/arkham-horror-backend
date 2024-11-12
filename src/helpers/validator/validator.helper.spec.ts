import { ValidatorHelper } from './validator.helper';

describe('ValidatorHelper', () => {
  describe('isGroupDefined', () => {
    it('should return true if all keys are defined', () => {
      const obj = { name: 'Alice', age: 25, city: 'NY' };
      const result = ValidatorHelper.isGroupDefined(obj, 'name', 'age', 'city');
      expect(result).toBe(true);
    });

    it('should return true if all keys are undefined', () => {
      const obj = { name: undefined, age: undefined, city: undefined };
      const result = ValidatorHelper.isGroupDefined(obj, 'name', 'age', 'city');
      expect(result).toBe(true);
    });

    it('should return false if some keys are defined and some are undefined', () => {
      const obj = { name: 'Alice', age: undefined, city: 'NY' };
      const result = ValidatorHelper.isGroupDefined(obj, 'name', 'age', 'city');
      expect(result).toBe(false);
    });

    it('should return false if object is null or undefined', () => {
      const result = ValidatorHelper.isGroupDefined(null, 'name', 'age');
      expect(result).toBe(false);
    });

    it('should return true if no keys are provided', () => {
      const obj = { name: 'Alice', age: 25 };
      const result = ValidatorHelper.isGroupDefined(obj);
      expect(result).toBe(true);
    });
  });
});
