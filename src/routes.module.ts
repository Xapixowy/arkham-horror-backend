import { Module } from '@nestjs/common';
import { CardModule } from '@Modules/card.module';
import { CharacterModule } from '@Modules/character.module';
import { AuthModule } from '@Modules/auth.module';
import { TestModule } from '@Modules/test.module';
import { GameSessionModule } from '@Modules/game-session.module';
import { UserModule } from '@Modules/user.module';

@Module({
  imports: [
    CardModule,
    CharacterModule,
    AuthModule,
    GameSessionModule,
    TestModule,
    UserModule,
  ],
  exports: [
    CardModule,
    CharacterModule,
    AuthModule,
    GameSessionModule,
    TestModule,
    UserModule,
  ],
})
export class RoutesModule {}
