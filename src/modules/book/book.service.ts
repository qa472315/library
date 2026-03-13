import { Injectable, UnauthorizedException, } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from '../../database/entities/book.entity';
import { InjectRepository, } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, IsNull} from 'typeorm';
import { Borrow } from '../../database/entities/borrow.entity';
import { User } from '../../database/entities/user.entity';

// async return(...): Promise<Borrow>
// async borrow(...): Promise<Borrow>
// async delete(...): Promise<void>
@Injectable()
export class BookService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ){

  }

  async create(dto: CreateBookDto) :Promise<Book>{
    return await this.dataSource.transaction(async (manager) => {
      if(await manager.findOne(Book,{
        where: {title: dto.title, author: dto.author}
      })) throw new UnauthorizedException('Book is already exist');
      const book:Book = await manager.create(
        Book,
        {
        title: dto.title,
        author: dto.author,
        isAvailable: true,
        category: dto.category
      })
      await manager.save(Book, book)
      return book;
    });
  }

  async delete (id:string) : Promise<void>{
    return await this.dataSource.transaction(async (manager) => {
      await manager.softDelete(Book,id);
    })
  }

  async findAll():Promise<Book[]> {
    return await this.bookRepository.find();
  }

  async findOne(id: string):Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: {id: id}
    });
    if(!book) throw new UnauthorizedException('Book not found');
    return book;
  }

  async borrow(user: User ,id: string):Promise<Borrow> {
    return await this.dataSource.transaction( async (manager) => {
      const book = await manager.findOne(
      Book,  
      {
        where: { id: id},
        lock: { mode: 'pessimistic_write' }
      });
      const activeBorrow  = await manager.findOne(
      Borrow,  
      {
        where: { book: book?.id, returnedAt: IsNull()},
      });
      if(!book) throw new UnauthorizedException('Book not found');
      if (activeBorrow ) throw new UnauthorizedException('Book already borrowed');
      const borrow = await manager.create(
        Borrow,
        {
          bookId: book.id,
          userId: user.id,
          dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }
      )
      await manager.save(Borrow, borrow);
      return borrow;
    })
  }

  async return(user: User ,id: string): Promise<Borrow> {
    return await this.dataSource.transaction( async (manager) => {
      const borrow = await manager.findOne(
        Borrow,
        { where: {  
          book: id,
          user: user.id,
          returnedAt: IsNull(), // 在 SQL 裡： = NULL  ❌ 錯, IS NULL ✅ 正確
          },
          lock: { mode: 'pessimistic_write' }
        }
      )
      if(!borrow) throw new UnauthorizedException('Borrow not found');;
      borrow.returnedAt = new Date();
      await manager.save(Borrow, borrow);
      return borrow;
      })
    }
  }
