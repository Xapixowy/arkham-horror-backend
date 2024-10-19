import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StatisticModifier } from '@Types/Card/statistic-modifier.type';
import { Language } from '@Enums/language';
import { CardTranslation } from '@Entities/card-translation.entity';
import { CardTypeEnum } from '@Enums/Card/card-type.enum';
import { CardSubtypeEnum } from '@Enums/Card/card-subtype.enum';

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
    type: 'varchar',
    length: 64,
  })
  type: CardTypeEnum;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  subtype: CardSubtypeEnum;

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
    type: 'varchar',
    length: 2,
  })
  locale: Language;

  @OneToMany(() => CardTranslation, (cardTranslation) => cardTranslation.card, {
    onDelete: 'CASCADE',
    eager: true,
  })
  translations: CardTranslation[];
}
