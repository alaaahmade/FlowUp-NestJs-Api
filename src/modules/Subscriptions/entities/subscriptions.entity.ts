import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MobileUser } from '../../mobile-auth/entities/mobile-user.entity';

@Entity('subscriptions')
export class Subscriptions {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MobileUser, (user) => user.subscriptions, {
    onDelete: 'CASCADE',
  })
  user: MobileUser;

  @Column('decimal', { precision: 10, scale: 2 })
  amountJOD: number;

  @Column('int')
  credits: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'paid' | 'failed' | 'canceled' | 'refunded';

  @Column({ nullable: true })
  stripeSessionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ nullable: true })
  currentPeriodEnd: Date;
}
