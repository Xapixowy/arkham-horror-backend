import { Module } from '@nestjs/common';
import { CardController } from '@controllers/card.controller';
import { CardService } from '@services/card.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from '@entities/card.entity';
import { FileUploadHelper } from '@helpers/file-upload.helper';
import { CardTranslationController } from '@controllers/card-translation.controller';
import { CardTranslationService } from '@services/card-translation.service';
import { CardTranslation } from '@entities/card-translation.entity';
import { User } from '@entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card, CardTranslation, User])],
  controllers: [CardController, CardTranslationController],
  providers: [CardService, CardTranslationService, FileUploadHelper],
})
export class CardModule {}
