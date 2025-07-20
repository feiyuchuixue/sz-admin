import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IResultData } from '@/api/types';
import type {
  ConfirmUploadRequest,
  DirectUploadConfig,
  IUploadResult,
  PreSignedUploadRequest,
  PreSignedUploadResponse,
  UploadFile,
  UploadResult
} from '@/api/types/system/upload';
import type { AxiosRequestConfig } from 'axios';

/**
 * 获取预签名上传信息
 * @param params
 * @returns
 */
export const getPreSignedUploadInfo = (params: PreSignedUploadRequest) => {
  return http.post<PreSignedUploadResponse>(ADMIN_MODULE + `/sys-file/get-upload-info`, params);
};

/**
 * 确认上传完成
 * @param params
 * @returns
 */
export const confirmUpload = (params: ConfirmUploadRequest) => {
  return http.post<UploadResult>(ADMIN_MODULE + `/sys-file/confirm-upload`, params);
};

/**
 * 原有的直接上传方法（保留）
 * @param params
 * @returns {*}
 */
export const uploadFile = (params: UploadFile, config?: AxiosRequestConfig<any> | undefined) => {
  return http.upload<UploadResult>(ADMIN_MODULE + `/sys-file/upload`, params, config);
};

/**
 * 新的分离式上传方法 - 直接上传到OSS
 * @param file 文件对象
 * @param dirTag 目录标识
 * @param config 上传配置（进度回调、取消信号等）
 * @returns Promise<UploadResult>
 */
export const uploadFileToOss = async (params: UploadFile, config?: DirectUploadConfig): Promise<IResultData<UploadResult>> => {
  try {
    // 第一步：获取预签名上传信息
    const preSignedInfo = await getPreSignedUploadInfo({
      filename: params.file.name,
      dirTag: params.dirTag || '',
      fileSize: params.file.size,
      contentType: params.file.type
    });

    if (!preSignedInfo.data) {
      throw new Error('获取预签名上传信息失败');
    }

    const { uploadUrl, fileId } = preSignedInfo.data;

    // 这里需要一个提示信息，开发人员看到https的域名无法访问http的问题
    if (import.meta.env.DEV) {
      if (!uploadUrl.startsWith('https://')) {
        console.warn('检测到oss上传地址不为https开头，若在生产环境中使用，请确保上传地址为https协议。');
      }
    }

    // 第二步：直接上传到OSS
    await uploadToOssDirect(params.file, uploadUrl, config);

    // 第三步：确认上传完成
    const confirmResult = await confirmUpload({ fileId });

    return confirmResult;
  } catch (error) {
    console.error('上传文件失败:', error);
    throw error;
  }
};

/**
 * 直接上传文件到OSS
 * @param file 文件对象
 * @param uploadUrl 预签名上传URL
 * @param config 上传配置
 */
const uploadToOssDirect = (file: File, uploadUrl: string, config?: DirectUploadConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 监听上传进度
    if (config?.onProgress) {
      xhr.upload.addEventListener('progress', event => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          config.onProgress!(progress);
        }
      });
    }

    // 监听上传完成
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`上传失败: ${xhr.status} ${xhr.statusText}`));
      }
    });

    // 监听上传错误
    xhr.addEventListener('error', () => {
      reject(new Error('上传过程中发生网络错误'));
    });

    // 监听上传中止
    xhr.addEventListener('abort', () => {
      reject(new Error('上传被中止'));
    });

    // 支持取消上传
    if (config?.signal) {
      config.signal.addEventListener('abort', () => {
        xhr.abort();
      });
    }

    // 发起PUT请求上传文件
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
};

/**
 * 上传模板文件
 * @param params
 * @param config
 * @returns {*}
 */
export const uploadTmpFile = (params: UploadFile, config?: AxiosRequestConfig<any> | undefined) => {
  return http.upload<IUploadResult>(ADMIN_MODULE + `/sys-temp-file/upload`, params, config);
};
