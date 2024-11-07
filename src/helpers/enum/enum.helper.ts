export class EnumHelper {
  static getValues<T extends object>(enumObject: T): (string | number)[] {
    return Object.values(enumObject).filter(
      (value) =>
        typeof value !== 'string' || !Object.keys(enumObject).includes(value),
    );
  }

  static getKeys<T extends object>(enumObject: T): string[] {
    return Object.keys(enumObject).filter((key) => isNaN(Number(key)));
  }

  static getValue<T extends object>(
    enumObject: T,
    key: string,
  ): string | number {
    return enumObject[key as keyof T] as string | number;
  }

  static getKey<T extends object>(
    enumObject: T,
    value: string | number,
  ): string | undefined {
    return Object.keys(enumObject).find(
      (key) => enumObject[key as keyof T] === value,
    );
  }

  static getEnumByValue<T extends object>(
    enumObject: T,
    value: string | number,
  ): T[keyof T] | undefined {
    const key = this.getKey(enumObject, value);
    return key ? enumObject[key as keyof T] : undefined;
  }

  static isEnumContainsValue<T extends object>(
    enumObject: T,
    value: string | number,
  ): boolean {
    console.warn(this.getValues(enumObject));
    return this.getValues(enumObject).includes(value);
  }

  static isEnumContainsKey<T extends object>(
    enumObject: T,
    key: string,
  ): boolean {
    return this.getKeys(enumObject).includes(key);
  }
}
