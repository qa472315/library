import {  Injectable, Inject,} from '@nestjs/common';

interface SessionSnapshot {
  ip: string;
  country: string;
  platform: string; // e.g. web / ios / android
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}
// interface:
// 所有規則都有統一格式
// 可以丟進 array
// 可以動態新增規則
// 不影響其他規則
export interface RiskRule {
  evaluate(previous: SessionSnapshot, current: SessionSnapshot): number;
}

// Symbol: 建立的值都是獨特的（unique），因此可以作為獨特不重複的物件屬性名稱
// 以 Symbol 為鍵的物件屬性與陣列元素類似，不能被類似 obj.name 的點運算符存取，你必須使用方括號 [] 訪問這些屬性
// 不會被常規方法遍歷得到, 用於為對象定義一些非私有的、但又希望只用於內部的方法
export const RISK_RULES = Symbol('RISK_RULES');

@Injectable()
export class IpChangeRule implements RiskRule {
  evaluate(prev: SessionSnapshot, curr: SessionSnapshot): number {
    return prev.ip !== curr.ip ? 20 : 0;
  }
}

@Injectable()
export class CountryChangeRule implements RiskRule {
  evaluate(prev: SessionSnapshot, curr: SessionSnapshot): number {
    return prev.country !== curr.country ? 40 : 0;
  }
}

@Injectable()
export class PlatformChangeRule implements RiskRule {
  evaluate(prev: SessionSnapshot, curr: SessionSnapshot): number {
    return prev.platform !== curr.platform ? 40 : 0;
  }
}

@Injectable()
export class RiskService {
  constructor(
    // TypeScript interface 在 runtime 是不存在的, 須給它一個「明確的 token」
    // 告訴 Nest：不要用型別推斷，請用這個 token 找依賴
    @Inject(RISK_RULES)
    private readonly rules: RiskRule[]
  ) {}

  calculate(prev: SessionSnapshot, curr: SessionSnapshot): RiskLevel {
    const score = this.rules.reduce(
      (total, rule) => total + rule.evaluate(prev, curr),
      0,
    );

    if (score >= 80) return RiskLevel.HIGH;
    if (score >= 40) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

}