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
import { Statistics } from '@Types/player/statistics.type';
import { Status } from '@Types/player/status.type';
import { GameSession } from '@Entities/game-session.entity';
import { PlayerCard } from '@Entities/player-card.entity';

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
