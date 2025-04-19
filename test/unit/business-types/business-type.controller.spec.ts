import { Test, TestingModule } from '@nestjs/testing';
import { BusinessTypeController } from '../../../src/modules/business-types/business-type.controller';
import { BusinessTypeService } from '../../../src/modules/business-types/business-type.service';
import { BusinessType } from '../../../src/modules/business-types/business-type.entity';
import { NotFoundException } from '@nestjs/common';

describe('BusinessTypeController', () => {
  let controller: BusinessTypeController;
  let service: BusinessTypeService;

  const mockBusinessType: BusinessType = {
    id: 1,
    name: 'Retail',
    description: 'Retail stores',
    businesses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBusinessTypeService = {
    findAll: jest.fn().mockResolvedValue([mockBusinessType]),
    findOne: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockBusinessType)),
    create: jest.fn().mockResolvedValue(mockBusinessType),
    update: jest.fn().mockResolvedValue(mockBusinessType),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessTypeController],
      providers: [
        {
          provide: BusinessTypeService,
          useValue: mockBusinessTypeService,
        },
      ],
    }).compile();

    controller = module.get<BusinessTypeController>(BusinessTypeController);
    service = module.get<BusinessTypeService>(BusinessTypeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of business types', async () => {
      const findAllSpy = jest.spyOn(service, 'findAll');
      const result = await controller.findAll();
      expect(result).toEqual([mockBusinessType]);
      expect(findAllSpy).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a business type', async () => {
      const findOneSpy = jest.spyOn(service, 'findOne');
      const result = await controller.findOne(1);
      expect(result).toEqual(mockBusinessType);
      expect(findOneSpy).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when business type not found', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockImplementation(() =>
          Promise.resolve(null as unknown as BusinessType),
        );
      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a business type', async () => {
      const createSpy = jest.spyOn(service, 'create');
      const createDto = { name: 'Retail', description: 'Retail stores' };
      const result = await controller.create(createDto);
      expect(result).toEqual(mockBusinessType);
      expect(createSpy).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a business type', async () => {
      const updateSpy = jest.spyOn(service, 'update');
      const updateDto = { name: 'Updated Retail' };
      const result = await controller.update(1, updateDto);
      expect(result).toEqual(mockBusinessType);
      expect(updateSpy).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a business type', async () => {
      const removeSpy = jest.spyOn(service, 'remove');
      await controller.remove(1);
      expect(removeSpy).toHaveBeenCalledWith(1);
    });
  });
});
