import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Day } from './service-day.entity';
import { Class } from './service-classes.entity';
import { Service } from './service.entity';

@Entity('service_availability')
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  // A list of days (each with a single from/to time)
  @OneToMany(() => Day, (day) => day.availability, { cascade: true })
  days: Day[];

  // A list of classes (each with multiple sessions)
  @OneToMany(() => Class, (cls) => cls.availability, { cascade: true })
  classes: Class[];

  @OneToOne(() => Service, (service) => service.availability)
  @JoinColumn()
  service: Service;
}
