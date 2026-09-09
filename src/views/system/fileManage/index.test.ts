// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { createApp, nextTick, ref, type App } from 'vue';
import ElementPlus from 'element-plus';
import FileManage from './index.vue';

const api = vi.hoisted(() => ({ page: vi.fn(), scenes: vi.fn() }));
vi.mock('@/api/modules/system/resource', () => ({
  getSysResourcePageApi: api.page,
  getSysResourceScenesApi: api.scenes
}));
vi.mock('@/hooks/useDictOptions', () => ({
  useDictOptions: () => ref([{ id: '1', codeName: '系统管理员' }])
}));

let app: App;
let host: HTMLDivElement;
const detailDrawer = () => [...document.querySelectorAll('.el-drawer')].find(drawer => drawer.textContent?.includes('文件详情'));
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  api.scenes.mockResolvedValue({ data: { 'teacher.attachment': '教师附件', 'teacher.richtext': '教师富文本' } });
  api.page.mockResolvedValue({
    data: {
      current: 1,
      limit: 10,
      total: 7,
      rows: [
        {
          id: '1',
          originName: '公开图片.png',
          sceneCode: 'teacher.richtext',
          sceneName: '教师富文本',
          size: 62385,
          serveMode: 'DIRECT',
          accessUrl: '/files/a.png',
          storageType: 'LOCAL',
          createId: '1'
        },
        {
          id: '2',
          originName: '教师附件.pdf',
          sceneCode: 'teacher.attachment',
          sceneName: '教师附件',
          size: 0,
          serveMode: 'PROTECTED',
          accessUrl: '/must-not-open',
          objectKey: 'attachments/long/report.pdf',
          eTag: 'etag-value',
          contentType: '',
          bizKey: 'naming-key'
        },
        {
          id: '3',
          originName: '临时图片.png',
          sceneCode: 'oss.image',
          serveMode: 'PRESIGNED',
          accessUrl: 'https://example.com/a.png?signature=short-lived'
        },
        { id: '4', originName: '配置已删除.pdf', sceneCode: 'deleted.scene', serveMode: '' },
        { id: '5', originName: '签名失败.pdf', sceneCode: 'oss.image', serveMode: 'PRESIGNED', size: -1 },
        {
          id: '6',
          originName: '非法链接.pdf',
          sceneCode: 'bad.url',
          serveMode: 'DIRECT',
          accessUrl: 'javascript:alert(1)',
          size: 1048576
        },
        {
          id: '7',
          originName: '通用附件.pdf',
          sceneCode: 'system.protected',
          sceneName: '通用业务附件',
          serveMode: 'PROTECTED'
        }
      ]
    }
  });
  host = document.createElement('div');
  document.body.append(host);
  app = createApp(FileManage).use(ElementPlus);
  app.mount(host);
});
afterEach(() => {
  app?.unmount();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('shows business columns, readable sizes and explicit access modes', async () => {
  await vi.waitFor(() => expect(host.textContent).toContain('公开图片.png'));
  expect(host.textContent).toContain('60.92 KiB');
  expect(host.textContent).toContain('公开访问');
  expect(host.textContent).toContain('临时链接');
  expect(host.textContent).toContain('受保护');
  expect(host.textContent).toContain('访问配置异常');
  expect(host.textContent).toContain('本地存储');
  expect(host.textContent).toContain('登记时间');
  expect(host.textContent).toContain('0 B');
  expect(host.textContent).toContain('1 MiB');
  expect(host.textContent).toContain('链接不可用');
  expect(host.querySelector('.el-table__header-wrapper')?.textContent).not.toContain('存储键');
  expect(host.querySelector('.el-table-column--selection')).toBeNull();
  const protectedRow = [...host.querySelectorAll('.el-table__body tr')].find(row => row.textContent?.includes('教师附件.pdf'))!;
  expect(protectedRow.querySelectorAll('a')).toHaveLength(0);
  expect(protectedRow.textContent).not.toContain('复制链接');
  expect(host.querySelector('a[href^="javascript:"]')).toBeNull();
  const signedRow = [...host.querySelectorAll('.el-table__body tr')].find(row => row.textContent?.includes('临时图片.png'))!;
  expect(signedRow.textContent).toContain('打开临时链接');
  expect(signedRow.textContent).not.toContain('复制链接');
});

test('opens technical details without exposing a protected link', async () => {
  await vi.waitFor(() => expect(host.textContent).toContain('教师附件.pdf'));
  const row = [...host.querySelectorAll('.el-table__body tr')].find(row => row.textContent?.includes('教师附件.pdf'))!;
  const detail = [...row.querySelectorAll('button')].find(button => button.textContent?.includes('详情'));
  expect(detail).toBeDefined();
  detail!.click();
  await nextTick();
  await vi.waitFor(() => expect(detailDrawer()?.textContent).toContain('attachments/long/report.pdf'));
  const accessTip = detailDrawer()?.querySelector('.el-alert')?.textContent;
  expect(accessTip).toContain('此文件用于「教师附件」');
  expect(accessTip).toContain('相应业务记录');
  expect(accessTip).not.toContain('已关联');
  expect(detailDrawer()?.textContent).toContain('etag-value');
  expect(detailDrawer()?.textContent).toContain('naming-key');
  expect(detailDrawer()?.textContent).not.toContain('/must-not-open');
});

test('shows the complete public address in details with open and copy actions', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  await vi.waitFor(() => expect(host.textContent).toContain('公开图片.png'));
  const row = [...host.querySelectorAll('.el-table__body tr')].find(row => row.textContent?.includes('公开图片.png'))!;
  [...row.querySelectorAll('button')].find(button => button.textContent?.includes('详情'))!.click();
  await nextTick();

  const expectedUrl = new URL('/files/a.png', window.location.origin).href;
  await vi.waitFor(() => expect(detailDrawer()?.textContent).toContain(expectedUrl));
  const address = [...detailDrawer()!.querySelectorAll('tr')].find(row => row.textContent?.includes('访问地址'))!;
  expect(address.querySelector('a')?.href).toBe(expectedUrl);
  const copyButton = address.querySelector<HTMLButtonElement>('button[aria-label="复制访问地址"]')!;
  copyButton.click();
  await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith(expectedUrl));
});

