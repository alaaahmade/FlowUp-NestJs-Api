import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessType } from './business-type.entity';
import { CreateBusinessTypeDto } from './dto/create-business-type.dto';
import { UpdateBusinessTypeDto } from './dto/update-business-type.dto';

@Injectable()
export class BusinessTypeService {
  constructor(
    @InjectRepository(BusinessType)
    private businessTypeRepository: Repository<BusinessType>,
  ) {}

  async findAll(): Promise<BusinessType[]> {
    return this.businessTypeRepository.find();
  }

  async findOne(id: number): Promise<BusinessType> {
    const businessType = await this.businessTypeRepository.findOne({
      where: { id },
      relations: ['businesses'],
    });

    if (!businessType) {
      throw new NotFoundException('Business type not found');
    }

    return businessType;
  }

  async create(createDto: CreateBusinessTypeDto): Promise<BusinessType> {
    const businessType = this.businessTypeRepository.create(createDto);
    return this.businessTypeRepository.save(businessType);
  }

  async update(
    id: number,
    updateDto: UpdateBusinessTypeDto,
  ): Promise<BusinessType> {
    const businessType = await this.findOne(id);
    const updatedType = Object.assign(
      {},
      businessType,
      updateDto,
    ) as BusinessType;
    return this.businessTypeRepository.save(updatedType);
  }

  async remove(id: number): Promise<void> {
    const businessType = await this.findOne(id);
    await this.businessTypeRepository.remove(businessType);
  }
}
