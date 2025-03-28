import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Language } from '@Enums/language';
import { Character } from '@Entities/character.entity';
import { Skill } from '@Types/character/skill.type';

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
    type: 'json',
  })
  skills: Skill[];

  @Column({
    type: 'enum',
    enum: Language,
  })
  locale: Language;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => Character, (character) => character.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'character_id' })
  character: Character;
}
