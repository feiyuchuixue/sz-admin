import { ElMessage } from 'element-plus';

import { CODE_TOKEN_FAIL } from '@/api/helper';
import { LOGIN_URL } from '@/config';
import router from '@/router';
import { useAuthStore } from '@/stores/modules/auth';
import { useUserStore } from '@/stores/modules/user';

const AUTH_EXPIRED_ERROR_MARK = Symbol('auth-expired-error');
const DEFAULT_AUTH_EXPIRED_MESSAGE = '您的登录信息已过期，请重新登录以继续访问。';

let authExpiredHandled = false;

type AuthExpiredPayload = {
  code?: unknown;
  message?: unknown;
};

type MarkedAuthExpiredError = Record<PropertyKey, unknown>;

export interface HandleAuthExpiredOptions {
  cleanup?: () => void;
  message?: string;
  notify?: boolean;
  redirect?: boolean;
}

export const isAuthExpiredPayload = (payload: unknown): payload is AuthExpiredPayload => {
  return !!payload && typeof payload === 'object' && String((payload as AuthExpiredPayload).code) === CODE_TOKEN_FAIL;
};

export const markAuthExpiredError = <T extends object>(error: T): T => {
  Object.defineProperty(error, AUTH_EXPIRED_ERROR_MARK, {
    configurable: true,
    enumerable: false,
    value: true
  });
  return error;
};

export const isAuthExpiredError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }
  return (error as MarkedAuthExpiredError)[AUTH_EXPIRED_ERROR_MARK] === true || isAuthExpiredPayload(error);
};

export const resetAuthExpiredHandling = (): void => {
  authExpiredHandled = false;
};

export const handleAuthExpired = (payload?: unknown, options: HandleAuthExpiredOptions = {}): void => {
  if (authExpiredHandled) {
    return;
  }
  authExpiredHandled = true;

  options.cleanup?.();
  useUserStore().clear();
  useAuthStore().clear();

  const currentRoute = router.currentRoute.value;
  if (options.redirect !== false && currentRoute.path !== LOGIN_URL) {
    const back = currentRoute.fullPath || currentRoute.path;
    void router.replace(back ? { path: LOGIN_URL, query: { back } } : LOGIN_URL);
  }

  if (options.notify !== false) {
    ElMessage.error(options.message || getAuthExpiredMessage(payload));
  }
};

const getAuthExpiredMessage = (payload?: unknown): string => {
  if (payload && typeof payload === 'object') {
    const message = (payload as AuthExpiredPayload).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }
  return DEFAULT_AUTH_EXPIRED_MESSAGE;
};
