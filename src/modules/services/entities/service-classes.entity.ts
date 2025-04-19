import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Availability } from './service-availability.entity';
import { Session } from './service-session.entity';
import { Booking } from '../../booking/booking.entity';

@Entity('service_classes')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  day: string; // 'Mon', 'Tue', etc.

  @ManyToOne(() => Availability, (availability) => availability.classes)
  availability: Availability;

  @OneToMany(() => Session, (session) => session.class, { cascade: true })
  sessions: Session[];

  @OneToMany(() => Booking, (booking) => booking.session)
  bookings: Booking[];
}
