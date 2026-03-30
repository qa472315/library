import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Unique } from 'typeorm';

@Entity('books')
@Unique(['title','author'])
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'varchar', length: 50 })
  category!: string;

  @Column({ type: 'varchar', length: 100 })
  author!: string;

  // 這個判斷轉給 Borrow 
  // @Column({ type: 'boolean', default: true })
  // isAvailable!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}

// deletedAt : 刪除（其實是標記）
// 一般 find 會自動忽略被刪的
// 避免使用者誤刪 & 歷史紀錄