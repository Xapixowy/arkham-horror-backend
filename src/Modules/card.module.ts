import { Module } from '@nestjs/common';
import { CardController } from '@Controllers/card.controller';
import { CardService } from '@Services/card.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from '@Entities/card.entity';
import { FileUploadHelper } from '@Helpers/file-upload.helper';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@Guards/auth.guard';
import { RolesGuard } from '@Guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Card])],
  controllers: [CardController],
  providers: [
    CardService,
    FileUploadHelper,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class CardModule {}
