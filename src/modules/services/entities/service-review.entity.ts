import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Service } from './service.entity';
import { MobileUser } from '../../../modules/mobile-auth/entities/mobile-user.entity';

@Entity('service_reviews')
export class ServiceReview {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Service, (service) => service.reviews)
  service: Service;

  @ManyToOne(() => MobileUser)
  user: MobileUser;

  @Column()
  name: string;

  @Column({ type: 'timestamp' })
  postedAt: Date;

  @Column('text')
  comment: string;

  @Column({ default: false })
  isPurchased: boolean;

  @Column({ type: 'float' })
  rating: number;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: 0 })
  helpful: number;

  @Column('text', { array: true, default: [] })
  attachments: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
