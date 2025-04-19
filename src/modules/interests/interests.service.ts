import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interests } from './user-interests.entity';
import { MobileUser } from '../mobile-auth/entities/mobile-user.entity';

@Injectable()
export class InterestsService {
  constructor(
    @InjectRepository(Interests)
    private readonly interestsRepository: Repository<Interests>,
    @InjectRepository(MobileUser)
    private readonly mobileUserRepository: Repository<MobileUser>,
  ) {}

  async create(createInterestDto: Partial<Interests>) {
    const interest = this.interestsRepository.create(createInterestDto);
    return await this.interestsRepository.save(interest);
  }

  async findAll() {
    return await this.interestsRepository.find();
  }

  async findOne(id: number) {
    const interest = await this.interestsRepository
      .createQueryBuilder('interest')
      .where('interest.id = :id', { id })
      .getOne();

    if (!interest) {
      throw new NotFoundException('Interest not found');
    }
    return interest;
  }

  async update(id: number, updateInterestDto: Partial<Interests>) {
    const interest = await this.findOne(id);
    Object.assign(interest, updateInterestDto);
    return await this.interestsRepository.save(interest);
  }

  async remove(id: number) {
    const interest = await this.findOne(id);
    return await this.interestsRepository.remove(interest);
  }

  async getUserInterests(userId: string) {
    return await this.mobileUserRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.interests', 'interests')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async addUserInterest(userId: string, interestId: number) {
    const user = await this.mobileUserRepository.findOne({
      where: { id: userId },
      relations: ['interests'],
    });
    if (!user) {
      throw new NotFoundException('Mobile user not found');
    }

    const interest = await this.findOne(interestId);
    if (!user.interests) {
      user.interests = [];
    }
    
    // Check if interest already exists
    if (!user.interests.find(i => i.id === interest.id)) {
      user.interests.push(interest);
      await this.mobileUserRepository.save(user);
      
      // Update the interest's users array to maintain bidirectional relationship
      if (!interest.users) {
        interest.users = [];
      }
      interest.users.push(user);
      await this.interestsRepository.save(interest);
    }
    
    return user;
  }

  async removeUserInterest(userId: string, interestId: number) {
    const user = await this.mobileUserRepository.findOne({
      where: { id: userId },
      relations: ['interests'],
    });
    if (!user) {
      throw new NotFoundException('Mobile user not found');
    }

    const interest = await this.findOne(interestId);

    // Remove interest from user's interests
    user.interests = user.interests.filter(i => i.id !== interestId);
    await this.mobileUserRepository.save(user);

    // Remove user from interest's users to maintain bidirectional relationship
    if (interest.users) {
      interest.users = interest.users.filter(u => u.id !== userId);
      await this.interestsRepository.save(interest);
    }

    return user;
  }
}
