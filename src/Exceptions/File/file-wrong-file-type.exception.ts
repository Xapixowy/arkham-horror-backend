import { ErrorEnum } from '@Enums/error.enum';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '@Helpers/response.helper';

export class FileWrongFileTypeException extends HttpException {
  constructor(eligibleMimeTypes: string[]) {
    super(
      ResponseHelper.buildExceptionResponse(
        ErrorEnum.FILE_WRONG_FILE_TYPE,
        HttpStatus.BAD_REQUEST,
        [
          `File must be one of the following types: ${eligibleMimeTypes.join(', ')}`,
        ],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
