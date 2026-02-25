import { Injectable, Inject, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { Repository, DataSource, } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../database/entities/user.entity';
import { Role } from '../../common/utils/enums';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  // private readonly userRepository: Repository<User>;
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    // @Inject('DATA_SOURCE')
    // private readonly dataSource: DataSource,
  ) {
    // this.userRepository = this.dataSource.getRepository(User);
  }
  // bcrypt.hash(password, saltRounds) saltRounds = hash 計算要「慢幾倍」的開關, 數字每 +1，運算時間大約 ×2, cost = 2 ^ saltRounds 次的 key expansion
  private readonly saltRounds = 10;
  async login(email: string, password: string) {
    email = email.trim().toLowerCase();

    if(email === 'admin@test.com') {
      const refreshToken = this.jwtService.sign(
        { sub: 'admin-id',
          role: Role.Admin },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      );
    this.testToken.push(refreshToken);
      return refreshToken;
    }else if (email === 'user@test.com'){
       const refreshToken = this.jwtService.sign(
        { sub: 'admin-id',
          role: Role.User },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      );
      this.testToken.push(refreshToken);
      return refreshToken;
    }
    
    // const user = await  this.userRepository
    //   .createQueryBuilder('user')
    //   .select(['user.id', 'user.role', 'user.password'])
    //   .where('user.email = :email', {email})
    //   .getOne();
    // const user = await  this.userRepository.findOne({
    //   where: { email },
    //   select: ['id', 'role', 'password'],
    // });
    // if (!user) {
    //   throw new UnauthorizedException('Email or password incorrect');
    // }
    // // 密碼不能直接拿來比
    // const isPasswordValid = await bcrypt.compare(password, user.password);

    // if (!isPasswordValid) {
    //   throw new UnauthorizedException('Email or password incorrect');
    // }

    // const payload = {
    //   // JWT 標準欄位（subject）不該放敏感或會變動的資料, token 要「小、穩定、可快取」
    //   sub: user.id,
    //   role: user.role
    // }
    
    // throw new Error()	500 Internal Server Error
    // throw new UnauthorizedException()	401
    // throw new ForbiddenException()	403
    // throw new NotFoundException()	404
  throw new UnauthorizedException('Invalid credentials');
    // return {
    //   accessToken: this.jwtService.sign( payload, ),
    // }
  }

  async logout (refreshToken){
    this.testToken.splice(this.testToken.indexOf(refreshToken));
  }

  // async register(email: string, password: string) {
  //   email = email.trim().toLowerCase();
  //   const exists = await this.userRepository.findOne({
  //     where: { email },
  //     select: ['id'],
  //   });
  //   if(exists) {
  //     throw new ConflictException('Email already exists');
  //   }
  //   const hashedPassword = await bcrypt.hash(password, this.saltRounds);
  //   try{
  //     const newUser = this.userRepository.create({
  //       email: email,
  //       password: hashedPassword,
  //     })
  //     await this.userRepository.save(newUser);
  //   } catch (error){
  //     if (
  //       typeof error === 'object' &&
  //       error !== null &&
  //       'code' in error &&
  //       (error as any).code === '23505'
  //     ) {
  //       throw new ConflictException('Email already exists');
  //     }
  //   }
  //   return { success: true };;
  // }

  private testToken:string[] = [];
  async refresh(refreshToken: string){
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.config.get('JWT_REFRESH_SECRET')
    })
    // test
    if(!this.testToken.some((tokenT)=> tokenT == refreshToken)) throw new UnauthorizedException('Refresh token Error')

    // 要和　Redis 的再對比
    // if(!token || bcrypt.compare(refreshToken, token.tokenHash)) throw new UnauthorizedException('Refresh token Error');
    // if(!token) throw new UnauthorizedException('Refresh token Error');
    
    const newAccessToken = this.jwtService.sign(    
      { sub: payload.sub, role: payload.role },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: '15m',
      },
    )

    return { accessToken: newAccessToken };
  }

  async revoke(refreshToken: string) {
    this.testToken.splice(this.testToken.indexOf(refreshToken));
  }
}
