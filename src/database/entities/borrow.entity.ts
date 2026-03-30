import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index, } from 'typeorm';

@Entity('borrow')
// PostgreSQL 專用
@Index('uniq_active_borrow', ['bookId'], {
  unique: true,
  where: `"returnedAt" IS NULL`,
})
@Index(['userId','returnedAt'])
export class Borrow{

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  bookId!: string;

  @Column()
  userId!: string;

  // 到期時間
  @Index()
  @Column({ type: 'timestamptz' })
  dueAt!: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  returnedAt!: Date | null;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt!: Date;
}

// 要存 array 時:
// 可跨 Db, 能存複雜資料, 可索引, 可擴充
// @Column({
//   type: 'jsonb',
//   nullable: true,
// })
// history!: string[];