import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Language } from '@Enums/language';
import { Character } from '@Entities/character.entity';

@Entity()
export class CharacterTranslation {
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
  profession: string;

  @Column({
    type: 'varchar',
    length: 64,
  })
  starting_location: string;

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

  @ManyToOne(() => Character, (character) => character.translations)
  @JoinColumn({ name: 'character_id' })
  character: Character;
}
