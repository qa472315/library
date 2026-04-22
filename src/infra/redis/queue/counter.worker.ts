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
  // 600000 = 10 分鐘
  @Interval(600000)
  async flushCounter(){
    const lock = await this.redis.set(
      'lock:flushCounter',
      '1',
      'EX',
      120,
      'NX'
    )
    if (!lock) return;
    try {
      // KEYS 會掃描整個 Redis
      // const keys = await this.redis.keys('book:borrow:*');
      // const ids = await this.redis.smembers('book:borrow:keys')
      // if(!ids.length) return 
      //  const keys = ids.map(id => `book:borrow:${id}`)
      // mget 批次讀取
      // const counts = await this.redis.mget(...keys)
      
      const script = `
        local ids = redis.call('SMEMBERS', KEYS[1])             -- const ids = await redis.smembers(KEYS[1]);
        local result = {}

        for i=1,#ids do
            local id = ids[i]
            local key = ARGV[1] .. id
            local count = redis.call('GET', key)

            if count then
                redis.call('SET', key, '0')
            else
                count = '0'
            end

            table.insert(result, id)                             -- result.push(id)
            table.insert(result, count or '0')
        end

        redis.call('DEL', KEYS[1])

        return result
      `;

      // 前 numKeys 個是 KEYS[],剩下是 ARGV[]
      const raw = await this.redis.eval(
        script,
        1,
        'book:borrow:keys',
        'book:borrow:'
      ) as string[];
      if (!raw.length) return;

      const params: any[] = []
      const placeholders: string[] = []

      for (let i = 0; i < raw.length; i += 2) {
      const id = raw[i];
      const count = Number(raw[i + 1]) || 0;

      const idx = i;
      placeholders.push(`($${idx + 1},$${idx + 2})`);
      params.push(id, count);
    }
      // const pipeline = this.redis.pipeline()
      

      // ids.forEach(id => {
      //   pipeline.getset(`book:borrow:${id}`, '0');
      // });

      // const results = await pipeline.exec()

      // results?.forEach((res,i) => {
      //   const count = Number(res[1]) || 0;
      //   // 為什麼 *2 ? 因為一筆資料有 2個欄位
      //   // [member, score, member, score, member, score]
      //   const idx = i * 2
      //   placeholders.push(`($${idx+1},$${idx+2})`)   // placeholders.join(',') => ($1,$2),($3,$4),($5,$6)
      //   params.push(ids[i], count)
      // })

      // EXCLUDED 是 PostgreSQL 在 UPSERT 時提供的 新資料
      await this.dataSource.query(`
          INSERT INTO book_counter (bookId, borrowCount)
          VALUES ${placeholders.join(',')}
          ON CONFLICT (bookId)
          DO UPDATE
          SET borrowCount = book_counter.borrowCount + EXCLUDED.borrowCount
        `, params)
        
      // await this.redis.del('book:borrow:keys');
    }finally{
      await this.redis.del('lock:flushCounter');
    }
    // await this.redis.del(...keys)
    // 清理 redis
    // const pipeline = this.redis.pipeline()
    // // Redis 指令不支援 *
    // ids.forEach(id => {
    //   pipeline.del(`book:borrow:${id}`)
    // })
    // pipeline.del('book:borrow:keys')
    // await pipeline.exec()
  }
}