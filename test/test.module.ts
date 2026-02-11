import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService, ConfigModule } from '@nestjs/config'
import { TestAccessController } from './e2e/controller/test-access.controller'
import { RolesGuard } from '../src/modules/auth/roles.guard' 
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from '../src/modules/auth/auth.service'
import { JwtStrategy } from '../src/modules/auth/jwtStrategy'
import { AuthModule } from '../src/modules/auth/auth.module'
import { JwtAuthGuard } from '../src/modules/auth/jwtAuthGuard'
@Module({
  imports: [
    // 測試的環境獨立於原先環境, 所以在 app.module 設的全域 ConfigModule 不能用 
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.getOrThrow<string>('JWT_EXPIRES_IN') as any },
      }),
    }),
    AuthModule,
  ],
  controllers: [
    TestAccessController
  ],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [],
})
export class TestAccessModule {}