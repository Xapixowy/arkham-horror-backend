import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@Entities/user.entity';
import { Character } from '@Entities/character.entity';
import { PlayerRole } from '@Enums/player/player-role.enum';
import { Equipment } from '@Types/player/equipment.type';
import { Attributes } from '@Types/player/attributes.type';
import { Status } from '@Types/player/status.type';
import { GameSession } from '@Entities/game-session.entity';
import { PlayerCard } from '@Entities/player-card.entity';
import { Statistics } from '@Types/player/statistics.type';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'uuid',
    unique: true,
  })
  token: string;

  @Column({
    type: 'enum',
    enum: PlayerRole,
    default: PlayerRole.PLAYER,
  })
  role: PlayerRole;

  @Column({
    type: 'json',
  })
  status: Status;

  @Column({
    type: 'json',
  })
  equipment: Equipment;

  @Column({
    type: 'json',
  })
  attributes: Attributes;

  @Column({
    type: 'json',
    default: {
      money_acquired: 0,
      money_lost: 0,
      clues_acquired: 0,
      clues_lost: 0,
      endurance_acquired: 0,
      endurance_lost: 0,
      sanity_acquired: 0,
      sanity_lost: 0,
      cards_acquired: 0,
      cards_lost: 0,
      phases_played: 0,
      characters_played: 0,
    },
  })
  statistics: Statistics;

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

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  @ManyToOne(() => Character, (character) => character.id, { nullable: true })
  @JoinColumn({ name: 'character_id' })
  character?: Character | null;

  @OneToMany(() => PlayerCard, (playerCard) => playerCard.player, {
    cascade: true,
  })
  playerCards?: PlayerCard[];

  @ManyToOne(() => GameSession, (gameSession) => gameSession.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'game_session_id' })
  game_session: GameSession;
}
