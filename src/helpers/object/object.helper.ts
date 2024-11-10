export class ObjectHelper {
  static replaceDefinedValues<T>(object: T, valuesToReplace: Partial<T>): T {
    for (const key of Object.keys(valuesToReplace)) {
      const value = valuesToReplace[key];

      if (value === undefined) {
        continue;
      }

      if (typeof value === 'object') {
        this.replaceDefinedValues(object[key], value);
      } else {
        object[key] = value;
      }
    }

    return object;
  }
}
