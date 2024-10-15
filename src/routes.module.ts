import { Module } from '@nestjs/common';
import { CardModule } from '@Modules/card.module';
import { CharacterModule } from '@Modules/character.module';
import { AuthModule } from '@Modules/auth.module';
import { UserModule } from '@Modules/user.module';
import { TestModule } from '@Modules/test.module';

@Module({
  imports: [CardModule, CharacterModule, AuthModule, UserModule, TestModule],
})
export class RoutesModule {}
