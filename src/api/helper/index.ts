import { ElMessage } from 'element-plus';

// ---------------------------------------------------------------- 业务码常量

/** 成功 */
export const CODE_SUCCESS: string = '0000';
/** Token 失效/未登录 */
export const CODE_TOKEN_FAIL: string = 'C105';
/** 无权限 */
export const CODE_FORBIDDEN: string = 'C108';
/** 防抖/请求过于频繁 */
export const CODE_DEBOUNCE: string = 'C110';
/** 资源不存在 */
export const CODE_NOT_EXISTS: string = 'C1002';
/** 文件不存在 */
export const CODE_FILE_NOT_EXISTS: string = 'C1003';
/** 资源已存在（冲突） */
export const CODE_EXISTS: string = 'C1001';
/** 参数校验异常 */
export const CODE_VALID_ERROR: string = 'C100';

// ---------------------------------------------------------------- HTTP 状态码处理

/**
 * 根据 HTTP 状态码弹出对应提示
 * 后端返回非 2xx 时由拦截器调用
 *
 * @param status  HTTP 状态码
 * @param message 后端返回的错误信息（优先展示）
 */
export const checkStatus = (status: number, message?: string): void => {
  switch (status) {
    case 400:
      ElMessage.error(message || '请求参数有误，请检查后重试！');
      break;
    case 401:
      // 401 由 api/index.ts 拦截器统一处理跳登录，此处仅兜底提示
      ElMessage.error(message || '登录失效，请重新登录！');
      break;
    case 403:
      ElMessage.error(message || '当前账号无权限访问！');
      break;
    case 404:
      ElMessage.error(message || '所访问的资源不存在！');
      break;
    case 405:
      ElMessage.error(message || '请求方式错误！');
      break;
    case 408:
      ElMessage.error(message || '请求超时，请稍后重试！');
      break;
    case 409:
      ElMessage.error(message || '数据已存在，请勿重复提交！');
      break;
    case 413:
      ElMessage.error(message || '上传文件超出大小限制！');
      break;
    case 422:
      ElMessage.error(message || '请求内容无法处理，请检查参数！');
      break;
    case 429:
      ElMessage.error(message || '请求过于频繁，请稍后再试！');
      break;
    case 500:
      ElMessage.error(message || '服务器内部错误，请联系管理员！');
      break;
    case 502:
      ElMessage.error(message || '网关错误！');
      break;
    case 503:
      ElMessage.error(message || '服务不可用！');
      break;
    case 504:
      ElMessage.error(message || '网关超时！');
      break;
    default:
      ElMessage.error(message || '请求失败，请稍后重试！');
  }
};

