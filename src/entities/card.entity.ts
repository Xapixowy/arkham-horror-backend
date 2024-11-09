import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StatisticModifier } from '@Types/card/statistic-modifier.type';
import { Language } from '@Enums/language';
import { CardTranslation } from '@Entities/card-translation.entity';
import { CardType } from '@Enums/card/card.type';
import { CardSubtype } from '@Enums/card/card.subtype';
import { Character } from '@Entities/character.entity';
import { PlayerCard } from '@Entities/player-card.entity';

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
  subtype?: CardSubtype | null;

  @Column({
    type: 'json',
    nullable: true,
  })
  statistic_modifiers?: StatisticModifier[] | null;

  @Column({
    type: 'integer',
    nullable: true,
  })
  hand_usage?: number | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  front_image_path?: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  back_image_path?: string | null;

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
  translations?: CardTranslation[];

  @ManyToMany(() => Character, (character) => character.cards)
  characters?: Character[];

  @OneToMany(() => PlayerCard, (playerCard) => playerCard.card, {
    cascade: true,
  })
  playerCards?: PlayerCard[];
}
