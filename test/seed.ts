// test/seed.ts
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../src/database/entities/user.entity';
import { Role } from '../src/common/utils/enums';

export async function seed(app: INestApplication) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('❌ seed.ts should only run in test environment');
  }
  const dataSource = app.get(DataSource);
  await dataSource.synchronize(true);
  const userRepo = dataSource.getRepository(User);
  // 💣 保證可重跑（先清乾淨）
  // await userRepo.delete({});

  const password = await bcrypt.hash('password123', 10);
  // email_original 原始 email
  // email_normalized 正規化後儲存, 搜尋 / 比較使用 normalized 欄位, normalization 規則可能變化
  await userRepo.save([
    userRepo.create({
      email_original: 'admin@test.com',
      email_normalized: 'admin@test.com'.trim().toLowerCase(),
      password,
      role: Role.Admin,
    }),
    userRepo.create({
      email_original: 'user@test.com',
      email_normalized: 'user@test.com'.trim().toLowerCase(),
      password,
      role: Role.User,
    }),
  ]);
}
