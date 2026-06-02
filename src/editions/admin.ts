import { setAuthAdapter, localAuthAdapter } from '@/core';
import { auditModule } from '@/modules/audit/register';
import { toolboxModule } from '@/modules/toolbox/register';
import { registerDiscoveredModules, registerModules } from './module-discovery';

/**
 * sz-admin 默认 edition。
 *
 * edition 描述当前产品的组合方式：使用哪个登录适配器、启用哪些模块。
 *
 * 派生项目（SSO Community / Enterprise）应在自己的 edition 文件中：
 *   1. 调用 setAuthAdapter(yourAdapter) 替换登录方式
 *   2. 调用 registerModules([yourModule]) 手动注册稳定业务模块
 *   3. 按需调用 registerDiscoveredModules() 自动注册各模块 register.ts
 * 然后在 main.ts 中替换为自己的 edition.setup() 调用即可。
 *
 * 示例（SSO Community edition）：
 *   import { setAuthAdapter } from '@/core';
 *   import { ssoAuthAdapter } from './auth/SsoAuthAdapter';
 *   import { ssoUserModule } from '@/modules/sso/user/register';
 *   import { ssoClientModule } from '@/modules/sso/client/register';
 *   import { registerModules } from './module-discovery';
 *
 *   export const SSO_COMMUNITY_EDITION = {
 *     id: 'sso-community',
 *     name: 'SSO Community',
 *     setup() {
 *       setAuthAdapter(ssoAuthAdapter);
 *       registerModules([ssoUserModule, ssoClientModule]);
 *     }
 *   };
 */
export const ADMIN_EDITION = {
  id: 'admin',
  name: 'sz-admin',
  setup(): void {
    // 默认登录方式：本地账号密码 + AES challenge + 滑块验证码
    setAuthAdapter(localAuthAdapter);
    // 手动注册官方核心模块，顺序清晰，便于派生 edition 取舍。
    registerModules([auditModule, toolboxModule]);
    // 自动注册代码生成器放入模块 register.ts 的模块。
    registerDiscoveredModules();
  }
};
