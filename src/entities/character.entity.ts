import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Statistics } from '@custom-types/character/statistics.type';
import { Skill } from '@custom-types/character/skill.type';
import { Equipment } from '@custom-types/character/equipment.type';
import { Expansion } from '@enums/expansion.enum';
import { Language } from '@enums/language';
import { CharacterTranslation } from '@entities/character-translation.entity';
import { Card } from '@entities/card.entity';
import { Player } from '@entities/player.entity';

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
    { onDelete: 'CASCADE' },
  )
  translations: CharacterTranslation[];

  @ManyToMany(() => Card, (card) => card.characters)
  @JoinTable({
    joinColumn: {
      name: 'character_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'card_id',
      referencedColumnName: 'id',
    },
  })
  cards: Card[];

  @OneToMany(() => Player, (player) => player.character)
  players: Player[];
}
