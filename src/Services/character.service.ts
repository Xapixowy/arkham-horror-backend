import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Character } from '@Entities/character.entity';
import { DataSource, Repository } from 'typeorm';
import { CharacterDto } from '@DTOs/character.dto';
import { CreateCharacterRequest } from '@Requests/Character/create-character.request';
import { UpdateCharacterRequest } from '@Requests/Character/update-character.request';

@Injectable()
export class CharacterService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<CharacterDto[]> {
    const characters = await this.characterRepository.find();
    return characters.map((character) => CharacterDto.fromEntity(character));
  }

  async findOne(id: number): Promise<CharacterDto> {
    const existingCharacter = await this.characterRepository.findOneBy({ id });
    if (!existingCharacter) {
      throw new NotFoundException();
    }
    return CharacterDto.fromEntity(existingCharacter);
  }

  async add(characterRequest: CreateCharacterRequest): Promise<CharacterDto> {
    const character = this.characterRepository.create(characterRequest);
    return this.dataSource.transaction(async (manager) =>
      CharacterDto.fromEntity(await manager.save(character)),
    );
  }

  async edit(
    id: number,
    characterRequest: UpdateCharacterRequest,
  ): Promise<CharacterDto> {
    return await this.dataSource.transaction(async (manager) => {
      const existingCharacter = await manager.findOneBy(Character, { id });
      if (!existingCharacter) {
        throw new NotFoundException();
      }
      manager.merge(Character, existingCharacter, characterRequest);
      return CharacterDto.fromEntity(
        await manager.save(Character, existingCharacter),
      );
    });
  }

  async remove(id: number): Promise<CharacterDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingCharacter = await manager.findOneBy(Character, { id });
      if (!existingCharacter) {
        throw new NotFoundException();
      }
      return CharacterDto.fromEntity(
        await manager.remove(Character, existingCharacter),
      );
    });
  }
}
