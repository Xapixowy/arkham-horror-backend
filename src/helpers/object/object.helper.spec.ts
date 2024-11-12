import { ObjectHelper } from './object.helper';

describe('ObjectHelper', () => {
  describe('replaceDefinedValues', () => {
    it('should replace defined values in the object', () => {
      const originalObject = {
        name: 'John',
        age: 30,
        address: { city: 'NY', zip: '10001' },
      };
      const valuesToReplace = { age: 31, address: { city: 'LA' } } as Partial<
        typeof originalObject
      >;

      const result = ObjectHelper.replaceDefinedValues(
        originalObject,
        valuesToReplace,
      );

      expect(result).toEqual({
        name: 'John',
        age: 31,
        address: { city: 'LA', zip: '10001' },
      });
    });

    it('should not replace values when undefined is provided', () => {
      const originalObject = { name: 'Alice', age: 25 };
      const valuesToReplace = { name: undefined, age: 26 };

      const result = ObjectHelper.replaceDefinedValues(
        originalObject,
        valuesToReplace,
      );

      expect(result).toEqual({ name: 'Alice', age: 26 });
    });

    it('should handle nested objects recursively', () => {
      const originalObject = {
        user: {
          name: 'Bob',
          contact: {
            phone: '123-456',
            email: 'bob@example.com',
          },
        },
      };
      const valuesToReplace = {
        user: {
          contact: {
            email: 'bob.new@example.com',
          },
        },
      } as Partial<typeof originalObject>;

      const result = ObjectHelper.replaceDefinedValues(
        originalObject,
        valuesToReplace,
      );

      expect(result).toEqual({
        user: {
          name: 'Bob',
          contact: { phone: '123-456', email: 'bob.new@example.com' },
        },
      });
    });

    it('should return the original object if valuesToReplace is empty', () => {
      const originalObject = { name: 'Charlie', age: 40 };
      const valuesToReplace = {};

      const result = ObjectHelper.replaceDefinedValues(
        originalObject,
        valuesToReplace,
      );

      expect(result).toEqual(originalObject);
    });
  });
});
