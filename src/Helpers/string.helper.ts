export class StringHelper {
  static generateRandomString(length: number): string {
    let string = '';

    const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*_-+=';

    const characters = `${alpha}${numbers}${symbols}`;

    for (let i = 0; i < length; i++) {
      string += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }

    return string;
  }
}
