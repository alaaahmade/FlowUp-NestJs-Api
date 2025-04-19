import { AppDataSource } from '../data-source';
import { ServiceReview } from '../../modules/services/entities/service-review.entity';
import { Service } from '../../modules/services/entities/service.entity';
import { MobileUser } from '../../modules/mobile-auth/entities/mobile-user.entity';
import { ServiceRating } from '../../modules/services/entities/service-rating.entity';

async function seedReviews() {
  console.log('🔄 Seeding service reviews data...');
  try {
    await AppDataSource.initialize();

    const serviceRatingRepository = AppDataSource.getRepository(ServiceRating);
    const serviceReviewRepository = AppDataSource.getRepository(ServiceReview);
    const serviceRepository = AppDataSource.getRepository(Service);
    const mobileUserRepository = AppDataSource.getRepository(MobileUser);

    // Fetch all services and users
    const services = await serviceRepository.find();
    const users = await mobileUserRepository.find();

    // Check if there are any services or users
    if (services.length === 0 || users.length === 0) {
      console.log('❌ No services or users found, skipping reviews seeding.');
      return;
    }

    const reviewData = [
      {
        serviceTitle: '1-Hour Gym Session',
        userEmail: 'Customer1@mail.com',
        name: 'John Doe',
        comment: 'Great session! Really enjoyed the workout.',
        rating: 4.5,
        avatarUrl: 'https://mail.com/avatar1.jpg',
        isPurchased: true,
        attachments: ['https://mail.com/image1.jpg'],
      },
      {
        serviceTitle: '1-Hour Gym Session',
        userEmail: 'Customer2@mail.com',
        name: 'Jane Smith',
        comment: 'Amazing equipment and friendly staff!',
        rating: 5,
        avatarUrl: 'https://mail.com/avatar2.jpg',
        isPurchased: true,
        attachments: ['https://mail.com/image2.jpg'],
      },
      {
        serviceTitle: 'Yoga Class with Yara',
        userEmail: 'Customer3@mail.com',
        name: 'Alice Green',
        comment: 'A relaxing and refreshing experience.',
        rating: 4,
        avatarUrl: 'https://mail.com/avatar3.jpg',
        isPurchased: true,
        attachments: ['https://mail.com/image3.jpg'],
      },
    ];

    // Iterate over the review data and create reviews
    await Promise.all(
      reviewData.map(async (review) => {
        // Find the service by title
        const service = services.find((s) => s.title === review.serviceTitle);

        if (!service) {
          console.log(
            `❌ Service "${review.serviceTitle}" not found, skipping review.`,
          );
          return;
        }

        // Find the user by email
        const user = users.find((u) => u.email === review.userEmail);

        if (!user) {
          console.log(
            `❌ User "${review.userEmail}" not found, skipping review.`,
          );
          return;
        }

        // Create and save the review
        const newReview = serviceReviewRepository.create({
          service: service,
          user: user,
          name: review.name,
          postedAt: new Date(),
          comment: review.comment,
          rating: review.rating,
          avatarUrl: review.avatarUrl,
          isPurchased: review.isPurchased,
          attachments: review.attachments,
        });

        await serviceReviewRepository.save(newReview);
        console.log(
          `✅ Review created for service: "${service.title}" by user: "${user.email}"`,
        );
      }),
    );

    console.log('🔄 Seed or update service ratings');
    const ratedServiceTitles = [
      ...new Set(reviewData.map((r) => r.serviceTitle)),
    ];

    for (const title of ratedServiceTitles) {
      const service = services.find((s) => s.title === title);
      if (!service) continue;

      const reviews = await serviceReviewRepository.find({
        where: { service: { id: service.id } },
      });

      if (reviews.length === 0) continue;

      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / reviews.length;

      let serviceRating = await serviceRatingRepository.findOne({
        where: { service: { id: service.id } },
      });

      if (serviceRating) {
        serviceRating.starCount = averageRating;
        serviceRating.reviewCount = reviews.length;
        await serviceRatingRepository.save(serviceRating);
        console.log(`🔄 Updated rating for "${service.title}"`);
      } else {
        serviceRating = serviceRatingRepository.create({
          service,
          name: service.title,
          starCount: averageRating,
          reviewCount: reviews.length,
        });
        await serviceRatingRepository.save(serviceRating);
        console.log(`✅ Created rating for "${service.title}"`);
      }
    }

    console.log('✅ Reviews & Ratings Seeding completed successfully');
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

seedReviews()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
