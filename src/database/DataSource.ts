import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Book } from './entities/book.entity';
dotenv.config();
const configService = new ConfigService();

export const AppDataSource = new DataSource({
  name: 'default',
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  timezone: 'Z', // UTC+0
  entities: [
    User,
    Book,
  ],
  synchronize: false,
  extra: {
    connectionLimit: 200, // 根据需求调整连接池大小
  },
});