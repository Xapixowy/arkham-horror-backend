import { Module } from '@nestjs/common';
import { TestController } from '@Controllers/test.controller';
import { EmailService } from '@Services/email.service';

@Module({
  providers: [EmailService],
  controllers: [TestController],
})
export class TestModule {}
