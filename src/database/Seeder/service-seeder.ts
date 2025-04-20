import { AppDataSource } from '../data-source';
import { Service } from '../../modules/services/entities/service.entity';
import { Availability } from '../../modules/services/entities/service-availability.entity';
import { Day } from '../../modules/services/entities/service-day.entity';
import { Session } from '../../modules/services/entities/service-session.entity';
import { Class } from '../../modules/services/entities/service-classes.entity';
import { ServiceCategory } from '../../modules/services/entities/service-category.entity';
import { In } from 'typeorm';
import { User } from '../../modules/users/user.entity';
import { MobileUser } from '../../modules/mobile-auth/entities/mobile-user.entity';
import { Booking } from '../../modules/booking/booking.entity';

async function seedServices() {
  console.log('🔄 Connecting to the database...');
  console.log('🔄 Seeding services data ');
  try {
    await AppDataSource.initialize();

    const serviceRepository = AppDataSource.getRepository(Service);
    const availabilityRepository = AppDataSource.getRepository(Availability);
    const dayRepository = AppDataSource.getRepository(Day);
    const sessionRepository = AppDataSource.getRepository(Session);
    const classRepository = AppDataSource.getRepository(Class);
    const userRepository = AppDataSource.getRepository(User);
    const serviceCategoryRepository =
      AppDataSource.getRepository(ServiceCategory);
    const mobileUserRepository = AppDataSource.getRepository(MobileUser);
    const bookingRepository = AppDataSource.getRepository(Booking);

    // const customerEmails = ['Customer16@mail.com', 'Customer18@mail.com'];
    const customers = await mobileUserRepository.find();
    // Example service category data
    const serviceCategoriesData = [
      { name: 'Yoga', description: 'Yoga services' },
      { name: 'Pilates', description: 'Pilates services' },
      { name: 'Gym', description: 'Gym services' },
    ];

    // Check existing service categories
    const existingServiceCategories = await serviceCategoryRepository.find({
      where: { name: In(serviceCategoriesData.map((c) => c.name)) },
    });

    // Create only non-existing service categories
    const serviceCategories = await Promise.all(
      serviceCategoriesData.map(async (category) => {
        const exists = existingServiceCategories.find(
          (ec) => ec.name === category.name,
        );
        if (exists) {
          console.log(
            `Service category "${category.name}" already exists, skipping...`,
          );
          return exists;
        }
        const newCategory = await serviceCategoryRepository.save(category);
        console.log(`Created service category: "${category.name}"`);
        return newCategory;
      }),
    );

    const vendorUser = await userRepository.findOne({
      where: { email: 'vendorUser@vendor.com' },
    });

    // Example service data
    const serviceData = [
      {
        title: '1-Hour Gym Session',
        description:
          'Explore our modern gym with cutting-edge fitness technology and diverse machines. Enjoy spacious workout areas, group classes, and personal training to reach your fitness goals. With locker rooms, showers, and a smoothie bar, we offer a complete fitness experience!',
        category: serviceCategories[2].name,
        categoryRelation: serviceCategories[2].id,
        images: [
          'https://stgs3yourpass.fra1.digitaloceanspaces.com/stgs3yourpass/service/1-Hour-Gym-Session.png',
        ],
        type: 'session',
        publish: true,
        vendor: vendorUser,
        credits: 30,
      },
      {
        title: '1 - Hour Pool Access',
        description:
          'Enjoy a refreshing swim in our pool, perfect for relaxation and exercise. Our pool area features comfortable loungers, umbrellas, and a bar for refreshments. Whether you want to swim laps or unwind by the water, our pool is the ideal spot for leisure and fitness.',
        category: serviceCategories[2].name,
        categoryRelation: serviceCategories[2].id,
        type: 'session',
        publish: true,
        vendor: vendorUser,
        credits: 30,
        images: [
          'https://stgs3yourpass.fra1.digitaloceanspaces.com/stgs3yourpass/service/1-Hour-Pool-Access.png',
        ],
      },
      {
        title: 'Yoga Class with Yara',
        description:
          'Enjoy a refreshing swim in our pool, perfect for relaxation and exercise. Our pool area features comfortable loungers, umbrellas, and a bar for refreshments. Whether you want to swim laps or unwind by the water, our pool is the ideal spot for leisure and fitness.',

        category: serviceCategories[0].name,
        categoryRelation: serviceCategories[0].id,
        duration: 75,
        type: 'class',
        publish: true,
        vendor: vendorUser,
        credits: 30,
        images: [
          'https://stgs3yourpass.fra1.digitaloceanspaces.com/stgs3yourpass/service/Yoga%20Class%20with%20Yara.png',
        ],
      },
      {
        title: 'Padel FlowUp Reservation',
        description:
          'Enjoy a refreshing swim in our pool, perfect for relaxation and exercise. Our pool area features comfortable loungers, umbrellas, and a bar for refreshments. Whether you want to swim laps or unwind by the water, our pool is the ideal spot for leisure and fitness.',

        type: 'class',
        publish: true,
        vendor: vendorUser,
        credits: 30,
        images: [
          'https://parksports.co.uk/media/images/New-23-24-Update/_2400xAUTO_crop_center-center_none_ns/Park-Sports-Adult-Padel-Courses.jpg',
        ],
        category: serviceCategories[1].name,
        categoryRelation: serviceCategories[1].id,
      },
    ];

    // Check existing services
    const existingServices = await serviceRepository.find({
      where: { title: In(serviceData.map((s) => s.title)) },
    });

    // Create only non-existing services
    await Promise.all(
      serviceData.map(async (service) => {
        const exists = existingServices.find(
          (es) => es.title === service.title,
        );
        if (exists) {
          console.log(`Service "${service.title}" already exists, skipping...`);
          return exists;
        }

        if (!vendorUser) {
          throw new Error(
            'Vendor user not found. Please ensure the vendor user exists in the database.',
          );
        }

        const newService = await serviceRepository.save({
          ...service,
          categoryRelation: serviceCategories.find(
            (category) => category.id === service.categoryRelation,
          ),
          vendor: vendorUser, // Ensure vendorUser is not null
        });

        if (newService.type === 'session') {
          const newAvailability = await availabilityRepository.save({
            service: newService,
          });
          await dayRepository.save({
            day: 'Monday',
            value: 'Monday',
            from: '08:00 AM',
            to: '10:00 AM',
            availability: newAvailability,
          });

          await dayRepository.save({
            day: 'Tuesday',
            value: 'Tuesday',
            from: '08:00 AM',
            to: '10:00 AM',
            availability: newAvailability,
          });
        } else if (newService.type === 'class') {
          const newAvailability = await availabilityRepository.save({
            service: newService,
          });
          const serviceClass = await classRepository.save({
            day: 'Monday', // or any day logic you want
            availability: newAvailability,
          });

          const sessionsData = [
            { from: '08:00 AM', to: '10:00 AM', class: serviceClass },
            { from: '10:30 AM', to: '12:00 PM', class: serviceClass },
            // Add more sessions as needed
          ];

          await sessionRepository.save(
            sessionsData.map((sessionData) => ({
              ...sessionData,
              class: serviceClass, // Associate each session with the class
            })),
          );
        }

        const allServices = await serviceRepository.find({
          where: { title: In(serviceData.map((s) => s.title)) },
          relations: [
            'availability',
            'availability.classes',
            'availability.classes.sessions',
          ],
        });

        for (const customer of customers) {
          for (const service of allServices) {
            const existingBooking = await bookingRepository.findOne({
              where: {
                user: { id: customer.id },
                service: { id: service.id },
              },
              relations: ['user', 'service'],
            });

            if (existingBooking) {
              console.log(
                `⏭️ Booking already exists for ${customer.email} and ${service.title}`,
              );
              continue;
            }

            const booking = bookingRepository.create({
              user: customer,
              service: service,
            });

            await bookingRepository.save(booking);
            console.log(
              `✅ Booking created: ${customer.email} - ${service.title}`,
            );
          }
        }

        console.log(`Created service: "${service.title}"`);
        return newService;
      }),
    );
    console.log('✅ Services Seeding completed successfully');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    try {
      await AppDataSource.destroy();
    } catch (error) {
      console.error('❌ Error closing connection:', error);
    }
  }
}

seedServices()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
