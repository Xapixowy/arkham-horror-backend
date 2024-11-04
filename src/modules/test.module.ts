import { Module } from '@nestjs/common';
import { TestController } from '@controllers/test.controller';
import { EmailService } from '@services/email.service';

@Module({
  providers: [EmailService],
  controllers: [TestController],
})
export class TestModule {}
