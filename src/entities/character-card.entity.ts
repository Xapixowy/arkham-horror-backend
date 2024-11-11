import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Card } from '@Entities/card.entity';
import { Character } from '@Entities/character.entity';

@Entity()
export class CharacterCard {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Character, (player) => player.characterCards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @ManyToOne(() => Card, (card) => card.characterCards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
