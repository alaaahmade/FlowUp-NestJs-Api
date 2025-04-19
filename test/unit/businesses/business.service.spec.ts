import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessService } from '../../../src/modules/businesses/business.service';
import { Business } from '../../../src/modules/businesses/business.entity';
import { BusinessType } from '../../../src/modules/business-types/business-type.entity';
import { NotFoundException } from '@nestjs/common';
import { User } from '../../../src/modules/users/user.entity';

describe('BusinessService', () => {
  let service: BusinessService;
  let businessRepository: Repository<Business>;
  let businessTypeRepository: Repository<BusinessType>;

  const mockBusinessType: BusinessType = {
    id: 1,
    name: 'Retail',
    description: 'Retail stores',
    businesses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBusiness: Business = {
    id: 1,
    name: 'Test Business',
    address: '123 Test St',
    contactEmail: 'test@example.com',
    contactNumber: '1234567890',
    businessType: mockBusinessType,
    owner: {} as User,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBusinessRepository = {
    create: jest.fn().mockReturnValue(mockBusiness),
    save: jest.fn().mockResolvedValue(mockBusiness),
    find: jest.fn().mockResolvedValue([mockBusiness]),
  };

  const mockBusinessTypeRepository = {
    findOne: jest.fn().mockResolvedValue(mockBusinessType),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        {
          provide: getRepositoryToken(Business),
          useValue: mockBusinessRepository,
        },
        {
          provide: getRepositoryToken(BusinessType),
          useValue: mockBusinessTypeRepository,
        },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
    businessRepository = module.get<Repository<Business>>(
      getRepositoryToken(Business),
    );
    businessTypeRepository = module.get<Repository<BusinessType>>(
      getRepositoryToken(BusinessType),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockUser = { id: 1, email: 'user@example.com' } as User;

    const createBusinessDto = {
      name: 'Test Business',
      address: '123 Test St',
      contactEmail: 'test@example.com',
      contactNumber: '1234567890',
      typeId: 1,
      owner: 1,
    };

    it('should create a business successfully', async () => {
      const result = await service.create(createBusinessDto, mockUser);
      expect(result).toEqual(mockBusiness);
      const findOneSpy = jest.spyOn(businessTypeRepository, 'findOne');
      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: createBusinessDto.typeId },
      });
    });

    it('should throw NotFoundException when business type not found', async () => {
      jest.spyOn(businessTypeRepository, 'findOne').mockResolvedValue(null);
      await expect(service.create(createBusinessDto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllByUser', () => {
    it('should return all businesses for a user', async () => {
      const result = await service.findAllByUser(1);
      expect(result).toEqual([mockBusiness]);
      const findSpy = jest.spyOn(businessRepository, 'find');
      expect(findSpy).toHaveBeenCalledWith({
        where: { owner: { id: 1 } },
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
            firstName: true,
            lastName: true,
          },
        },
      });
    });
  });
});
