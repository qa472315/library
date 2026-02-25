import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, } from 'typeorm';

@Entity('session')
export class Session {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  userId!: string;

  @Column({ type: 'varchar', length: 100 })
  refreshTokenHash!: string;

  @Column({ type: 'varchar', length: 50 })
  deviceId!: string;

  @Column({ type: 'varchar', length: 100, default: null})
  parentTokenId!: string;

  @Column({ type: 'varchar', length: 50 })
  ipPrefix !: string;

  @Column({ type: 'varchar', length: 50 })
  deviceFingerprint !: string;

  @Column({ type: 'varchar', length: 50 })
  replacedBy  !: string;

  @Column({ type: 'boolean', default: false })
  revoked!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;
}