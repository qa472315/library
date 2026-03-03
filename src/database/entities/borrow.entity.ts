import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,  } from 'typeorm';

@Entity('borrow')
export class Borrow{

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  bookId!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  // 到期時間
  @Column({ type: 'timestamptz' })
  dueAt!: Date;

  @Column({
    type: 'timestamptz',
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