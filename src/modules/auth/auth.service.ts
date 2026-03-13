import { Injectable, UnauthorizedException, ConflictException,} from '@nestjs/common';
import { Repository, DataSource, EntityManager,} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../database/entities/user.entity';
import { Session } from '../../database/entities/session.entity';
import { Role } from '../../common/utils/enums';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  // private readonly userRepository: Repository<User>;
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private dataSource: DataSource,
    // @Inject('DATA_SOURCE')
    // private readonly dataSource: DataSource,
    // @InjectRepository(User)
    // private readonly userRepository: Repository<User>,
    // @InjectRepository(Session)
    // private readonly sessionRepository: Repository<Session>,
  ) {
    // this.userRepository = this.dataSource.getRepository(User);
  }
  // bcrypt.hash(password, saltRounds) saltRounds = hash 計算要「慢幾倍」的開關, 數字每 +1，運算時間大約 ×2, cost = 2 ^ saltRounds 次的 key expansion
  private readonly saltRounds = 10;
  async login(email: string, password: string) {
    return await this.dataSource.transaction(async (manager) => {
      email = email.trim().toLowerCase();
      // const user = await  this.userRepository
      //   .createQueryBuilder('user')
      //   .select(['user.id', 'user.role', 'user.password'])
      //   .where('user.email = :email', {email})
      //   .getOne();
      const user = await  manager.findOne(
       User,
      {
        where: { email_normalized: email },
        select: ['id', 'role', 'password'],
      });

      if (!user) {
        throw new UnauthorizedException('Email or password incorrect');
      }
      // 密碼不能直接拿來比
      // compare 會自動：從 user.password 取出 salt,用同樣 salt hash,再比對
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Email or password incorrect');
      }

      // const payload = {
      //   // JWT 標準欄位（subject）不該放敏感或會變動的資料, token 要「小、穩定、可快取」
      //   sub: user.id,
      //   role: user.role
      // }
      const sesion = await this.createSession(manager, user.id, "Null");

      const refreshToken = await this.generateRefreshToken(user.id, user.role, sesion.id);

      sesion.refreshTokenHash = await bcrypt.hash(refreshToken, this.saltRounds);

      await manager.save(Session, sesion);

      const accessToken = await this.generateAccessToken(
        user.id,
        user.role,
      );
      
      return {refreshToken: refreshToken, accessToken: accessToken};
      // throw new Error()	500 Internal Server Error
      // throw new UnauthorizedException()	401
      // throw new ForbiddenException()	403
      // throw new NotFoundException()	404
      // throw new UnauthorizedException('Invalid credentials');
      // return {
      //   accessToken: this.jwtService.sign( payload, ),
      // }
    })
  }

  async logout (refreshToken){
    return await this.dataSource.transaction(async (manager) => {
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
    });
      await this.revoke(manager, payload.jti);
      return { success: true }
    })
  }

  async register(email: string, password: string) {
    return await this.dataSource.transaction( async (manager) => {
      const newEmail = email.trim().toLowerCase();
    const exists = await manager.findOne(
      User, 
      {
        where: { email_normalized: newEmail },
        select: ['id'],
        lock: { mode: 'pessimistic_write' },
      });
    if(exists) {
      throw new ConflictException('Email already exists');
    }
    // 之後可以讓前端先傳加密後的密碼再解密
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    try{
      const newUser = manager.create(
        User,
      {
        email_original: email,
        email_normalized: newEmail,
        password: hashedPassword,
      },)
      await manager.save(User ,newUser);
    } catch (error){
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as any).code === '23505'
      ) {
        throw new ConflictException('Email already exists');
      }
    }
    return { success: true };;
    })
  }

  async revoke(manager: EntityManager, jti: string){
    await manager.update(
      Session, 
      { id: jti},
      { revoked: true}
    )
  }

  async revokeAll(manager: EntityManager,userId: string){
    await manager.update(
      Session, 
      { userId: userId},
      { revoked: true}
    )
  }

  // private testToken:string[] = [];
  async refresh(refreshToken: string){
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET')
      })

      const newRefreshToken = await this.rotateSession(
        payload.jti,
        payload.sub,
        payload.role,
        refreshToken,
      );

      const newAccessToken = await this.generateAccessToken(
        payload.sub,
        payload.role,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch(error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException();
    }
    
  }

  async generateAccessToken(userId: string, role: string){
    try {
      return this.jwtService.sign(    
        { sub: userId, role: role },
        {
          secret: this.config.get('JWT_SECRET'),
          expiresIn: '15m',
        },
      )
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException();
    }

  }
  
  async generateRefreshToken(userId: string, role: string, jti: string){
    // jti = JWT ID
    const refreshToken = this.jwtService.sign(
      { sub: userId,
        role: role,
        jti: jti, },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );
    return refreshToken;
  }

  async createSession(manager: EntityManager,userId: string, parentTokenId: string){
    return await manager.save(Session,{
      userId: userId,
      // refreshTokenHash: await bcrypt.hash(refreshToken, this.saltRounds),
      deviceId: 'test',
      parentTokenId: parentTokenId,
      ipPrefix: 'test',
      deviceFingerprint: 'test',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
  }

  // 有 rotate 後, refresh token 是「可疑憑證」, 非「長期身份」
  // 防止 token replay, 防止被偷 refresh token, 可偵測 reuse 攻擊
  async rotateSession(oldJti: string, userId: string, role: string, refreshToken: string){
    return await this.dataSource.transaction(async (manager) => {
      const oldSession = await manager.findOne(Session,{
        where: { id: oldJti },
        lock: { mode: 'pessimistic_write' }, // 悲觀鎖, 避免兩個 refresh 同時來, 都讀到 oldSession.revoked = false, 都成功 rotate, 產生兩條 chain
      });
    
      // 要和　Redis 的再對比
      if (!oldSession) {
        throw new UnauthorizedException('Token reuse detected');
      }
      if (oldSession.expiresAt < new Date()) {
        throw new UnauthorizedException('Expired');
      }
      if(oldSession.revoked){
        await this.revokeAll(manager, oldSession.userId);
        throw new UnauthorizedException('Token reuse detected');
      }

      const isSessionValid = await bcrypt.compare(refreshToken, oldSession.refreshTokenHash);

      if (!isSessionValid) {
        await this.revokeAll(manager, oldSession.userId);
        throw new UnauthorizedException('Email or password incorrect');
      }
      // 產生新 token
      // const { refreshToken: newRefreshToken, jti: newJti } = await this.generateRefreshToken(userId, role);
      
      // 建立新 session
      const newSession = await this.createSession(manager, userId, oldSession.id);
      const newRefreshToken = await this.generateRefreshToken(userId, role, newSession.id);
      newSession.refreshTokenHash = await bcrypt.hash(newRefreshToken, this.saltRounds);
      await manager.save(Session, newSession);
      // 標記舊 token 被替換
      oldSession.replacedBy = newSession.id;
      oldSession.revoked = true;
      await manager.save(Session, oldSession);
      return newRefreshToken;
    })
  }

}
