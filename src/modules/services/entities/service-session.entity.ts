import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Class } from './service-classes.entity';
import { Booking } from '../../booking/booking.entity';

@Entity('service_sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  from: string; // e.g., '10:00'

  @Column()
  to: string; // e.g., '12:00'

  @ManyToOne(() => Class, (cls) => cls.sessions)
  class: Class;

  @OneToMany(() => Booking, (booking) => booking.session)
  bookings: Booking[];
}
