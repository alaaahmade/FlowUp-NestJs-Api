import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { ServiceReview } from './entities/service-review.entity';
import { ServiceCategory } from './entities/service-category.entity';
import { ServiceRating } from './entities/service-rating.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { User } from '../users/user.entity';
import { Availability } from './entities/service-availability.entity';
import { Day } from './entities/service-day.entity';
import { Class } from './entities/service-classes.entity';
import { Session } from './entities/service-session.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(ServiceReview)
    private reviewRepository: Repository<ServiceReview>,
    @InjectRepository(ServiceCategory)
    private categoryRepository: Repository<ServiceCategory>,
    @InjectRepository(ServiceRating)
    private ratingRepository: Repository<ServiceRating>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    @InjectRepository(Day)
    private dayRepository: Repository<Day>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    // Step 1: Create the basic service and save it to generate an ID
    const service = this.serviceRepository.create(createServiceDto);

    // Step 2: Handle category relation
    if (createServiceDto.category) {
      const category = await this.categoryRepository.findOne({
        where: { name: createServiceDto.category },
      });
      if (category) {
        service.categoryRelation = category;
        service.category = category.name;
      } else {
        throw new BadRequestException('Category not found');
      }
    }

    // Save the basic service
    const savedService = await this.serviceRepository.save(service);

    // Step 3: Handle availability
    if (createServiceDto.availability) {
      // Step 3a: Create or associate availability with the service
      const availability = await this.availabilityRepository.save({
        ...createServiceDto.availability,
        service: savedService, // Ensure the availability is linked to the service
      });

      // Step 3b: Save days and link sessions to each day
      if (createServiceDto.availability.days) {
        await Promise.all(
          createServiceDto.availability.days.map(async (day) => {
            await this.dayRepository.save({
              ...day,
              availability, // Link the day to the availability
            });
          }),
        );
      }

      // Step 3c: Save classes and link sessions to each class
      if (createServiceDto.availability.class) {
        await Promise.all(
          createServiceDto.availability.class.map(async (cls) => {
            const savedClass = await this.classRepository.save({
              ...cls,
              availability, // Link the class to the availability
            });

            if (cls.sessions && cls.sessions.length > 0) {
              await this.sessionRepository.save(
                cls.sessions.map((session) => ({
                  ...session,
                  class: savedClass, // Link the session to the class
                })),
              );
            }
          }),
        );
      }
    }

    // Step 4: Return the fully populated service
    return this.findOne(savedService.id);
  }

  async findAll(): Promise<Service[]> {
    const services = await this.serviceRepository.find({
      relations: [
        'reviews',
        'reviews.user',
        'ratings',
        'categoryRelation',
        'availability',
        'availability.days',
        'availability.classes',
        'availability.classes.sessions',
        'vendor',
      ],
      select: {
        vendor: {
          id: true,
          email: true,
          fullName: true,
          picture: true,
        },
      },
    });

    services.forEach((service) => {
      service.totalReviews = service.reviews.length;
      service.totalRating = service.ratings?.length
        ? service.ratings.reduce(
            (acc: number, rating: ServiceRating) =>
              acc + (rating.starCount || 0),
            0,
          ) / service.ratings.length
        : 0;
    });

    return services;
  }

  async findOne(id: string | number): Promise<Service> {
    // Ensure id is a valid number
    const serviceId = Number(id);

    if (isNaN(serviceId)) {
      throw new BadRequestException('Invalid service ID');
    }

    const service = await this.serviceRepository.findOne({
      where: { id: serviceId },
      relations: [
        'reviews',
        'reviews.user',
        'ratings',
        'categoryRelation',
        'vendor',
      ],
      select: {
        vendor: {
          id: true,
          email: true,
          fullName: true,
          picture: true,
        },
        ratings: {
          id: true,
          starCount: true,
        },
        reviews: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            id: true,
            email: true,
            fullName: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    service.totalReviews = service.reviews.length;
    service.totalRating = service.ratings?.length
      ? service.ratings.reduce(
          (acc: number, rating: ServiceRating) => acc + (rating.starCount || 0),
          0,
        ) / service.ratings.length
      : 0;

    const availability = await this.availabilityRepository.findOne({
      where: { service: { id: serviceId } },
      relations: ['days', 'classes', 'classes.sessions'],
    });

    // Consolidate sessions by day
    if (availability && availability.classes) {
      const consolidatedClasses = availability.classes.reduce(
        (
          acc: { day: string; sessions: any[] }[],
          currentClass: { day: string; sessions: any[] },
        ) => {
          const existingDay = acc.find((cls) => cls.day === currentClass.day);

          if (existingDay) {
            // Merge sessions into the existing day's sessions
            existingDay.sessions = [
              ...(existingDay.sessions || []),
              ...currentClass.sessions,
            ];
          } else {
            // Add a new day entry
            acc.push({
              day: currentClass.day,
              sessions: currentClass.sessions,
            });
          }

          return acc;
        },
        [],
      );

      // Replace classes with consolidated structure
      availability.classes = consolidatedClasses.map((consolidatedClass) => {
        const classEntity = new Class();
        classEntity.day = consolidatedClass.day;
        classEntity.sessions = consolidatedClass.sessions;
        return classEntity;
      });
      service.availability = availability;
    }

    return service;
  }

  async update(
    id: number,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    const service = await this.findOne(id);

    if (updateServiceDto.availability) {
      // First, clear existing days and classes if service has an availability
      if (service.availability) {
        // Clear days
        await this.dayRepository.delete({
          availability: { id: service.availability.id },
        });

        // Find all classes to delete their sessions first
        const classes = await this.classRepository.find({
          where: { availability: { id: service.availability.id } },
          relations: ['sessions'],
        });

        for (const cls of classes) {
          if (cls.sessions && cls.sessions.length > 0) {
            await this.sessionRepository.delete({ class: { id: cls.id } });
          }
        }

        // Delete all classes
        await this.classRepository.delete({
          availability: { id: service.availability.id },
        });
      }

      // Create or update availability
      await this.createAvailability(service, updateServiceDto.availability);
      if (updateServiceDto.availability.days) {
        await this.dayRepository.save(updateServiceDto.availability.days);
      }
      if (updateServiceDto.availability.class) {
        await Promise.all(
          updateServiceDto.availability.class.map(async (cls) => {
            const serviceClass = await this.classRepository.save({
              ...cls,
              availability: service.availability,
            });
            await this.sessionRepository.save(
              cls.sessions.map((session) => ({
                ...session,
                class: serviceClass,
              })),
            );
          }),
        );
      }

      // delete updateServiceDto.availability;
    }

    if (updateServiceDto.category) {
      const category = await this.categoryRepository.findOne({
        where: { name: updateServiceDto.category },
      });
      if (category) {
        service.categoryRelation = category;
        service.category = category.name;
      }
    }

    // Update other fields
    Object.assign(service, updateServiceDto);
    await this.serviceRepository.save(service);

    // Return the updated service with all relations loaded
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
  }

  async addReview(
    userId: number,
    createReviewDto: CreateReviewDto,
  ): Promise<ServiceReview> {
    const service = await this.findOne(createReviewDto.serviceId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      service,
      user: { id: user.id.toString() },
      name: user.fullName || 'Anonymous',
      postedAt: new Date(),
      avatarUrl: user.picture,
    });

    // Update service rating
    service.totalReviews += 1;
    service.totalRating =
      (service.totalRating * (service.totalReviews - 1) +
        createReviewDto.rating) /
      service.totalReviews;
    await this.serviceRepository.save(service);

    return this.reviewRepository.save(review);
  }

  async findServicesByCategory(categoryId: number): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { categoryRelation: { id: categoryId } },
      relations: [
        'reviews',
        'reviews.user',
        'ratings',
        'categoryRelation',
        'availability',
        'availability.days',
        'availability.classes',
        'availability.classes.sessions',
      ],
    });
  }

  async findFeaturedServices(): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { publish: true },
      take: 5,
      order: { totalRating: 'DESC' },
      relations: ['reviews'],
    });
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<ServiceCategory> {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAllCategories(): Promise<ServiceCategory[]> {
    return this.categoryRepository.find();
  }

  async findOneCategory(id: number): Promise<ServiceCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['services'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async updateCategory(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<ServiceCategory> {
    const category = await this.findOneCategory(id);

    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async removeCategory(id: string): Promise<void> {
    // Find the category to be removed
    const category = await this.findOneCategory(+id);

    // Fetch services that are referencing this category
    const services = await this.serviceRepository.find({
      where: { categoryRelation: category },
    });

    console.log(services);

    // Update the services to no longer reference the category
    for (const service of services) {
      await this.serviceRepository.update(
        { id: service.id },
        {
          categoryRelation: undefined,
          category: undefined,
        },
      );
    }

    await this.categoryRepository.remove(category);

    return;
  }
  async addRating(
    serviceId: number,
    createRatingDto: CreateRatingDto,
  ): Promise<ServiceRating> {
    const service = await this.findOne(serviceId);

    const rating = this.ratingRepository.create({
      ...createRatingDto,
      service,
    });

    return this.ratingRepository.save(rating);
  }

  async getRatingsForService(serviceId: number): Promise<ServiceRating[]> {
    return this.ratingRepository.find({
      where: { service: { id: serviceId } },
    });
  }

  async updateRating(
    id: number,
    updateRatingDto: Partial<CreateRatingDto>,
  ): Promise<ServiceRating> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
      relations: ['service'],
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    Object.assign(rating, updateRatingDto);
    return this.ratingRepository.save(rating);
  }

  async removeRating(id: number): Promise<void> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    await this.ratingRepository.remove(rating);
  }

  // Helper methods for availability
  private async createAvailability(
    service: Service,
    availabilityData: any,
  ): Promise<void> {
    // Get or create availability entity
    let availability: Availability;

    if (service.availability) {
      // Use existing availability
      availability = service.availability;
    } else {
      // Create new availability
      availability = this.availabilityRepository.create();
      availability.service = service;
      availability = await this.availabilityRepository.save(availability);

      // Update service with the new availability
      service.availability = availability;
      await this.serviceRepository.save(service);
    }

    // For Class type services, handle days as regular days if no class data is provided
    if (
      service.class &&
      service.type === 'Class' &&
      (!availabilityData.class || availabilityData.class.length === 0) &&
      availabilityData.days &&
      availabilityData.days.length > 0
    ) {
      // Convert days to classes with sessions
      interface ClassData {
        day: string;
        sessions: { from: string; to: string }[];
      }

      const classesData: ClassData[] = [];
      for (const dayData of availabilityData.days) {
        classesData.push({
          day: dayData.day,
          sessions: [
            {
              from: dayData.from,
              to: dayData.to,
            },
          ],
        });
      }

      // Set the class data
      availabilityData.class = classesData;
    }

    // Handle days for Session type
    if (availabilityData.days && availabilityData.days.length > 0) {
      for (const dayData of availabilityData.days) {
        // Remove id property if it exists
        if (dayData.id) {
          delete dayData.id;
        }

        const day = this.dayRepository.create({
          day: dayData.day,
          value: dayData.value,
          from: dayData.from,
          to: dayData.to,
          availability: availability,
        });
        await this.dayRepository.save(day);
      }
    }

    // Handle classes for Class type
    if (availabilityData.class && availabilityData.class.length > 0) {
      for (const classData of availabilityData.class) {
        const classEntity = this.classRepository.create({
          day: classData.day,
          availability: availability,
        });
        const savedClass = await this.classRepository.save(classEntity);

        // Handle sessions for each class
        if (classData.sessions && classData.sessions.length > 0) {
          for (const sessionData of classData.sessions) {
            const session = this.sessionRepository.create({
              from: sessionData.from,
              to: sessionData.to,
              class: savedClass,
            });
            await this.sessionRepository.save(session);
          }
        }
      }
    }
  }
}
