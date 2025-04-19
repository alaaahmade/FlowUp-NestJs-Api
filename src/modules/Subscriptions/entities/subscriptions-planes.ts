import { MobileUser } from '../../../modules/mobile-auth/entities/mobile-user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('plans')
export class Plans {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MobileUser, (user) => user.subscriptions, {
    onDelete: 'CASCADE',
  })
  user: MobileUser;

  @Column({ nullable: true, type: 'varchar' })
  stripeSubscriptionId: string | null;

  @Column({ nullable: true, type: 'varchar' })
  stripePriceId: string | null;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isRecurring: boolean;
  @Column()
  amountJOD: number;

  @Column()
  credits: number;

  @Column({ nullable: true })
  stripeProductId: string;
}
