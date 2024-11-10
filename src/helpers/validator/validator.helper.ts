export class ValidatorHelper {
  static isGroupDefined = (obj: object, ...keys: string[]): boolean => {
    if (!obj) {
      return false;
    }

    const values = keys.map((key) => obj[key]);

    const hasPartialDefinitions =
      values.some((value) => value !== undefined) &&
      values.some((value) => value === undefined);

    return !hasPartialDefinitions;
  };
}
