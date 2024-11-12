import { RequestHelper } from './request.helper';

jest.mock('@Helpers/enum/enum.helper', () => ({
  EnumHelper: {
    isEnumContainsValue: jest.fn(),
    getEnumByValue: jest.fn(),
  },
}));

describe('RequestHelper', () => {
  describe('extractTokenFromHeaders', () => {
    it('should return the token if authorization header is a valid Bearer token', () => {
      const headers = { authorization: 'Bearer abc123token' };
      const result = RequestHelper.extractTokenFromHeaders(headers);
      expect(result).toBe('abc123token');
    });

    it('should return undefined if authorization header does not start with Bearer', () => {
      const headers = { authorization: 'Basic abc123token' };
      const result = RequestHelper.extractTokenFromHeaders(headers);
      expect(result).toBeUndefined();
    });

    it('should return undefined if authorization header is missing', () => {
      const headers = {};
      const result = RequestHelper.extractTokenFromHeaders(headers);
      expect(result).toBeUndefined();
    });
  });
});
