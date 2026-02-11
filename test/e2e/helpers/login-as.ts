// test/helpers/login-as.ts
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Role } from '../../../src/common/utils/enums';
import { JwtService } from '@nestjs/jwt';

export async function loginAs(
  app: INestApplication,
  role: Role,
): Promise<string> {
  const email =
    role === Role.Admin ? 'admin@test.com' : 'user@test.com';

  const password = 'password123';

  // const jwtService = app.get(JwtService);
  // const payload = { sub: email, role }; // role 必須是 Role.User 或 Role.Admin
  // const token = jwtService.sign(payload);
  // return token;

  const res = await request(app.getHttpServer())
  .post('/auth/login')
  .send({ email, password })
  .expect(201);
  return res.body.accessToken;
}
