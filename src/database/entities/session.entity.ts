import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, } from 'typeorm';

@Entity('session')
export class Session {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  userId!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  refreshTokenHash!: string;

  @Column({ type: 'varchar', length: 100 })
  deviceId!: string;

  @Column({ type: 'varchar', length: 100, nullable: true})
  parentTokenId!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipPrefix !: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceFingerprint !: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
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