test('filters by configured purpose using scene code and resets the filter', async () => {
  await vi.waitFor(() => expect(host.textContent).toContain('公开图片.png'));
  (host.querySelector('.el-select__wrapper') as HTMLElement).click();
  await vi.waitFor(() => expect(document.body.textContent).toContain('教师附件 (teacher.attachment)'));
  const option = [...document.querySelectorAll('.el-select-dropdown__item')].find(
    item => item.textContent === '教师附件 (teacher.attachment)'
  ) as HTMLElement;
  option.click();
  await nextTick();
  [...host.querySelectorAll('button')].find(button => button.textContent?.includes('搜索'))!.click();
  await vi.waitFor(() =>
    expect(api.page).toHaveBeenLastCalledWith(expect.objectContaining({ sceneCode: 'teacher.attachment', page: 1 }))
  );
  [...host.querySelectorAll('button')].find(button => button.textContent?.includes('重置'))!.click();
  await vi.waitFor(() => expect(api.page).toHaveBeenLastCalledWith({ page: 1, limit: 10 }));
});

test('explains that a generic protected scene cannot identify a business purpose', async () => {
  await vi.waitFor(() => expect(host.textContent).toContain('通用附件.pdf'));
  const row = [...host.querySelectorAll('.el-table__body tr')].find(row => row.textContent?.includes('通用附件.pdf'))!;
  [...row.querySelectorAll('button')].find(button => button.textContent?.includes('详情'))!.click();
  await nextTick();
  await vi.waitFor(() => expect(detailDrawer()?.textContent).toContain('无法区分具体业务用途'));
  expect(detailDrawer()?.textContent).toContain('文件管理不提供访问入口');
  expect(row.querySelectorAll('a')).toHaveLength(0);
});

test('copies a public URL and reports clipboard failure', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  await vi.waitFor(() => expect(host.textContent).toContain('公开图片.png'));
  const copyButton = [...host.querySelectorAll('button')].find(button => button.textContent?.includes('复制链接'))!;
  copyButton.click();
  await vi.waitFor(() => expect(document.body.textContent).toContain('已复制'));
  expect(writeText).toHaveBeenCalledWith(new URL('/files/a.png', window.location.origin).href);
  writeText.mockRejectedValue(new Error('clipboard unavailable'));
  copyButton.click();
  await vi.waitFor(() => expect(document.body.textContent).toContain('复制失败'));
  Reflect.deleteProperty(navigator, 'clipboard');
});

test('shows placeholders for empty strings returned by the backend', async () => {
  await vi.waitFor(() => expect(host.textContent).toContain('教师附件.pdf'));
  const row = [...host.querySelectorAll('.el-table__body tr')].find(row => row.textContent?.includes('教师附件.pdf'))!;
  [...row.querySelectorAll('button')].find(button => button.textContent?.includes('详情'))!.click();
  await nextTick();
  await vi.waitFor(() => expect(detailDrawer()?.textContent).toContain('attachments/long/report.pdf'));
  const mime = [...detailDrawer()!.querySelectorAll('tr')].find(row => row.textContent?.includes('MIME 类型'))!;
  expect(mime.textContent).toContain('--');
  expect(detailDrawer()?.textContent).toContain('0 B');
});
