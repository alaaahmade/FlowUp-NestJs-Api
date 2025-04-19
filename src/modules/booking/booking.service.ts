import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { Repository } from 'typeorm';
import { BookingCreateDto } from './booking.create.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async createBooking(
    userId: number,
    bookingCreateDto: BookingCreateDto,
  ): Promise<Booking> {
    const booking = this.bookingRepository.create({
      user: { id: userId } as any, // Ensure type compatibility
      service: { id: bookingCreateDto.serviceId } as any,
      class: { id: bookingCreateDto.classId } as any,
      session: bookingCreateDto.sessionId
        ? ({ id: bookingCreateDto.sessionId } as any)
        : null,
    });
    return this.bookingRepository.save(booking);
  }

  async findBookingsByUser(userId: string): Promise<Booking[]> {
    return this.bookingRepository.find({ where: { user: { id: userId } } });
  }

  async cancelBooking(bookingId: number): Promise<void> {
    await this.bookingRepository.delete(bookingId);
  }
}
