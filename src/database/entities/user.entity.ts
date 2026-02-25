import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user')
export class User{
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true,type: 'varchar', length: 100 })
  email_original!: string;

  @Column({ unique: true,type: 'varchar', length: 100 })
  email_canonical!: string;

  @Column({ type: 'varchar', length: 20 })
  password!: string;

  @Column({ default: 'user' })
  role!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}