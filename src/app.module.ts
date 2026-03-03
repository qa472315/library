import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './modules/book/book.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/jwtAuthGuard';
import { RolesGuard } from './modules/auth/roles.guard';
import { DatabaseModule } from './database/database.module';
import { SessionService } from './modules/auth/session.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 全專案可用
    }),
    DatabaseModule,  // forRoot() 註冊 DataSource provider, forFeature() 需要 DataSource
    BookModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    // 全域 Guard 的註冊 token不用在每個 Controller 或每個 Route 上加 @UseGuards(...)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AppService,
    SessionService],
})
export class AppModule {}
