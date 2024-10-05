import { Response } from '@Types/response.type';

export class ResponseHelper {
  static buildResponse(data: any): Response<any> {
    return {
      data,
    };
  }
}
