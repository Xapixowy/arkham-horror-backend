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
import { PlayerRole } from '@Enums/Player/player-role.enum';
import { Equipment } from '@Types/Player/equipment.type';
import { Statistics } from '@Types/Player/statistics.type';
import { Status } from '@Types/Player/status.type';
import { GameSession } from '@Entities/game-session.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

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
  status: Status;

  @Column({
    type: 'json',
    nullable: true,
  })
  equipment: Equipment;

  @Column({
    type: 'json',
    nullable: true,
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
  user?: User;

  @ManyToOne(() => Character, (character) => character.id, { nullable: true })
  @JoinColumn({ name: 'character_id' })
  character?: Character;

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

  @ManyToOne(() => GameSession, (gameSession) => gameSession.id)
  @JoinColumn({ name: 'game_session_id' })
  game_session: GameSession;
}
