import { Module } from '@nestjs/common';
import { CardModule } from '@modules/card.module';
import { CharacterModule } from '@modules/character.module';
import { AuthModule } from '@modules/auth.module';
import { TestModule } from '@modules/test.module';
import { GameSessionModule } from '@modules/game-session.module';

@Module({
  imports: [
    CardModule,
    CharacterModule,
    AuthModule,
    GameSessionModule,
    TestModule,
  ],
})
export class RoutesModule {}
