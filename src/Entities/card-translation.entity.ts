import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Language } from '@Enums/language';
import { Card } from '@Entities/card.entity';

@Entity()
export class CardTranslation {
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

  @ManyToOne(() => Card, (card) => card.translations)
  @JoinColumn({ name: 'card_id' })
  card: Card;
}
