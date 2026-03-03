import { Test, } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAccessModule } from '../test.module';
import { loginAs } from './helpers/login-as'
import { Role } from '../../src/common/utils/enums';
import { DataSource } from 'typeorm';
// import { User } from '../../src/database/entities/user.entity';
import { Session } from '../../src/database/entities/session.entity';
import { seed } from '../seed';
import cookieParser from 'cookie-parser';

export async function changeRole(app: INestApplication, role: Role){
}
describe('Access Control (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  // error: 類型 'TestAgent<Test>' 不可指派給類型 'SuperAgentTest'
  // let agent: request.SuperAgentTest;
  // 新版 supertest 的型別: TestAgent<Test>
  let agent: ReturnType<typeof request.agent>;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TestAccessModule],
    }).compile();

    app = module.createNestApplication();
    // app.useGlobalGuards(
    //   app.get(JwtAuthGuard),
    //   app.get(RolesGuard),
    // );
    app.use(cookieParser());
    await app.init();
    await seed(app);

    adminToken = await loginAs(app, Role.Admin);
    userToken = await loginAs(app, Role.User);
    // 要用 agent 才能保留 cookie
    agent = request.agent(app.getHttpServer());
  });

  it('public route should be accessible without token', () => {
    return request(app.getHttpServer())
      .get('/test-access/public')
      .expect(200);
  });

  it('protected route without token → 401', () => {
    return request(app.getHttpServer())
      .get('/test-access/admin-only')
      .expect(401);
  });

  it('admin-only route should reject user', () => {
    return request(app.getHttpServer())
      .get('/test-access/admin-only')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('admin-only route should allow admin', () => {
    return request(app.getHttpServer())
      .get('/test-access/admin-only')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('should register new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'newuser@test.com',
        password: 'password123',
      })
      .expect(201);
    // 驗證 register 回傳: { "success": true }, toEqual 是深層比較（deep equal）
    // toBe 比 reference, toEqual 比內容
    expect(res.body).toEqual({ success: true });
  });

  it('should not allow duplicate email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      })
      .expect(409);
  });
  // 現在會擋沒設定權限的路徑回傳 Error
  // it('protected with no roles should be forbidden', () => {
  //   return request(app.getHttpServer())
  //     .get('/test-access/protected-no-role')
  //     .set('Authorization', `Bearer ${adminToken}`)
  //     .expect(403);
  // });

  it('method-level Access should override controller-level', () => {
    return request(app.getHttpServer())
      .get('/test-access/user-route')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
  });

  it('access expired → refresh → continue', async () => {
    const now = new Date();
    // 可以把時間「凍結」或「往未來跳」
    jest.useFakeTimers();
    jest.setSystemTime(new Date(now.getTime() + 900000));
    // const jwtService = app.get(JwtService);
    // const shortToken = jwtService.sign(payload, { expiresIn: '1s' });
    // await sleep(1500);
    await request(app.getHttpServer())
      .get('/test-access/user-route')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(401);
    jest.useRealTimers();
    });
  // it('method-level Access should override controller-level', () => {
  //   return request(app.getHttpServer())
  //     .get('/test-access/user-route')
  //     .set('Authorization', `Bearer ${userToken}`)
  //     .expect(200);
  // });

    // refresh token 被 revoke 後不能再使用
  it('login → logout → refresh should fail', async () => {
    jest.useRealTimers(); // 確保不是 fake time
    // 1️⃣ login
    const loginRes = await agent
      .post('/auth/login')
      .send({
        email: 'user@test.com',
        password: 'password123',
      })
      .expect(201);
    // refreshToken: loginRes.headers['set-cookie']
    const accessToken = loginRes.body.accessToken;
    // 確保 accessToken !== undefined
    expect(accessToken).toBeDefined();
    // 2️⃣ logout
    await agent
      .post('/auth/logout')
      // .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);
    const dataSource = app.get(DataSource);
    const sessionRepo = dataSource.getRepository(Session);
    const sessions = await sessionRepo.find();
    expect(
      sessions.some(s => s.revoked === true)
    ).toBe(true);
    // 3️⃣ try refresh (should fail because revoked)
    await agent
      .post('/auth/refresh')
      .expect(401);
  });
  
  // 關閉 Nest app, 釋放 DB 連線, 防止 Jest open handle error
  afterAll(async () => {
    await app.close();
  })
});
  
