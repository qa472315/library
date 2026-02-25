import { Module } from '@nestjs/common'
import { IpChangeRule, CountryChangeRule, PlatformChangeRule, RiskService, RISK_RULES, } from './risk.service'

@Module({
  providers: [
    IpChangeRule,
    CountryChangeRule,
    PlatformChangeRule,
    // 建立一個「自訂 provider」
    {
      provide: RISK_RULES,
      // useFactory: 不要 new class 而是執行這個 function 來產生值
      useFactory: (
        ip: IpChangeRule,
        country: CountryChangeRule,
        platform: PlatformChangeRule,
      ) => [ip, country, platform],
      // 這個 factory 需要這三個 dependency, Nest 請先把它們準備好再呼叫 factory
      inject: [IpChangeRule, CountryChangeRule, PlatformChangeRule],
    },
    RiskService,
  ],
})
export class RiskModule {}
// 順序
// 1. 建立 IpChangeRule
// 2. 建立 CountryChangeRule
// 3. 建立 PlatformChangeRule
// 4. 呼叫 useFactory(ip, country, platform)
// 5. 把回傳的 array 註冊為 RISK_RULES