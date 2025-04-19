import { AppDataSource } from '../data-source';
import { Subscriptions } from '../../modules/Subscriptions/entities/subscriptions.entity';
import { MobileUser } from '../../modules/mobile-auth/entities/mobile-user.entity';
import { subDays } from 'date-fns'; // install with: npm install date-fns
import { Plans } from '../../modules/Subscriptions/entities/subscriptions-planes';

async function seedSubscriptions() {
  console.log('🔄 Seeding subscriptions data');
  try {
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(MobileUser);
    const subscriptionRepository = AppDataSource.getRepository(Subscriptions);
    const planRepository = AppDataSource.getRepository(Plans);

    const users = await userRepository.find();

    const subscriptionsData: Subscriptions[] = [];

    for (const user of users) {
      for (let i = 0; i < 3; i++) {
        const daysAgo = subDays(new Date(), i); // today, yesterday, 2 days ago

        const subscription = subscriptionRepository.create({
          user,
          amountJOD: 10,
          credits: 30,
          status: i % 2 === 0 ? 'paid' : 'canceled',
          createdAt: daysAgo,
        });

        subscriptionsData.push(subscription);
      }
    }

    await subscriptionRepository.save(subscriptionsData);

    const plansData = [
      {
        name: 'Basic Plan',
        amountJOD: 10,
        credits: 30,
        isRecurring: true,
      },
      {
        name: 'Premium Plan',
        amountJOD: 20,
        credits: 60,
        isRecurring: true,
      },
      {
        name: 'Pro Plan',
        amountJOD: 30,
        credits: 90,
        isRecurring: true,
      },
    ];

    for (const plan of plansData) {
      const newPlan = planRepository.create({
        name: plan.name,
        amountJOD: plan.amountJOD,
        credits: plan.credits,
      });
      console.log(`✅Creating plan: ${plan.name}`);

      await planRepository.save(newPlan);
    }
    console.log(`✅ Created ${subscriptionsData.length} subscriptions`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedSubscriptions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
