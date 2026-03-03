import { Test, } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAccessModule } from '../test.module';
import { loginAs } from './helpers/login-as'
import { Role } from '../../src/common/utils/enums';
import { sleep } from '../../src/common/utils/time';
import { RolesGuard } from '../../src/modules/auth/roles.guard' 
import { JwtAuthGuard } from '../../src/modules/auth/jwtAuthGuard'
import { DataSource } from 'typeorm';
import { User } from '../../src/database/entities/user.entity';
import { seed } from '../seed'
export async function changeRole(app: INestApplication, role: Role){
    const dataSource = app.get(DataSource);
    const userRepo = dataSource.getRepository(User);
    await userRepo.update(
      {email_original: 'admin@test.com',},
      {role: role,},
    )
}
describe('Access Control (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TestAccessModule],
    }).compile();

    app = module.createNestApplication();
    // app.useGlobalGuards(
    //   app.get(JwtAuthGuard),
    //   app.get(RolesGuard),
    // );
    await app.init();
    await seed(app);

    adminToken = await loginAs(app, Role.Admin);
    userToken = await loginAs(app, Role.User);
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
  afterAll(async () => {
    await app.close();
  });
});
  
