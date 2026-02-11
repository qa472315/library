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
  const userRepo = dataSource.getRepository(User);

  // 💣 保證可重跑（先清乾淨）
  await userRepo.delete({});

  const password = await bcrypt.hash('password123', 10);

  await userRepo.save([
    userRepo.create({
      email: 'admin@test.com',
      password,
      role: Role.Admin,
    }),
    userRepo.create({
      email: 'user@test.com',
      password,
      role: Role.User,
    }),
  ]);
}
