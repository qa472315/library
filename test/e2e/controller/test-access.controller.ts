// test-access.controller.ts
import { Controller, Get, Delete } from '@nestjs/common';
import { Access, Public } from '../../../src/modules/auth/decorator/roles.decorator';
import { Role } from '../../../src/common/utils/enums';

@Controller('test-access')
@Access(Role.Admin) // controller 預設 Admin
export class TestAccessController {

  @Public()
  @Get('public')
  publicRoute() {
    return 'ok';
  }

  @Get('admin-only')
  adminOnly() {
    return 'admin';
  }
  
  // 現在會擋沒設定權限的路徑回傳 Error
  // @Access()
  // @Get('protected-no-role')
  // protectedNoRole() {
  //   return 'protected';
  // }

  @Access(Role.User)
  @Get('user-route')
  userRoute() {
    return 'user';
  }
}
