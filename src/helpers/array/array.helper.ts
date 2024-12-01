export class ArrayHelper {
  static randomElement<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    return array[Math.floor(Math.random() * array.length)];
  }

  static randomElements<T>(array: T[], count: number): T[] | undefined {
    if (array.length === 0) return undefined;
    const randomElements: T[] = [];
    for (let i = 0; i < count; i++) {
      randomElements.push(ArrayHelper.randomElement(array));
    }
    return randomElements;
  }
}
