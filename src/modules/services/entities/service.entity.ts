import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ServiceCategory } from './service-category.entity';
import { ServiceReview } from './service-review.entity';
import { ServiceRating } from './service-rating.entity';
import { Availability } from './service-availability.entity';
import { Booking } from '../../booking/booking.entity';
import { User } from '../../users/user.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true, default: 0 })
  hours: number;

  @Column({ nullable: true, default: 0 })
  credits: number;

  @ManyToOne(() => User, (user) => user.services)
  @JoinColumn()
  vendor: User;

  @OneToOne(() => Availability, (availability) => availability.service)
  @JoinColumn()
  availability: Availability;

  @Column('text', { array: true, nullable: true, default: [] })
  images: string[];

  @Column({ default: false })
  publish: boolean;

  @Column({ type: 'float', default: 0 })
  totalRating: number;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => ServiceRating, (rating) => rating.service, {
    cascade: true,
    eager: true,
  })
  ratings: ServiceRating[];

  @OneToMany(() => ServiceReview, (review) => review.service)
  reviews: ServiceReview[];

  @Column({ nullable: true })
  category: string;

  @ManyToOne(() => ServiceCategory, (category) => category.services, {
    onDelete: 'SET NULL', // Automatically set categoryRelation to NULL on delete
  })
  categoryRelation: ServiceCategory;

  @Column({ default: false })
  isFuture: boolean;

  @Column({ type: 'timestamp', nullable: true })
  date: Date;

  @Column({ default: false })
  class: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  type: string;

  @OneToMany(() => Booking, (booking) => booking.service)
  bookings: Booking[];

  @Column({ default: 0 })
  totalReviews: number;
}
