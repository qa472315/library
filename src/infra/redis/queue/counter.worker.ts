import { Injectable, } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { DataSource,} from 'typeorm';
import { Interval } from '@nestjs/schedule';
@Injectable()
export class CountWorker{
  constructor(
    @InjectRedis() private redis: Redis,
    private dataSource: DataSource,
  ) {}

  // 每 10000 ms = 10 s 執行一次
  @Interval(600000)
  async flushCounter(){
    // KEYS 會掃描整個 Redis
    // const keys = await this.redis.keys('book:borrow:*');
    const ids = await this.redis.smembers('book:borrow:keys')
    if(!ids.length) return 
     const keys = ids.map(id => `book:borrow:${id}`)
    // mget 批次讀取
    const counts = await this.redis.mget(...keys)

    const params: any[] = []
    const placeholders: string[] = []

    ids.forEach((id,i) => {
      const count =  Number(counts[i]) || 0
      // 為什麼 *2 ? 因為一筆資料有 2個欄位
      // [member, score, member, score, member, score]
      const idx = i * 2
      placeholders.push(`($${idx+1},$${idx+2})`)   // placeholders.join(',') => ($1,$2),($3,$4),($5,$6)
      params.push(id, count)
    })

    // EXCLUDED 是 PostgreSQL 在 UPSERT 時提供的 新資料
    await this.dataSource.query(`
        INSERT INTO book_counter (bookId, borrowCount)
        VALUES ${placeholders.join(',')}
        ON CONFLICT (bookId)
        DO UPDATE
        SET borrowCount = book_counter.borrowCount + EXCLUDED.borrowCount
      `, params)

    // await this.redis.del(...keys)
    // 清理 redis
    const pipeline = this.redis.pipeline()
    // Redis 指令不支援 *
    ids.forEach(id => {
      pipeline.del(`book:borrow:${id}`)
    })
    pipeline.del('book:borrow:keys')
    await pipeline.exec()
  }
}