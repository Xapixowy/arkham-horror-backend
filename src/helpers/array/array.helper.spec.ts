import { ArrayHelper } from './array.helper';

describe('ArrayHelper', () => {
  describe('randomElement', () => {
    it('should return an element from the array', () => {
      const array = [1, 2, 3, 4, 5];
      const result = ArrayHelper.randomElement(array);
      expect(array).toContain(result);
    });

    it('should return undefined for an empty array', () => {
      const emptyArray: number[] = [];
      const result = ArrayHelper.randomElement(emptyArray);
      expect(result).toBeUndefined();
    });

    it('should return different elements on multiple calls', () => {
      const array = [1, 2, 3, 4, 5];
      const results = new Set();

      for (let i = 0; i < 10; i++) {
        results.add(ArrayHelper.randomElement(array));
      }

      expect(results.size).toBeGreaterThan(1);
    });
  });
});
