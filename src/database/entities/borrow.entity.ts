import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn,} from 'typeorm';
import { Book } from './book.entity';
import { User } from './user.entity';

@Entity('borrow')
export class Borrow{

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: string;

  // 到期時間
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