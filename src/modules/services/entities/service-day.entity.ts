import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Availability } from './service-availability.entity';

@Entity('service_day')
export class Day {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  day: string; // 'Mon', 'Tue', etc.

  @Column()
  value: string; // Same as day

  @Column()
  from: string; // e.g., '10:00'

  @Column()
  to: string; // e.g., '12:00'

  @ManyToOne(() => Availability, (availability) => availability.days, {
    onDelete: 'CASCADE',
  })
  availability: Availability;
}
