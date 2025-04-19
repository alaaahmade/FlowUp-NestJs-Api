import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './business.entity';
import { BusinessType } from '../business-types/business-type.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { User } from '../users/user.entity';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(BusinessType)
    private businessTypeRepository: Repository<BusinessType>,
  ) {}

  async create(
    createBusinessDto: CreateBusinessDto,
    owner: User,
  ): Promise<Business> {
    const businessType = await this.businessTypeRepository.findOne({
      where: { id: createBusinessDto.typeId },
    });

    if (!businessType) {
      throw new NotFoundException('Business type not found');
    }

    const business = this.businessRepository.create({
      ...createBusinessDto,
      owner,
      businessType: businessType,
    });

    return this.businessRepository.save(business);
  }

  async findAllByUser(userId: number): Promise<Business[]> {
    return this.businessRepository.find({
      where: { owner: { id: userId } },
      relations: ['businessType', 'owner'],
      select: {
        id: true,
        name: true,
        address: true,
        contactEmail: true,
        contactNumber: true,
        createdAt: true,
        updatedAt: true,
        businessType: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
        owner: {
          id: true,
          email: true,
          fullName: true,
        },
      },
    });
  }

  async findOne(id: number, userId: number): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id, owner: { id: userId } },
      relations: ['businessType', 'owner'],
      select: {
        id: true,
        name: true,
        address: true,
        contactEmail: true,
        contactNumber: true,
        createdAt: true,
        updatedAt: true,
        businessType: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
        owner: {
          id: true,
          email: true,
          fullName: true,
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async update(
    id: number,
    userId: number,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<Business> {
    const business = await this.findOne(id, userId);

    if (updateBusinessDto.typeId) {
      const businessType = await this.businessTypeRepository.findOne({
        where: { id: updateBusinessDto.typeId },
      });
      if (!businessType) {
        throw new NotFoundException('Business type not found');
      }
      business.businessType = businessType;
    }

    Object.assign(business, updateBusinessDto);
    return this.businessRepository.save(business);
  }

  async remove(id: number, userId: number): Promise<void> {
    const business = await this.findOne(id, userId);
    await this.businessRepository.remove(business);
  }
}
