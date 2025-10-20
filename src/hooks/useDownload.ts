import { ElNotification } from 'element-plus';

/**
 * @description 接收数据流生成 blob，创建链接，下载文件
 * @param {Function} api 导出表格的api方法 (必传)
 * @param {String} tempName 导出的文件名 (非必填，优先使用)
 * @param {Object} params 导出的参数 (默认{})
 * @param {Boolean} isNotify 是否有导出消息提示 (默认为 true)
 * @param {String} fileName 下载文件名 (非必填，优先级高于 tempName)
 * */
export const useDownload = async (
  api: (param: any) => Promise<any>,
  tempName?: string,
  params: any = {},
  isNotify: boolean = true,
  fileName?: string
) => {
  if (isNotify) {
    ElNotification({
      title: '温馨提示',
      message: '如果数据庞大会导致下载缓慢哦，请您耐心等待！',
      type: 'info',
      duration: 3000
    });
  }
  try {
    if (!params) params = {};
    const res = await api(params);
    // 优先从 content-disposition 获取文件名
    let downloadName: string | undefined;
    const contentDisposition = res.headers['content-disposition'];
    if (contentDisposition) {
      const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?([^;]+)?/);
      if (match && match[1]) {
        downloadName = decodeURIComponent(match[1].replace(/['"]/g, ''));
      }
    }
    // 如果 content-disposition 没有文件名，再用 fileName 或 tempName
    if (!downloadName) {
      downloadName = fileName || tempName || '下载文件';
    }
    // 下载文件
    const blob = new Blob([res.data], { type: res.headers['content-type'] });
    const blobUrl = window.URL.createObjectURL(blob);

    if ('msSaveOrOpenBlob' in navigator) return window.navigator.msSaveOrOpenBlob(blob, downloadName);
    const exportFile = document.createElement('a');
    exportFile.style.display = 'none';
    exportFile.download = downloadName;
    exportFile.href = blobUrl;
    document.body.appendChild(exportFile);
    exportFile.click();
    document.body.removeChild(exportFile);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.log(error);
  }
};
