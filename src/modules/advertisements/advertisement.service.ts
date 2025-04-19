import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advertisement } from './advertisement.entity';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';

@Injectable()
export class AdvertisementService {
  constructor(
    @InjectRepository(Advertisement)
    private advertisementRepository: Repository<Advertisement>,
  ) {}

  async create(
    createAdvertisementDto: CreateAdvertisementDto,
  ): Promise<Advertisement> {
    // Validate based on type
    if (
      createAdvertisementDto.type === 'search' &&
      !createAdvertisementDto.title
    ) {
      throw new BadRequestException(
        'Title is required for search advertisements',
      );
    }

    if (
      createAdvertisementDto.type === 'home' &&
      createAdvertisementDto.title
    ) {
      // For home type, title should not be provided
      delete createAdvertisementDto.title;
    }

    const advertisement = this.advertisementRepository.create(
      createAdvertisementDto,
    );
    return this.advertisementRepository.save(advertisement);
  }

  async findAll(): Promise<Advertisement[]> {
    console.log(11111);
    return this.advertisementRepository.find();
  }

  async findByType(type: string): Promise<Advertisement[]> {
    return this.advertisementRepository.find({ where: { type } });
  }

  async findOne(id: number): Promise<Advertisement> {
    const advertisement = await this.advertisementRepository.findOne({
      where: { id },
    });
    if (!advertisement) {
      throw new NotFoundException(`Advertisement with ID ${id} not found`);
    }
    return advertisement;
  }

  async update(
    id: number,
    updateAdvertisementDto: UpdateAdvertisementDto,
  ): Promise<Advertisement> {
    const advertisement = await this.findOne(id);

    // Validate based on type
    if (updateAdvertisementDto.type) {
      if (
        updateAdvertisementDto.type === 'search' &&
        !updateAdvertisementDto.title &&
        !advertisement.title
      ) {
        throw new BadRequestException(
          'Title is required for search advertisements',
        );
      }

      if (updateAdvertisementDto.type === 'home') {
        // For home type, title should be removed
        updateAdvertisementDto.title = undefined;
      }
    } else {
      // If type is not being updated, check if current type is HOME but title is being added
      if (advertisement.type === 'home' && updateAdvertisementDto.title) {
        throw new BadRequestException(
          'Title is not allowed for home advertisements',
        );
      }

      // If type is SEARCH but title is being removed
      if (
        advertisement.type === 'search' &&
        updateAdvertisementDto.title === null
      ) {
        throw new BadRequestException(
          'Title cannot be removed for search advertisements',
        );
      }
    }

    Object.assign(advertisement, updateAdvertisementDto);
    return this.advertisementRepository.save(advertisement);
  }

  async remove(id: number): Promise<void> {
    const advertisement = await this.findOne(id);
    await this.advertisementRepository.remove(advertisement);
  }
}
