import { Entity, Column, PrimaryColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('book_counter')
@Index('idx_borrow_count', ['borrowCount'])
export class BookCounter {
  @PrimaryColumn()
  bookId!: string;

  @Column({ type: 'bigint', default: 0 })
  borrowCount!: number;

  @UpdateDateColumn()
  updatedAt!: Date;
}
