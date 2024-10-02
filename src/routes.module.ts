import { Module } from '@nestjs/common';
import { CardModule } from './Modules/card.module';

@Module({
  imports: [CardModule],
})
export class RoutesModule {}
