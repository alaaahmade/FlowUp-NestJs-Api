import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { BusinessType } from '../business-types/business-type.entity';

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ name: 'contact_email' })
  contactEmail: string;

  @Column({ name: 'contact_number' })
  contactNumber: string;

  @ManyToOne(() => BusinessType)
  businessType: BusinessType;

  @ManyToOne(() => User, (user) => user.businesses)
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
