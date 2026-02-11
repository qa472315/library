import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 身分驗證
      // secretOrKey: process.env.JWT_SECRET,
      secretOrKey: config.get<string>('JWT_SECRET'),
    })
  }

  // JWT 驗證成功後，自動被呼叫, 回傳值自動塞進 req.user
  validate(payload: any) {
    return { userId: payload.sub, role: payload.role, }
  }
}