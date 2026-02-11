import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('Borrow')
export class Book{

  @PrimaryColumn({
    type: 'char',
    length: 100,
    nullable: false,
  })
  id!: string;

  @Column({
    type: 'char',
    length: 100,
    nullable: false,
  })
  title!: string;

  @Column({
    type: 'char',
    nullable: false,
  })
  author!: string;

  @Column({
    default: true
  })
  isAvailable!: boolean;

  @Column({
    type: 'tinyint',
    default: 0,
  })
  borrowCount!: number;

  @Column({
    type: 'char',
    nullable: true,
  })
  history!: string[];

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt!: Date;
}