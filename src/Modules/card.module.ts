import { Module } from '@nestjs/common';
import { CardController } from '@Controllers/card.controller';
import { CardService } from '@Services/card.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from '@Entities/card.entity';
import { FileUploadHelper } from '@Helpers/file-upload.helper';
import { CardTranslationController } from '@Controllers/card-translation.controller';
import { CardTranslationService } from '@Services/card-translation.service';
import { CardTranslation } from '@Entities/card-translation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card, CardTranslation])],
  controllers: [CardController, CardTranslationController],
  providers: [CardService, CardTranslationService, FileUploadHelper],
})
export class CardModule {}
