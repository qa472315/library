import { Global, Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigService, } from '@nestjs/config';
@Global()
@Module({
  imports: [
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        options: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
        // 決定 Redis 斷線後多久重新連線。times = 目前重連次數, 回傳值 = 下一次重連等待時間 (ms)
        // 最大 delay = 2000ms (2秒)
        retryStrategy(times) {
          return Math.min(times * 50, 2000);
        },
        // 每個 Redis command 最多 retry 幾次。通常 1 ~ 5
        maxRetriesPerRequest: 3,
        // 確保 Redis 真的 ready 才開始接受 command。
        enableReadyCheck: true,
        // Redis 建立 TCP 連線的最長等待時間。避免 Redis network hang
        connectTimeout: 10000,
        // 當 Redis 掛掉時直接 error, 避免 Redis 恢復時瞬間大量輸出, 避免 OOM crash(因可用記憶體不足，無法為資料結構分配空間而導致的崩潰)
        enableOfflineQueue: false,
        // 不要在建立 client 時立刻連線, 避免開 10 個 Redis connection 但只用 1 個
        lazyConnect: true,
      }),
    }),
  ],
  exports: [RedisModule],
})
export class InfraRedisModule {}