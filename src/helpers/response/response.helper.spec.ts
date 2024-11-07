import { ResponseHelper } from './response.helper';
import { DataResponse } from '@Types/data-response.type';
import { ExceptionResponse } from '@Types/exception.response';
import { ErrorEnum } from '@Enums/error.enum';
import { HttpStatus } from '@nestjs/common';

describe('ResponseHelper', () => {
  describe('buildResponse', () => {
    it('should build a response with data', () => {
      const data = { key: 'value' };
      const result = ResponseHelper.buildResponse(data);

      const expectedResponse: DataResponse<any> = {
        data,
      };

      expect(result).toEqual(expectedResponse);
    });

    it('should handle null data', () => {
      const result = ResponseHelper.buildResponse(null);

      const expectedResponse: DataResponse<any> = {
        data: null,
      };

      expect(result).toEqual(expectedResponse);
    });

    it('should handle undefined data', () => {
      const result = ResponseHelper.buildResponse(undefined);

      const expectedResponse: DataResponse<any> = {
        data: undefined,
      };

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('buildExceptionResponse', () => {
    it('should build an exception response with an error, status code, and message', () => {
      const error = ErrorEnum.VALIDATION_FAILED;
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = 'An error occurred';

      const result = ResponseHelper.buildExceptionResponse(
        error,
        statusCode,
        message,
      );

      const expectedResponse: ExceptionResponse = {
        error,
        statusCode,
        message,
      };

      expect(result).toEqual(expectedResponse);
    });

    it('should handle an array of messages', () => {
      const error = ErrorEnum.VALIDATION_FAILED;
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = ['Error 1', 'Error 2'];

      const result = ResponseHelper.buildExceptionResponse(
        error,
        statusCode,
        message,
      );

      const expectedResponse: ExceptionResponse = {
        error,
        statusCode,
        message,
      };

      expect(result).toEqual(expectedResponse);
    });

    it('should handle missing message parameter', () => {
      const error = ErrorEnum.VALIDATION_FAILED;
      const statusCode = HttpStatus.BAD_REQUEST;

      const result = ResponseHelper.buildExceptionResponse(error, statusCode);

      const expectedResponse: ExceptionResponse = {
        error,
        statusCode,
        message: undefined,
      };

      expect(result).toEqual(expectedResponse);
    });
  });
});
