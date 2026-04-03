import { Injectable, UnauthorizedException, ConflictException, NotFoundException ,} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { Book } from '../../database/entities/book.entity';
import { InjectRepository, } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, IsNull} from 'typeorm';
import { Borrow } from '../../database/entities/borrow.entity';
import { User } from '../../database/entities/user.entity';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { BookCounter } from '../../database/entities/book_counter.entity';
// async return(...): Promise<Borrow>
// async borrow(...): Promise<Borrow>
// async delete(...): Promise<void>
@Injectable()
export class BookService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    // @InjectRepository(Borrow)
    // private readonly borrowRepository: Repository<Borrow>,
    // @InjectRepository(BookCounter)
    // private readonly bookCounterRepository: Repository<BookCounter>,
    @InjectRedis()
    private readonly redis: Redis,
  ){

  }

  async create(dto: CreateBookDto) :Promise<Book>{
    return await this.dataSource.transaction(async (manager) => {
      const book = manager.create(Book, dto);
      try{
        await manager.save(book);
      }catch(e: any){
        // 23505 是 PostgreSQL unique violation
        if(e.code === '23505'){
          throw new ConflictException('Book already exist')
        }
        throw e
      }
      return book;
    });
  }

  async delete (id:string) : Promise<void>{
    return await this.dataSource.transaction(async (manager) => {
      const result = await manager.softDelete(Book,id)

      if(result.affected === 0){
        throw new NotFoundException('Book not found')
      }
    })
  }

  async findAll():Promise<Book[]> {
    return await this.bookRepository.find();
  }

  async findOne(id: string):Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: {id: id}
    });
    // 404 資源不存在
    if(!book) throw new NotFoundException('Book not found');
    return book;
  }

  async findTop10(){
    const key = 'top10_books:v1'
    const cache = await this.redis.get(key);
    if(cache) return JSON.parse(cache); 

    // 防 cache stampede/cache avalanche
    const lock = await this.redis.set(
      'lock:top10',
      '1',
      'EX',
      5,
      'NX',
      )
    if(!lock){
      await new Promise(r=>setTimeout(r,50))
      const retry = await this.redis.get(key)
      if(retry) return JSON.parse(retry)
    }
    //因為 PGSQL 的 COUNT() 成本很高,所以要避免出現
    const query = await this.bookRepository.createQueryBuilder('book')
    .leftJoin(BookCounter, 'b', 'b.bookId = book.id')
    .select('book.id', 'id')
    .addSelect('book.author', 'author')
    .addSelect('book.title', 'title')
    .addSelect('b.borrowCount', 'amount')
    .orderBy('b.borrowCount', 'DESC')
    .addOrderBy('book.id', 'ASC')
    .limit(10)
    .getRawMany();
    // TTL 隨機化:避免全部同時過期
    const ttl = 600 + Math.floor(Math.random() * 30)
    await this.redis.set(key, JSON.stringify(query), 'EX', ttl);
    return query;
  }

  async borrow(user: User ,bookId: string):Promise<Borrow> {
    return await this.dataSource.transaction( async (manager) => {
      const book = await manager.findOne(
      Book,  
      {
        where: { id: bookId},
      });
      if(!book) throw new NotFoundException('Book not found');
      const borrow = manager.create(Borrow,{
        bookId:bookId,
        userId:user.id,
        dueAt: new Date(Date.now()+7*86400000)
      })
      // await manager.increment(BookCounter,
      //   { bookId: id },
      //   'borrowCount',
      //   1
      // )
      try{
        await manager.save(borrow)
        // Redis INCR 是 atomic
        await this.redis.incr(`book:borrow:${bookId}`)
      }catch(e){
        throw new ConflictException('Book already borrowed')
      }
      return borrow;
    })
  }

  async return(user: User ,id: string): Promise<Borrow> {
    return await this.dataSource.transaction( async (manager) => {
      const borrow = await manager.findOne(
        Borrow,
        { where: {  
          bookId: id,
          userId: user.id,
          returnedAt: IsNull(), // 在 SQL 裡： = NULL  ❌ 錯, IS NULL ✅ 正確
          },
          lock: { mode: 'pessimistic_write' }
        }
      )
      if(!borrow) throw new NotFoundException('Borrow not found');;
      borrow.returnedAt = new Date();
      await manager.save(Borrow, borrow);
      return borrow;
      })
    }
  }
