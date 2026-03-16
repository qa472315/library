import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    @InjectRedis()
    private redis: Redis,
  ) {
    super({
      // 從 HTTP Header 的 Authorization: Bearer <token> 取得 JWT
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 身分驗證
      // secretOrKey: process.env.JWT_SECRET,
      secretOrKey: config.get<string>('JWT_SECRET'),
    })
  }

  // JWT 驗證成功後，自動被呼叫, 回傳值自動塞進 req.user
  async validate(payload: any) {
    const exists = await this.redis.exists(`session:${payload.jti}`);

    if (!exists) {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, role: payload.role, }
  }
}