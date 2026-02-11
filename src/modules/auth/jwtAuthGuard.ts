import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCESS_KEY, AccessMeta } from './decorator/roles.decorator';

// AuthGuard('jwt') 內部其實已經做了以下事情：
// 從 HTTP request 的 header 裡抓 Authorization: Bearer <token>。
// 把 <token> 交給 JwtStrategy.validate() 去驗證。
// 驗證成功就把 payload 塞進 req.user。
// 驗證失敗就直接 throw 401 Unauthorized。
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const access = this.reflector.getAllAndOverride<AccessMeta>(
      ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );
    // public route → 跳過驗 token
    if (access?.type === 'public') {
      return true;
    }

    // protected route → 驗 token
    return super.canActivate(context);
  }
}