import { moduleRegistry, setAuthAdapter, localAuthAdapter } from '@/core';
import { toolboxModule } from '@/modules/toolbox/register';

/**
 * sz-admin 默认 edition。
 *
 * edition 描述当前产品的组合方式：使用哪个登录适配器、启用哪些模块。
 *
 * 派生项目（SSO Community / Enterprise）应在自己的 edition 文件中：
 *   1. 调用 setAuthAdapter(yourAdapter) 替换登录方式
 *   2. 调用 moduleRegistry.register(yourModule) 注册业务模块
 * 然后在 main.ts 中替换为自己的 edition.setup() 调用即可。
 *
 * 示例（SSO Community edition）：
 *   import { moduleRegistry, setAuthAdapter } from '@/core';
 *   import { ssoAuthAdapter } from './auth/SsoAuthAdapter';
 *   import { ssoUserModule } from '@/modules/sso/user/register';
 *   import { ssoClientModule } from '@/modules/sso/client/register';
 *
 *   export const SSO_COMMUNITY_EDITION = {
 *     id: 'sso-community',
 *     name: 'SSO Community',
 *     setup() {
 *       setAuthAdapter(ssoAuthAdapter);
 *       moduleRegistry.register(ssoUserModule);
 *       moduleRegistry.register(ssoClientModule);
 *     }
 *   };
 */
export const ADMIN_EDITION = {
  id: 'admin',
  name: 'sz-admin',
  setup(): void {
    // 默认登录方式：本地账号密码 + AES challenge + 滑块验证码
    setAuthAdapter(localAuthAdapter);

    // 注册随仓库提供的样板模块（toolbox 代码生成器）
    moduleRegistry.register(toolboxModule);
  }
};
