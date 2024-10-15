import { Module } from '@nestjs/common';
import { TestController } from '@Controllers/test.controller';

@Module({
  controllers: [TestController],
})
export class TestModule {}
