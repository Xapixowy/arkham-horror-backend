import { Module } from '@nestjs/common';
import { CardModule } from '@Modules/card.module';
import { CharacterModule } from '@Modules/character.module';

@Module({
  imports: [CardModule, CharacterModule],
})
export class RoutesModule {}
