import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Service } from '../services/entities/service.entity';
import { Class } from '../services/entities/service-classes.entity';
import { Session } from '../services/entities/service-session.entity';
import { MobileUser } from '../mobile-auth/entities/mobile-user.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MobileUser, (user) => user.bookings, { lazy: true })
  @JoinColumn({ name: 'user_id' })
  user: MobileUser;

  @ManyToOne(() => Service, (service) => service.bookings)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => Class, (cls) => cls.bookings)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @ManyToOne(() => Session, (session) => session.bookings)
  @JoinColumn({ name: 'session_id' })
  session: Session;
}
