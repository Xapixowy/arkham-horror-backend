import { Module } from '@nestjs/common';
import { CardController } from '@Controllers/card.controller';
import { CardService } from '@Services/card.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from '@Entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card])],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
