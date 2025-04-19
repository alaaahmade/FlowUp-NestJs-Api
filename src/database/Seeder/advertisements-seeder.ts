import { AppDataSource } from '../data-source';
import { Advertisement } from '../../modules/advertisements/advertisement.entity';
import { In } from 'typeorm';

async function seedAdvertisements() {
  console.log('🔄 Connecting to the database...');
  console.log('🔄 Seeding advertisements data ');
  try {
    await AppDataSource.initialize();

    const advertisementsData = [
      {
        image: 'https://s3-alpha-sig.figma.com/img/388a/4284/302b32115afa54a1542db4d7a96cbdcf?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=Lk~FMZgwKcGk4ECP0ToKfC~ma4iBMyS~15ffXacpr3laU6QPWZ8cjx-vx6WlSDwzrcd3Ak2ELNLTPpDeBFPTb08n41gHNzzhdgLgXam~AtlLG5eTau7VjU5YyW1rzTE~wedwmz7fH7YBSwGqRJxYI8ew7DhWPSDir5AR28yOSL9HjcF2NYNdGEQ36vh-dmjLh53GrZipeRb4gKRCFTuHLz2cD5KfmFTLBjY~zDQ1iqe5HFiSSnD84Ouw4VG8tW~Wg6ja1Sc4eGyPRKolRyw6UC1jAlPWfduX~Z6db~puVFEKV5POPZ3sUXoDNO1VwXhB-xC1VKF-ZkwqzpKI4lcF6Q__',
        type: 'home',
        link: 'https://www.example.com/home-offer',
      },
      {
        image: 'https://s3-alpha-sig.figma.com/img/388a/4284/302b32115afa54a1542db4d7a96cbdcf?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=Lk~FMZgwKcGk4ECP0ToKfC~ma4iBMyS~15ffXacpr3laU6QPWZ8cjx-vx6WlSDwzrcd3Ak2ELNLTPpDeBFPTb08n41gHNzzhdgLgXam~AtlLG5eTau7VjU5YyW1rzTE~wedwmz7fH7YBSwGqRJxYI8ew7DhWPSDir5AR28yOSL9HjcF2NYNdGEQ36vh-dmjLh53GrZipeRb4gKRCFTuHLz2cD5KfmFTLBjY~zDQ1iqe5HFiSSnD84Ouw4VG8tW~Wg6ja1Sc4eGyPRKolRyw6UC1jAlPWfduX~Z6db~puVFEKV5POPZ3sUXoDNO1VwXhB-xC1VKF-ZkwqzpKI4lcF6Q__',
        type: 'search',
        link: 'https://www.example.com/search-offer',
        title: 'this is search add',
      },
    ];

    const advertisementRepository = AppDataSource.getRepository(Advertisement);

    // Check if any advertisements already exist
    const existingCount = await advertisementRepository.count();

    if (existingCount === 0) {
      await Promise.all(
        advertisementsData.map(async (advertisement) => {
          await advertisementRepository.save(advertisement);
        }),
      );
      console.log('✅ Advertisements created successfully');
    } else {
      console.log('⚠️ Advertisements already exist in the database. Skipping seeding.');
    }

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

seedAdvertisements()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
