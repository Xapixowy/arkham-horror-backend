export class RequestHelper {
  static extractTokenFromHeaders(
    headers: Record<string, string>,
  ): string | undefined {
    const [type, token] = headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
