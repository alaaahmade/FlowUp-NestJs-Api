import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
import { Permission } from '../permissions/permission.entity';
import { MobileUser } from '../mobile-auth/entities/mobile-user.entity';
import { Booking } from '../booking/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, MobileUser, Booking]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
