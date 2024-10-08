import { Character } from '@Entities/character.entity';
import { Statistics } from '@Types/Character/statistics.type';
import { Skill } from '@Types/Character/skill.type';
import { Equipment } from '@Types/Character/equipment.type';
import { Expansion } from '@Enums/expansion.enum';

export class CharacterDto {
  constructor(
    public id: number,
    public expansion: Expansion,
    public name: string,
    public description: string,
    public profession: string,
    public starting_location: string,
    public image_path: string,
    public sanity: number,
    public endurance: number,
    public concentration: number,
    public statistics: Statistics,
    public skills: Skill[],
    public equipment: Equipment,
    public locale: string,
  ) {}

  static fromEntity(character: Character): CharacterDto {
    return new CharacterDto(
      character.id,
      character.expansion,
      character.name,
      character.description,
      character.profession,
      character.starting_location,
      character.image_path,
      character.sanity,
      character.endurance,
      character.concentration,
      character.statistics,
      character.skills,
      character.equipment,
      character.locale,
    );
  }
}
