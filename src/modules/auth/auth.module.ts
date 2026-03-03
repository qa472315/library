import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './jwtStrategy'
import { ConfigService } from '@nestjs/config'
// import { DatabaseModule } from '../../database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { Session } from '../../database/entities/session.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      // StringValue ≠ string ,  StringValue 是 jsonwebtoken 定義的「受限字串」
      useFactory: (config: ConfigService) => {
          return {
            // config.getOrThrow 回傳型別：string ,保證不會是 undefined, 若沒設 env → 啟動直接 err
            secret: config.getOrThrow<string>('JWT_SECRET'),
            signOptions: {
              // TS 無法從 runtime string 推導 template literal 所以用 any  // 15m 或 '1h', '7d' 或 Unix timestamp（秒）
              expiresIn: config.getOrThrow<string>('JWT_EXPIRES_IN') as any,
            },
          }
        },
    }),
  ],
  controllers: [
    AuthController, 
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}