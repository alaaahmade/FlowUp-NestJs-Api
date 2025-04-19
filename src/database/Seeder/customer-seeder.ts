import { AppDataSource } from '../data-source';
import { Role } from '../../modules/roles/role.entity';
import { Permission } from '../../modules/permissions/permission.entity';
import { MobileUser } from '../../modules/mobile-auth/entities/mobile-user.entity';
// import { User } from '../../modules/users/user.entity';

async function seedCustomers() {
  console.log('🔄 Connecting to the database...');
  console.log('🔄 Seeding customers data ');
  try {
    await AppDataSource.initialize();

    const permissionRepository = AppDataSource.getRepository(Permission);
    const roleRepository = AppDataSource.getRepository(Role);
    const userRepository = AppDataSource.getRepository(MobileUser);

    const customerPermission = await permissionRepository.findOne({
      where: { name: 'Read User' },
    });

    if (!customerPermission) {
      throw new Error("Required permission 'Read User' not found");
    }

    let customerRole = await roleRepository.findOne({
      where: { name: 'customer' },
    });
    if (!customerRole) {
      customerRole = await roleRepository.save({
        name: 'customer',
        description: 'customer role with read user access',
        permissions: [customerPermission],
      });

      console.log('Created customer role');
    } else {
      console.log('Customer role already exists, skipping...');
    }

    const customersData = Array.from({ length: 20 }, (_, index) => ({
      state: 'active',
      city: 'Rancho Cordova',
      roles: [customerRole],
      profilePicture:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8-x9S8zoRrhvTMHpSNs5bVn2zVRpbnCwfzQ&s',
      status: (index % 2 === 1 && 'banned') || 'active',
      email: `Customer${index}@mail.com`,
      fullName: `Customer ${index}`,
      phoneNumber: `123456789${index}`,
      password: `hashedPassword123${index}`,
      dateOfBirth: new Date(
        new Date().setFullYear(new Date().getFullYear() - (index % 30)),
      ),
      gender: index % 2 === 1 ? 'male' : 'female',
    }));

    await Promise.all(
      customersData.map(async (customer) => {
        const existing = await userRepository.findOne({
          where: { email: customer.email },
        });

        if (existing) {
          return existing;
        }

        return userRepository.save(customer);
      }),
    );

    console.log('✅ Customers created successfully');

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

seedCustomers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
