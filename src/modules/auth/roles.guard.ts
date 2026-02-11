import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCESS_KEY, AccessMeta  } from './decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // ExecutionContext: 請求的全部上下文資訊 REST, GraphQL, WebSocket, RPC
  canActivate(context: ExecutionContext): boolean {
    // 1. 取得 @Roles() 設定的角色
    // 為了例外聲明（Exception Rule), 所以覆蓋
    const access = this.reflector.getAllAndOverride<AccessMeta>(
      ACCESS_KEY ,
      // 因為「越靠近實際行為的地方，權限語意越精準」,所以 method > controller > module→ 越細的設定，應該能蓋掉越粗的設定。
      [
        context.getHandler(), // method
        context.getClass(),   // controller
      ],
    );
    // type public → 直接放行
    if (access.type === 'public') {
      return true;
    }

    // 2. 取得 request 裡的 user（通常由 JwtAuthGuard 塞的）
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // 沒登入 / 沒 user
    if (!user || !user.role) {
      return false;
    }
    // protected + roles → 驗角色
    if (access.roles?.length) {
      // return access.roles.includes(user.role);
      // 上面可行,下面更嚴謹
      // getAllAndOverride 會拿到 method-level metadata 優先於 controller-level 
      // access.roles 與 user.role 都轉成字串比對，避免 enum/字串 reference mismatch
      const allowedRoles = access.roles.map(r => r.toString());
      if (allowedRoles.includes(user.role.toString())) return true;
      return false;
    }

    // protected 無 roles → 禁止
    return false;
  }
}