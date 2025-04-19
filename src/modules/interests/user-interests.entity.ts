import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { MobileUser } from '../mobile-auth/entities/mobile-user.entity';

@Entity('interests')
export class Interests {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => MobileUser, (mobileUser) => mobileUser.interests, {
    onDelete: 'CASCADE'
  })
  users: MobileUser[];
}
