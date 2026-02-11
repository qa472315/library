import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../common/utils/enums';

export const ACCESS_KEY = 'access';

export interface AccessMeta {
  type: 'public' | 'protected';
  roles?: Role[];
}
// 用裝飾器給加上 access : roles 的 key & value
// export const Access = (...roles: Role[]) =>
//   SetMetadata(ACCESS_KEY , roles);
// MethodDecorator & ClassDecorator : 讓 decorator 可以用在 class 或 method
// Decorator 類型  	對應目標	     TypeScript 型別
// Class	          class         ClassDecorator
// Method	          method	      MethodDecorator
export function  Access(...roles: Role[]): MethodDecorator & ClassDecorator{
  // 不用權限的用 Public
  if (!roles || roles.length === 0) {
    throw new Error(
      '@Access() requires at least one role. Use @Public() for public route.'
    );
  }

  // @Access(Role.Admin, Role.User)
  return SetMetadata(ACCESS_KEY, {
    type: 'protected',
    roles,
  } satisfies AccessMeta);
}

export const Public = () => SetMetadata(ACCESS_KEY, { type: 'public' });