import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../roles/role.entity';
import { Business } from '../businesses/business.entity';
import { Booking } from '../booking/booking.entity';
import { Service } from '../services/entities/service.entity';
import { IsEmail } from 'class-validator';
import { Interests } from '../interests/user-interests.entity';

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  APPLE = 'apple',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @IsEmail()
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  provider: AuthProvider;

  @Column({ nullable: true })
  socialId: string;

  @Column({ nullable: true })
  picture: string;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @Column({ nullable: true })
  resetToken?: string;

  @Column({ nullable: true, type: 'timestamp' })
  resetTokenExpires?: Date;

  @OneToMany(() => Business, (business) => business.owner)
  businesses: Business[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  fcmToken?: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: '' })
  phoneNumber: string;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => Service, (service) => service.vendor)
  services: Service[];

  @ManyToMany(() => Interests, (interest) => interest.users, {
    eager: true,
  })
  @JoinTable()
  interests: Interests[];
}
