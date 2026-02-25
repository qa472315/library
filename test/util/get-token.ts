import request from 'supertest';
import { app } from '../setup-e2e';

export const getAccessToken = async () => {
  const email = 'test@test.com';
  const password = '123456';

  // register
  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, password });

  // login
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });

  return res.body.accessToken;
};