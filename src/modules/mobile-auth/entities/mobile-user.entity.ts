import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { Interests } from '../../interests/user-interests.entity';
import { Booking } from '../../../modules/booking/booking.entity';
import { Role } from '../../../modules/roles/role.entity';
import { Subscriptions } from '../../Subscriptions/entities/subscriptions.entity';

@Entity('mobile_users')
export class MobileUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  appleId: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @ManyToMany(() => Interests, (interest) => interest.users, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'users_interests',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'interest_id',
      referencedColumnName: 'id',
    },
  })
  interests: Interests[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RefreshToken, (token) => token.user, { onDelete: 'CASCADE' })
  refreshTokens: RefreshToken[];

  @Column({ nullable: true })
  fcmToken: string;

  @OneToMany(() => Booking, (booking) => booking.user, { onDelete: 'CASCADE' })
  bookings: Booking[];

  @ManyToMany(() => Role, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'mobile_user_roles',
    joinColumn: {
      name: 'mobile_user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => Subscriptions, (purchase) => purchase.user)
  subscriptions: Subscriptions[];

  @Column({ default: 0 })
  credits: number;

  @Column({ nullable: true })
  stripeCustomerId: string;
}
