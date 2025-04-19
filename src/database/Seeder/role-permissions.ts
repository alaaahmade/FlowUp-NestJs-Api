import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { Role } from '../../modules/roles/role.entity';
import { Permission } from '../../modules/permissions/permission.entity';
import { In, DataSource } from 'typeorm';
import { User } from '../../modules/users/user.entity';

async function seedRolePermissions() {
  console.log('🔄 Connecting to the database...');
  console.log('🔄 Seeding permissions data ');

  // Create a new DataSource with the same config but synchronize disabled
  const dataSource = new DataSource({
    ...AppDataSource.options,
    synchronize: false,
  });

  try {
    await dataSource.initialize();

    const permissionRepository = dataSource.getRepository(Permission);
    const roleRepository = dataSource.getRepository(Role);
    const userRepository = dataSource.getRepository(User);

    // Define permissions to be created
    const permissionsData = [
      {
        name: 'Create User',
        key: 'create_user',
        resource: 'users',
        action: 'create',
        description: 'Can create new users',
      },
      {
        name: 'Read User',
        key: 'read_user',
        resource: 'users',
        action: 'read',
        description: 'Can read user information',
      },
    ];

    // Check existing permissions
    const existingPermissions = await permissionRepository.find({
      where: { name: In(permissionsData.map((p) => p.name)) },
    });

    // Create only non-existing permissions
    const permissions = await Promise.all(
      permissionsData.map(async (perm) => {
        const exists = existingPermissions.find((ep) => ep.name === perm.name);
        if (exists) {
          console.log(`Permission "${perm.name}" already exists, skipping...`);
          return exists;
        }
        const newPerm = await permissionRepository.save(perm);
        console.log(`Created permission: "${perm.name}"`);
        return newPerm;
      }),
    );

    // Find the specific 'read_user' permission - ensure it exists
    const readUserPermission = permissions.find((p) => p.key === 'read_user');
    if (!readUserPermission) {
      console.error(
        "❌ Critical error: 'read_user' permission could not be found or created. Aborting role/user seeding.",
      );
      // Optionally destroy connection and exit early
      if (dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
      }
      return; // Exit the function if essential permission is missing
    }
    const validPermissions = permissions.filter((p) => p !== undefined); // Filter out potential undefineds and assert type

    // Check existing roles
    const adminExists = await roleRepository.findOne({
      where: { name: 'admin' },
    });
    const userExists = await roleRepository.findOne({
      where: { name: 'user' },
    });

    const vendorExists = await roleRepository.findOne({
      where: { name: 'vendor' },
    });

    let vendorRoleInstance: Role | null = vendorExists;
    if (!vendorExists) {
      vendorRoleInstance = await roleRepository.save({
        name: 'vendor',
        description: 'Vendor role with limited access',
        permissions: [readUserPermission], // Assign the verified permission
      });
      console.log('Created vendor role');
    } else {
      console.log('Vendor role already exists, skipping...');
    }

    // Create roles if they don't exist
    let adminRoleInstance: Role | null = adminExists;
    if (!adminExists) {
      adminRoleInstance = await roleRepository.save({
        name: 'admin',
        description: 'Administrator role with full access',
        permissions: validPermissions,
      });
      console.log('Created admin role');
    } else {
      console.log('Admin role already exists, skipping...');
    }

    let userRoleInstance: Role | null = userExists;
    if (!userExists) {
      userRoleInstance = await roleRepository.save({
        name: 'user',
        description: 'Regular user role',
        permissions: [readUserPermission], // Assign the verified permission
      });
      console.log('Created user role');
    } else {
      console.log('User role already exists, skipping...');
    }

    // Check for existing users by role
    const adminUser = await userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('roles.name = :roleName', { roleName: 'admin' })
      .getOne();

    const vendorUser = await userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('roles.name = :roleName', { roleName: 'vendor' })
      .getOne();

    // Create Vendor user if not exists
    if (!vendorUser) {
      if (vendorRoleInstance) {
        const hashedPassword = await bcrypt.hash('vendorPassword', 10);
        await userRepository.save({
          email: 'vendorUser@vendor.com',
          fullName: 'Gold’s Gym ',
          password: hashedPassword,
          roles: [vendorRoleInstance],
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          picture:
            'https://stgs3yourpass.fra1.digitaloceanspaces.com/stgs3yourpass/service/vendor.jpeg',
        });
        console.log('Created vendor user');
      } else {
        console.error('❌ Vendor role not found, unable to create vendor user');
      }
    } else {
      console.log('Vendor user already exists, skipping...');
    }

    // Create Admin user if not exists
    if (!adminUser) {
      if (adminRoleInstance) {
        const hashedPassword = await bcrypt.hash('adminPassword', 10);
        await userRepository.save({
          email: 'adminUser@admin.com',
          fullName: 'Admin User',
          password: hashedPassword,
          roles: [adminRoleInstance],
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          picture:
            'https://stgs3yourpass.fra1.digitaloceanspaces.com/stgs3yourpass/service/admin.png',
        });
        console.log('Created admin user');
      } else {
        console.error('❌ Admin role not found, unable to create admin user');
      }
    } else {
      console.log('Admin user already exists, skipping...');
    }

    console.log('✅ permissions Seeding completed successfully');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    try {
      await dataSource.destroy();
    } catch (error) {
      console.error('❌ Error closing connection:', error);
    }
  }
}

seedRolePermissions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
