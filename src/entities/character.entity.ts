import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Attributes } from '@Types/character/attributes.type';
import { Skill } from '@Types/character/skill.type';
import { Equipment } from '@Types/character/equipment.type';
import { Expansion } from '@Enums/expansion.enum';
import { Language } from '@Enums/language';
import { CharacterTranslation } from '@Entities/character-translation.entity';
import { Player } from '@Entities/player.entity';
import { CharacterCard } from '@Entities/character-card.entity';

@Entity()
export class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: Expansion,
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
  image_path?: string | null;

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
  attributes: Attributes;

  @Column({
    type: 'json',
  })
  skills: Skill[];

  @Column({
    type: 'json',
  })
  equipment: Equipment;

  @Column({
    type: 'enum',
    enum: Language,
  })
  locale: Language;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @OneToMany(
    () => CharacterTranslation,
    (characterTranslation) => characterTranslation.character,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  translations?: CharacterTranslation[];

  @OneToMany(() => CharacterCard, (characterCard) => characterCard.character, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  characterCards?: CharacterCard[];

  @OneToMany(() => Player, (player) => player.character)
  players?: Player[];
}
