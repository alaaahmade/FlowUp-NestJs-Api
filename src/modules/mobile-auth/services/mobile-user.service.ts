import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileUser } from '../entities/mobile-user.entity';

@Injectable()
export class MobileUserService {
  constructor(
    @InjectRepository(MobileUser)
    private readonly mobileUserRepository: Repository<MobileUser>,
  ) {}

  async findAll(): Promise<MobileUser[]> {
    return this.mobileUserRepository.find();
  }

  async findByServiceId(serviceId: number): Promise<MobileUser[]> {
    return this.mobileUserRepository
      .createQueryBuilder('mobileUser')
      .innerJoin('mobileUser.bookings', 'booking', 'booking.service_id = :serviceId', { serviceId })
      .getMany();
  }

  async getCustomersByClass(classIds: number[]): Promise<MobileUser[]> {
    return this.mobileUserRepository
      .createQueryBuilder('mobileUser')
      .innerJoin('mobileUser.bookings', 'booking', 'booking.class_id IN (:...classIds)', { classIds })
      .getMany();
  }
}