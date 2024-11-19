import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AttributeModifier } from '@Types/card/attribute-modifier.type';
import { Language } from '@Enums/language';
import { CardTranslation } from '@Entities/card-translation.entity';
import { CardType } from '@Enums/card/card.type';
import { CardSubtype } from '@Enums/card/card.subtype';
import { PlayerCard } from '@Entities/player-card.entity';
import { CharacterCard } from '@Entities/character-card.entity';

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
  attribute_modifiers?: AttributeModifier[] | null;

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
    cascade: true,
    onDelete: 'CASCADE',
  })
  translations?: CardTranslation[];

  @OneToMany(() => CharacterCard, (characterCard) => characterCard.card, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  characterCards?: CharacterCard[];

  @OneToMany(() => PlayerCard, (playerCard) => playerCard.card, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  playerCards?: PlayerCard[];
}
