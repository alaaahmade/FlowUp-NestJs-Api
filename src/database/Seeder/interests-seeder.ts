import { AppDataSource } from '../data-source';
import { Interests } from '../../modules/interests/user-interests.entity';
import { In } from 'typeorm';
import { MobileUser } from '../../modules/mobile-auth/entities/mobile-user.entity';

async function seedInterests() {
  console.log('🔄 Connecting to the database...');
  console.log('🔄 Seeding customers data ');
  const customersReposetory = AppDataSource.getRepository(MobileUser);

  try {
    await AppDataSource.initialize();

    const interestsData = [
      {
        name: 'Pilates',
        description: 'customer Pilates with Pilates access',
        image:
          'https://s3-alpha-sig.figma.com/img/add7/8ab8/fed73d07cd0d8389bc87dbe50b6b333e?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=ckjAXfCB-So4fMNkIdC8NLMGV2eEmrYnHnsY-YxItkK2bCZAB-zP~a6xKWwtkneGCUhoCb3zCzTUfzKuGzJkXeA5ofEttmZ2lJjhvpxD9HCWpfXbaIGda4Ax5a6Ejf5EhJFkKrbY2ElXQrpEWA8vKq-XYOrM8c-OncfHUWQlqFq7dDVY6jyyG4owrFuksqYNE-eAMP68pftYHFXt~qDmClRX0R5fgqr24vZl8SCZFkw5e-ui1ybihcJDaAvm5q4Z-H9N2YrKy1oRGLTLRsF8N7cv0GeFnY2qu3bdDE1V3dWlMiqwMhQq5eYhvx33TF2bs~m-fwE1yhY4P7E-LGztCQ__',
      },
      {
        name: 'Bodybuilding',
        description: 'customer Bodybuilding with Bodybuilding access',
        image:
          'https://s3-alpha-sig.figma.com/img/4197/0f10/40706009871f1293886f0f08a9e0d91e?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=WLzMDp9gjXdwDUTO5zcyvEKqQtwHk7llqUgs-1AaHN1w9qyj-~3Cp9rlP8uXeeUAKl25KVuP3b2Nnm5Gz5liM6~84l005X-WYa81zkDtIkVD5VVIEIaP8850VZfA0yJMqNDKzuQtsGKBGTJt2WRN-y0fLMV8CFvIsqhl7fGsDs0LsPzJw52kh4bMEOzBLaU0ZVhGNzkyrYqr3BziCTY4Z7nzorZLVaO3fE9Z7zI02Ep4qnqJkoJD0dYTXC7XiIKKmdGtMGnD7fXJ~Bg141dlWtAyZtMulp-pGKi65AxExwG3h3-ETQeebcHkhY68~lhNDBKlNd6SNWtl6RNVec-DbA__',
      },
    ];

    const interestsRepository = AppDataSource.getRepository(Interests);

    const existingInterests = await interestsRepository.find({
      where: { name: In(interestsData.map((c) => c.name)) },
    });

    if (existingInterests.length === 0) {
      await Promise.all(
        interestsData.map(async (interest) => {
          const existing = await interestsRepository.findOne({
            where: { name: interest.name },
          });
          if (!existing) {
            await interestsRepository.save(interest);
          } else {
            console.log(`Interest with name ${interest.name} already exists`);
          }
        }),
      );
    }

    const customers = await customersReposetory.find();
    const allInterests = await interestsRepository.find();

    for (const customer of customers) {
      customer.interests = allInterests;
      await customersReposetory.save(customer);
    }

    console.log('✅ Customers Interests created successfully');

    console.log('✅ Seeding completed successfully');
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

seedInterests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
