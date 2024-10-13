import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '@Enums/User/user-role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  email: string;

  @Column({
    type: 'text',
  })
  password: string;

  @Column({
    type: 'integer',
  })
  role: UserRole;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  reset_token: string;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  verification_token: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  verified_at: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  updated_at: Date;
}
