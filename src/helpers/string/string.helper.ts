export class StringHelper {
  static generateRandomString(
    length: number,
    options?: {
      numbers?: boolean;
      symbols?: boolean;
    },
  ): string {
    let string = '';

    const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*_-+=';

    let characters = alpha;

    if (options?.numbers || options?.numbers === undefined) {
      characters += numbers;
    }
    if (options?.symbols || options?.symbols === undefined) {
      characters += symbols;
    }

    for (let i = 0; i < length; i++) {
      string += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }

    return string;
  }
}
