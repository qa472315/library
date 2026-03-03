import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../../common/utils/enums';
@Entity('user')
export class User{
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // 你看到的 ≠ DB 看到的
  // DB 看到的 ≠ index 看到的
  @Column({ unique: true, type: 'varchar', length: 100 })
  email_original!: string;

  @Column({ unique: true, type: 'varchar', length: 100 })
  email_normalized!: string;

  @Column({ type: 'varchar', length: 100 })
  password!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User,
  })
  role!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}