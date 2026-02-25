import { Controller, Get, Post, Body, Req, UnauthorizedException, Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, RegisterDto } from './dto/create-auth.dto';
import { User } from './decorator/users.controller';
import { Access, Public } from './decorator/roles.decorator';
import { Role } from '../../common/utils/enums';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: CreateAuthDto,
  @Res({ passthrough: true }) res: Response,
  ) {
    // 將 jwt 的 token 塞入 body
    // return this.authService.login(dto.email, dto.password);
    // test
    const refreshToken = await this.authService.login(dto.email, dto.password);
    const accessToken = await this.authService.refresh(refreshToken);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS 才送
      sameSite: 'lax',
      path: '/auth/refresh', // 建議只給 refresh API 用
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 天
    });
    return accessToken;
  }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    // return this.authService.register(dto.email, dto.password);
  }

  @Public()
  @Post('refresh')
  refresh(@Req() req: Request,){
    const refreshToken = req.cookies?.refreshToken;
    if(!refreshToken) throw new UnauthorizedException('Missing refresh token');
    return this.authService.refresh(refreshToken);
  }

  @Access(Role.Admin, Role.User)
  @Get('me')
  getProfile(@User() user: any) {
    return user;
  }
}
