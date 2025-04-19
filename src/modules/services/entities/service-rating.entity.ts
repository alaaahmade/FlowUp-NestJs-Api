import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Service } from './service.entity';

@Entity('service_ratings')
export class ServiceRating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Service, (service) => service.ratings)
  service: Service;

  @Column()
  name: string;

  @Column({ type: 'float', default: 0 })
  averageRating: number;

  @Column({ type: 'float', default: 0 })
  reviewCount: number;

  @Column({ type: 'float', default: 0 })
  starCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
