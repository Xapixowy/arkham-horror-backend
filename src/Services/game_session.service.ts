// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Character } from '@Entities/character.entity';
// import { DataSource, Repository } from 'typeorm';
// import { CharacterDto } from '@DTOs/character.dto';
// import { CreateCharacterRequest } from '@Requests/Character/create-character.request';
// import { UpdateCharacterRequest } from '@Requests/Character/update-character.request';
// import { NotFoundException } from '@Exceptions/not-found.exception';
// import { ConfigService } from '@nestjs/config';
// import { AppConfig } from '../Config/app.config';
// import { Language } from '@Enums/language';
// import { GameSession } from '@Entities/game-session.entity';
//
// @Injectable()
// export class GameSessionService {
//   appLanguage: Language;
//
//   constructor(
//     @InjectRepository(GameSession)
//     private characterRepository: Repository<GameSession>,
//     private dataSource: DataSource,
//     private configService: ConfigService,
//   ) {
//     this.appLanguage = this.configService.get<AppConfig>('app').language;
//   }
//
//   async findAll(language?: Language): Promise<CharacterDto[]> {
//     const characters = await this.characterRepository.find();
//     return characters.map((character) =>
//       CharacterDto.fromEntity(
//         language ? this.getTranslatedCharacter(character, language) : character,
//       ),
//     );
//   }
//
//   async findOne(id: number, language?: Language): Promise<CharacterDto> {
//     const existingCharacter = await this.characterRepository.findOneBy({ id });
//     if (!existingCharacter) {
//       throw new NotFoundException();
//     }
//     return CharacterDto.fromEntity(
//       language
//         ? this.getTranslatedCharacter(existingCharacter, language)
//         : existingCharacter,
//     );
//   }
//
//   async add(characterRequest: CreateCharacterRequest): Promise<CharacterDto> {
//     const character = this.characterRepository.create({
//       ...characterRequest,
//       locale: this.appLanguage,
//     });
//     return this.dataSource.transaction(async (manager) =>
//       CharacterDto.fromEntity(await manager.save(character)),
//     );
//   }
//
//   async edit(
//     id: number,
//     characterRequest: UpdateCharacterRequest,
//   ): Promise<CharacterDto> {
//     return await this.dataSource.transaction(async (manager) => {
//       const existingCharacter = await manager.findOneBy(Character, { id });
//       if (!existingCharacter) {
//         throw new NotFoundException();
//       }
//       manager.merge(Character, existingCharacter, {
//         ...characterRequest,
//         updated_at: new Date(),
//       });
//       return CharacterDto.fromEntity(
//         await manager.save(Character, existingCharacter),
//       );
//     });
//   }
//
//   async remove(id: number): Promise<CharacterDto> {
//     return this.dataSource.transaction(async (manager) => {
//       const existingCharacter = await manager.findOneBy(Character, { id });
//       if (!existingCharacter) {
//         throw new NotFoundException();
//       }
//       return CharacterDto.fromEntity(
//         await manager.remove(Character, existingCharacter),
//       );
//     });
//   }
// }
