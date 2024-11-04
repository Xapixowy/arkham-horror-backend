import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StatisticModifier } from '@custom-types/card/statistic-modifier.type';
import { Language } from '@enums/language';
import { CardTranslation } from '@entities/card-translation.entity';
import { CardType } from '@enums/card/card.type';
import { CardSubtype } from '@enums/card/card.subtype';
import { Player } from '@entities/player.entity';
import { Character } from '@entities/character.entity';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

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
    type: 'enum',
    enum: CardType,
  })
  type: CardType;

  @Column({
    type: 'enum',
    enum: CardSubtype,
    nullable: true,
  })
  subtype: CardSubtype;

  @Column({
    type: 'json',
    nullable: true,
  })
  statistic_modifiers: StatisticModifier[];

  @Column({
    type: 'integer',
    nullable: true,
  })
  hand_usage: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  front_image_path: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  back_image_path: string;

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

  @OneToMany(() => CardTranslation, (cardTranslation) => cardTranslation.card, {
    onDelete: 'CASCADE',
  })
  translations: CardTranslation[];

  @ManyToMany(() => Character, (character) => character.cards)
  characters: Character[];

  @ManyToMany(() => Player, (player) => player.cards)
  players: Player[];
}
