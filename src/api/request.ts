import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

import router from '@/router';
import { checkStatus, CODE_SUCCESS } from '@/api/helper';
import type { IResultData } from '@/api/types';
import { useUserStore } from '@/stores/modules/user';
import { useSocketStore } from '@/stores/modules/socket/socket';
import { ElMessage } from 'element-plus';
import { handleAuthExpired, isAuthExpiredPayload, markAuthExpiredError } from '@/core/authSession';

export interface CustomAxiosRequestConfig<D = any> extends AxiosRequestConfig<D> {
  loading?: boolean;
  cancel?: boolean;
  handleBusinessError?: boolean;
}

type CustomInternalAxiosRequestConfig<D = any> = InternalAxiosRequestConfig<D> & {
  loading?: boolean;
  cancel?: boolean;
  handleBusinessError?: boolean;
};

const config: AxiosRequestConfig = {
  // 默认地址请求地址，可在 .env.** 文件中修改
  baseURL: '',
  // 设置超时时间，默认超时时间60s
  timeout: import.meta.env.VITE_APP_HTTP_TIMEOUT || 60000
  // 跨域时候允许携带凭证
  // withCredentials: true
};

export class RequestHttp {
  instance: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    // instantiation
    this.instance = axios.create(config);

    /**
     * @description 请求拦截器
     * 客户端发送请求 -> [请求拦截器] -> 服务器
     * token校验(JWT) : 接受服务器返回的 token,存储到 vuex/pinia/本地储存当中
     */
    this.instance.interceptors.request.use(
      (config: CustomInternalAxiosRequestConfig) => {
        const userStore = useUserStore();
        // 当前请求不需要显示 loading，在 api 服务中通过指定的第三个参数: { loading: false } 来控制
        // config.loading !== false && showFullScreenLoading()
        if (config.headers && typeof config.headers.set === 'function') {
          config.headers.set('Authorization', 'Bearer ' + userStore.token);
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    /**
     * @description 响应拦截器
     *  服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
     */
    this.instance.interceptors.response.use(
      response => {
        const { data } = response;

        // blob 响应：检查是否为错误（后端通过响应头传递业务信息）
        if (response.config.responseType === 'blob') {
          const bizCode = response.headers['x-biz-code'];
          const bizMessage = response.headers['x-biz-message'];
          if (bizCode && bizCode !== CODE_SUCCESS) {
            // 解码响应头中的中文（后端 URLEncoder 编码）
            const msg = bizMessage ? decodeURIComponent(bizMessage) : '操作失败，请稍后重试！';
            const payload = { code: bizCode, message: msg };
            if (isAuthExpiredPayload(payload)) {
              handleAuthExpired(payload, { cleanup: () => useSocketStore().close() });
              return Promise.reject(markAuthExpiredError(payload));
            }
            ElMessage.error(msg);
            return Promise.reject(payload);
          }
          // 正常文件流，直接返回整个响应对象
          return response;
        }

        // 登录失效（业务码 C105）
        if (isAuthExpiredPayload(data)) {
          handleAuthExpired(data, { cleanup: () => useSocketStore().close() });
          return Promise.reject(markAuthExpiredError(data));
        }
        // 全局错误信息拦截
        if (data.code && data.code !== CODE_SUCCESS) {
          const customConfig = response.config as CustomAxiosRequestConfig;
          if (customConfig.handleBusinessError !== false) {
            ElMessage.error({ message: data.message, dangerouslyUseHTMLString: true });
          }
          return Promise.reject(data);
        }
        // 成功请求
        return data;
      },
      async error => {
        const { response } = error;
        const errorMessage = String(error?.message || '');
        // 请求超时 && 网络错误单独判断，没有 response
        if (errorMessage.includes('timeout')) {
          ElMessage.error('请求超时！请您稍后重试');
        }
        if (errorMessage.includes('Network Error')) {
          ElMessage.error('网络错误！请您稍后重试');
        }
        // 根据服务器响应的错误状态码，做不同的处理
        if (response) {
          if (isAuthExpiredPayload(response.data)) {
            handleAuthExpired(response.data, { cleanup: () => useSocketStore().close() });
            return Promise.reject(markAuthExpiredError(error));
          }
          checkStatus(response.status, response.data?.message);
        }
        // 服务器结果都没有返回(可能服务器错误可能客户端断网)，断网处理
        if (!window.navigator.onLine) {
          router.replace('/500');
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * @description 常用请求方法封装
   */
  get<T>(url: string, params: any = {}, config?: CustomAxiosRequestConfig<any> | undefined): Promise<IResultData<T>> {
    return this.instance.get(url, { params, ...config });
  }

  post<T>(url: string, params: any = {}, config?: CustomAxiosRequestConfig<any> | undefined): Promise<IResultData<T>> {
    return this.instance.post(url, params, config);
  }

  put<T>(url: string, params: any = {}, config?: CustomAxiosRequestConfig<any> | undefined): Promise<IResultData<T>> {
    return this.instance.put(url, params, config);
  }

  delete<T>(url: string, data: any = {}, config?: CustomAxiosRequestConfig<any> | undefined): Promise<IResultData<T>> {
    return this.instance.delete(url, { data, ...config });
  }

  download(url: string, params = {}, config?: CustomAxiosRequestConfig<any> | undefined): Promise<BlobPart> {
    return this.instance.post(url, params, { ...config, responseType: 'blob' });
  }

  template(url: string, params = {}, config?: CustomAxiosRequestConfig<any> | undefined): Promise<BlobPart> {
    return this.instance.get(url, { params, ...config, responseType: 'blob' });
  }

  upload<T>(url: string, params: any = {}, config?: CustomAxiosRequestConfig<any> | undefined): Promise<IResultData<T>> {
    return this.instance.post(url, params, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  downloadWithHeader(url: string, params = {}, config?: CustomAxiosRequestConfig<any>) {
    // 返回 AxiosResponse<Blob>，这样可以拿到 headers + data
    return this.instance.post<Blob>(url, params, {
      ...config,
      responseType: 'blob'
    });
  }
}

export const createHttp = (baseURL: string, customConfig: AxiosRequestConfig = {}) => {
  return new RequestHttp({
    ...config,
    ...customConfig,
    baseURL
  });
};

export default new RequestHttp(config);
