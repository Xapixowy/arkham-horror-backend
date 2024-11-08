import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@Entities/user.entity';
import { Character } from '@Entities/character.entity';
import { Card } from '@Entities/card.entity';
import { PlayerRole } from '@Enums/player/player-role.enum';
import { Equipment } from '@Types/player/equipment.type';
import { Statistics } from '@Types/player/statistics.type';
import { Status } from '@Types/player/status.type';
import { GameSession } from '@Entities/game-session.entity';

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
    nullable: true,
  })
  status?: Status | null;

  @Column({
    type: 'json',
    nullable: true,
  })
  equipment?: Equipment | null;

  @Column({
    type: 'json',
    nullable: true,
  })
  statistics?: Statistics | null;

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

  @ManyToMany(() => Card, (card) => card.players, { nullable: true })
  @JoinTable({
    joinColumn: {
      name: 'player_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'card_id',
      referencedColumnName: 'id',
    },
  })
  cards?: Card[];

  @ManyToOne(() => GameSession, (gameSession) => gameSession.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'game_session_id' })
  game_session: GameSession;
}
