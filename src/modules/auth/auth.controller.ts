import { Controller, Get, Post, Body, Req, UnauthorizedException, Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, RegisterDto } from './dto/create-auth.dto';
import { User } from './decorator/users.controller';
import { Access, Public } from './decorator/roles.decorator';
import { Role } from '../../common/utils/enums';


// 不使用 Request / Response, 使用 Nest 內建抽象
// import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private getCookieOptions(){
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/auth',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    };
  }
  @Public()
  @Post('login')
  async login(
    @Body() dto: CreateAuthDto,
  // @Res({ passthrough: true }) → 只能「搭配 Nest 自動 body」
  // 直接 primitive string → Nest 會當作 text/plain，supertest 解析 JSON 就是 {}
  // 解決方法 → 回傳物件 { accessToken }
    @Res({ passthrough: true }) res,
  ) {
    // 將 jwt 的 token 塞入 body
    // return this.authService.login(dto.email, dto.password);
    // test
    const {refreshToken, accessToken} = await this.authService.login(dto.email, dto.password);
    res.cookie('refreshToken', refreshToken, this.getCookieOptions());
    // {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production', // HTTPS 才送
    //   sameSite: 'lax',
    //   path: '/auth', // 建議只給 refresh API 用
    //   maxAge: 1000 * 60 * 60 * 24 * 7, // 7 天
    // });
    return {accessToken};
  }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Public()
  @Post('logout')
  async logout(@
    Req() req,
    @Res({ passthrough: true }) res,) 
  {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    // clear 的時候也必須和當初設定的一模一樣
    res.clearCookie("refreshToken", this.getCookieOptions())
    return await this.authService.logout(refreshToken);
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req,
    @Res({ passthrough: true }) res,
  ){
    const oldRefreshToken = req.cookies?.refreshToken;
    if(!oldRefreshToken) throw new UnauthorizedException('Missing refresh token');
    const { accessToken, refreshToken } = await this.authService.refresh(oldRefreshToken);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS 才送
      sameSite: 'lax',
      path: '/auth', // 建議只給 refresh API 用
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 天
    });
    return {accessToken};
  }

  @Access(Role.Admin, Role.User)
  @Get('me')
  getProfile(@User() user: any) {
    return user;
  }
}
