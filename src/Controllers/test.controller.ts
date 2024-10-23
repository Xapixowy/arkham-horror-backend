import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '@Decorators/public.decorator';

@Controller('test')
export class TestController {
  constructor() {}

  @Public()
  @Get('test')
  @HttpCode(HttpStatus.NO_CONTENT)
  async test() {}
}
