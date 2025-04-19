import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { MobileUser } from '../mobile-auth/entities/mobile-user.entity';
import { Booking } from '../booking/booking.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(MobileUser)
    private readonly MobileUserRepository: Repository<MobileUser>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { roles: roleIds, ...userData } = createUserDto;
    const user = this.userRepository.create(userData);

    if (roleIds && roleIds.length > 0) {
      user.roles = await this.roleRepository.findBy({
        id: In(roleIds),
      });
    }

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['roles'] });
  }

  async findCustomers(): Promise<MobileUser[]> {
    const customers = await this.MobileUserRepository.find({
      relations: [
        'roles',
        'bookings',
        'interests',
        'bookings.class',
        'bookings.session',
        'bookings.service',
      ],
      where: {
        roles: {
          name: 'customer',
        },
      },
      select: [
        'id',
        'email',
        'roles',
        'profilePicture',
        'fullName',
        'phoneNumber',
        'status',
        'createdAt',
        'dateOfBirth',
        'bookings',
        'interests',
      ],
    });

    return customers;
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.bookingRepository.delete({ user: { id: id } });

    const customer = await this.MobileUserRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.MobileUserRepository.delete(id);
  }

  async getCustomersByService(serviceIds: number[]): Promise<MobileUser[]> {
    return this.MobileUserRepository.find({
      where: {
        bookings: {
          service: {
            id: In(serviceIds), // Ensure we check for multiple service IDs
          },
        },
      },
      relations: ['bookings'],
    });
  }

  async getCustomersByClass(classIds: number[]): Promise<User[]> {
    return this.userRepository.find({
      where: {
        bookings: {
          class: {
            id: In(classIds),
          },
        },
      },
      relations: ['bookings', 'bookings.class', 'bookings.session.class'],
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { roles, ...userData } = updateUserDto;
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (roles && roles.length > 0) {
      const roleEntities = await this.roleRepository.findBy({
        id: In(roles),
      });

      if (!roleEntities.length) {
        throw new NotFoundException('No valid roles found');
      }

      user.roles = roleEntities;
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    Object.assign(user, userData);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findByIdWithRoles(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'], // ✅ Ensure we fetch roles & permissions
    });
  }

  async createUser(
    email: string,
    password: string,
    roles: Role[],
  ): Promise<User> {
    const user = new User();
    user.email = email;
    user.password = password;
    user.roles = roles;
    return this.userRepository.save(user);
  }

  async findRolesByName(roleNames: string[]): Promise<Role[]> {
    return this.userRepository.manager.find(Role, {
      where: roleNames.map((name) => ({ name })),
      relations: ['permissions'],
    });
  }
}
