// test/setup.ts

// 全域設定 JWT secret & expiresIn
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '15m';

// 如果你用其他 env 變數，也可以這裡補
process.env.NODE_ENV = 'test';
