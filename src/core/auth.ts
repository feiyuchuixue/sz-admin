import { getChallengeApi, loginApi, logoutApi } from '@/api/modules/system/login';
import { aesEncrypt } from '@/utils';
import type { LoginParams } from '@/api/types/system/login';

/**
 * 登录适配器接口。
 *
 * 用于解耦 sz-admin 底座与具体登录实现：
 *   - sz-admin 默认使用 LocalAuthAdapter（账号密码 + AES challenge + 滑块验证码）
 *   - SSO Community / Enterprise 派生项目可替换为 SsoAuthAdapter
 *
 * 适配器只负责"拿到 token"和"注销"；token 落入 userStore、初始化菜单/字典/配置等流程
 * 仍由路由守卫与 initDynamicRouter 统一处理，避免行为分裂。
 */
export interface AuthAdapter {
  /** 适配器唯一标识，便于日志与诊断 */
  readonly id: string;

  /**
   * 执行登录，成功后返回 accessToken。
   * 调用方负责把 token 写入 userStore。
   */
  login(params: unknown): Promise<string>;

  /** 执行注销；通常包含调用后端登出接口 */
  logout(): Promise<void>;

  /** 可选：处理 SSO 回调（如 ticket 校验），返回 accessToken */
  handleCallback?(): Promise<string>;

  /** 可选：返回登录入口 URL（如 SSO Server 的登录页地址） */
  getLoginUrl?(): string;
}

/**
 * 本地账号密码登录适配器。
 *
 * 行为等价于当前 LoginForm.vue 中 performLogin 的逻辑：
 *   1. 调用 getChallengeApi 获取一次性 secretKey 和 requestId
 *   2. 用 aesEncrypt 对密码做 AES-GCM 加密
 *   3. 调用 loginApi 提交登录，返回 accessToken
 */
export class LocalAuthAdapter implements AuthAdapter {
  readonly id = 'local';

  async login(params: unknown): Promise<string> {
    const { username, password } = params as Pick<LoginParams, 'username' | 'password'>;

    // 获取一次性认证参数
    const challenge = await getChallengeApi();
    const { secretKey, requestId } = challenge.data;

    // AES-GCM 加密密码（aesEncrypt 返回 { iv, encryptedData }）
    const { iv, encryptedData } = aesEncrypt(password, secretKey);

    // 提交登录（loginApi 内部已设置 grantType 和 clientId）
    const { data } = await loginApi({
      username,
      password: encryptedData,
      iv,
      requestId,
      clientId: '', // loginApi 内部会覆盖
      grantType: '' // loginApi 内部会覆盖
    });

    return data.accessToken;
  }

  async logout(): Promise<void> {
    await logoutApi();
  }
}

/** 默认本地登录适配器单例 */
export const localAuthAdapter = new LocalAuthAdapter();

let current: AuthAdapter = localAuthAdapter;

/**
 * 设置当前使用的登录适配器。
 * 应在 app.mount() 之前调用（通常在 edition.setup() 中）。
 */
export function setAuthAdapter(adapter: AuthAdapter): void {
  current = adapter;
}

/** 获取当前登录适配器 */
export function getAuthAdapter(): AuthAdapter {
  return current;
}
