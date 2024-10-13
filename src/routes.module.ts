import { Module } from '@nestjs/common';
import { CardModule } from '@Modules/card.module';
import { CharacterModule } from '@Modules/character.module';
import { AuthModule } from '@Modules/auth.module';
import { UserModule } from '@Modules/user.module';

@Module({
  imports: [CardModule, CharacterModule, AuthModule, UserModule],
})
export class RoutesModule {}
