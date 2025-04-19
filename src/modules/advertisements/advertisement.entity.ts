import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('advertisements')
export class Advertisement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  image: string;

  @Column()
  link: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
