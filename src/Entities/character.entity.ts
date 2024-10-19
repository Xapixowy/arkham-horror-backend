import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Statistics } from '@Types/Character/statistics.type';
import { Skill } from '@Types/Character/skill.type';
import { Equipment } from '@Types/Character/equipment.type';
import { Expansion } from '@Enums/expansion.enum';
import { Language } from '@Enums/language';
import { CharacterTranslation } from '@Entities/character-translation.entity';

@Entity()
export class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 64,
  })
  expansion: Expansion;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 64,
  })
  profession: string;

  @Column({
    type: 'varchar',
    length: 64,
  })
  starting_location: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  image_path: string;

  @Column({
    type: 'integer',
  })
  sanity: number;

  @Column({
    type: 'integer',
  })
  endurance: number;

  @Column({
    type: 'integer',
  })
  concentration: number;

  @Column({
    type: 'json',
  })
  statistics: Statistics;

  @Column({
    type: 'json',
  })
  skills: Skill[];

  @Column({
    type: 'json',
  })
  equipment: Equipment;

  @Column({
    type: 'varchar',
    length: 2,
  })
  locale: Language;

  @OneToMany(
    () => CharacterTranslation,
    (characterTranslation) => characterTranslation.character,
    { onDelete: 'CASCADE', eager: true },
  )
  translations: CharacterTranslation[];
}
