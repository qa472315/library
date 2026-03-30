import { Entity, Column, PrimaryColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('book_counter')
export class BookCounter {
  @PrimaryColumn()
  bookId!: string;

  @Column({ type: 'bigint', default: 0 })
  borrowCount!: number;

  @UpdateDateColumn()
  updatedAt!: Date;
}
