import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessTypeService } from '../../../src/modules/business-types/business-type.service';
import { BusinessType } from '../../../src/modules/business-types/business-type.entity';
import { NotFoundException } from '@nestjs/common';

describe('BusinessTypeService', () => {
  let service: BusinessTypeService;
  let repository: Repository<BusinessType>;

  const mockBusinessType: BusinessType = {
    id: 1,
    name: 'Retail',
    description: 'Retail stores',
    businesses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn().mockResolvedValue([mockBusinessType]),
    findOne: jest.fn().mockResolvedValue(mockBusinessType),
    create: jest.fn().mockReturnValue(mockBusinessType),
    save: jest.fn().mockResolvedValue(mockBusinessType),
    remove: jest.fn().mockResolvedValue(mockBusinessType),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessTypeService,
        {
          provide: getRepositoryToken(BusinessType),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BusinessTypeService>(BusinessTypeService);
    repository = module.get<Repository<BusinessType>>(
      getRepositoryToken(BusinessType),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of business types', async () => {
      const findSpy = jest.spyOn(repository, 'find');
      const result = await service.findAll();
      expect(result).toEqual([mockBusinessType]);
      expect(findSpy).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a business type', async () => {
      const findOneSpy = jest.spyOn(repository, 'findOne');
      const result = await service.findOne(1);
      expect(result).toEqual(mockBusinessType);
      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['businesses'],
      });
    });

    it('should throw NotFoundException when business type not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a business type', async () => {
      const createSpy = jest.spyOn(repository, 'create');
      const saveSpy = jest.spyOn(repository, 'save');
      const createDto = { name: 'Retail', description: 'Retail stores' };
      const result = await service.create(createDto);
      expect(result).toEqual(mockBusinessType);
      expect(createSpy).toHaveBeenCalledWith(createDto);
      expect(saveSpy).toHaveBeenCalledWith(mockBusinessType);
    });
  });

  describe('update', () => {
    it('should update a business type', async () => {
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(mockBusinessType);
      const saveSpy = jest.spyOn(repository, 'save');
      const updateDto = { name: 'Updated Retail' };

      const result = await service.update(1, updateDto);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['businesses'],
      });
      expect(result).toEqual(mockBusinessType);
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should throw NotFoundException when business type not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      await expect(
        service.update(1, { name: 'Updated Retail' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a business type', async () => {
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(mockBusinessType);
      const removeSpy = jest.spyOn(repository, 'remove');

      await service.remove(1);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['businesses'],
      });
      expect(removeSpy).toHaveBeenCalledWith(mockBusinessType);
    });

    it('should throw NotFoundException when business type not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
