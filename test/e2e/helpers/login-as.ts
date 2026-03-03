// test/helpers/login-as.ts
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Role } from '../../../src/common/utils/enums';

export async function loginAs(
  app: INestApplication,
  role: Role,
): Promise<string> {
  const email =
    role === Role.Admin ? 'admin@test.com' : 'user@test.com';

  const password = 'password123';

  const res = await request(app.getHttpServer())
  .post('/auth/login')
  .send({ email, password })
  .expect(201);
  return res.body.accessToken;
}
