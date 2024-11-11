import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from '@Entities/player.entity';
import { GameSessionPhase } from '@Enums/game-session/game-session-phase.enum';

@Entity()
export class GameSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 64,
  })
  token: string;

  @Column({
    type: 'enum',
    enum: GameSessionPhase,
    default: GameSessionPhase.MYTHOS,
  })
  phase: GameSessionPhase;

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

  @OneToMany(() => Player, (player) => player.game_session, {
    onDelete: 'CASCADE',
  })
  players: Player[];
}
