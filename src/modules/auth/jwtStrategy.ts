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
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // fromExtractors():依序執行 extractor,誰先拿到 token 就用誰
      jwtFromRequest: ExtractJwt.fromExtractors([
        // HTTP Authorization Header: 從 HTTP header 取 token
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Cookie: 如果 request cookie 有 access_token就拿來當 JWT, 要搭配 cookie-parser
        JwtStrategy.cookieExtractor,
        // WebSocket: 
        JwtStrategy.wsExtractor,
        // GraphQL:
        JwtStrategy.gqlExtractor,
      ]),
      // 身分驗證
      // secretOrKey: process.env.JWT_SECRET,
      secretOrKey: config.get<string>('JWT_SECRET'),
    })
  }

  private static cookieExtractor(req: any): string | null {
    return req?.cookies?.access_token || null
  }

  private static wsExtractor(req: any): string | null {
    return req?.handshake?.auth?.token || null
  }

  private static gqlExtractor(req: any) {
    return req?.req?.headers?.authorization?.split(' ')[1] || null
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