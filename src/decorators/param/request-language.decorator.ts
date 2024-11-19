import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Language } from '@Enums/language';

export const RequestLanguage = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Language => {
    const request = ctx.switchToHttp().getRequest();

    return request.language;
  },
);
