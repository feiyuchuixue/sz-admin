// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { createApp, h, nextTick, reactive, type App } from 'vue';
import ElementPlus from 'element-plus';
import FieldDetailPanel from './FieldDetailPanel.vue';
import type { GeneratorColumnInfo } from '@/modules/toolbox/types/generator';

const scenesApi = vi.hoisted(() => vi.fn());
vi.mock('@/api/modules/system/resource', () => ({ getSysResourceScenesApi: scenesApi }));

const sceneNames = { 'system.protected': '通用业务附件', 'teacher.attachment': '教师统计 / 附件' };
let app: App;
let host: HTMLDivElement;

function field(options: GeneratorColumnInfo['options'] = {}): GeneratorColumnInfo {
  return {
    columnId: 1,
    tableId: 1,
    columnName: 'attachments',
    columnComment: '附件',
    columnType: 'json',
    javaType: 'List<ResourceRef>',
    javaTypePackage: '',
    javaField: 'attachments',
    upCamelField: 'Attachments',
    htmlType: 'fileUpload',
    isPk: '0',
    isIncrement: '0',
    isRequired: '0',
    isUniqueValid: '0',
    isLogicDel: '0',
    isInsert: '1',
    isEdit: '1',
    isList: '1',
    isQuery: '0',
    isImport: '0',
    isExport: '0',
    isAutofill: '0',
    autofillType: '',
    dictType: '',
    dictShowWay: '',
    queryType: '',
    searchType: '',
    specialPackages: '',
    options
  };
}

function mount(column = field(), generateType = 'all') {
  const state = reactive({ column, generateType });
  app = createApp({
    render: () =>
      h(FieldDetailPanel, {
        modelValue: state.column,
        generateType: state.generateType,
        dictTypeOptions: [],
        isDictionaryDisplayType: () => false
      })
  }).use(ElementPlus);
  app.mount(host);
  return state;
}

beforeEach(() => {
  scenesApi.mockReset().mockResolvedValue({ data: sceneNames });
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  host = document.createElement('div');
  document.body.append(host);
});
afterEach(() => {
  app?.unmount();
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

const sceneInput = () => host.querySelector<HTMLInputElement>('input[aria-label="资源场景"]');
async function chooseTeacherScene() {
  await vi.waitFor(() => expect(sceneInput()).not.toBeNull());
  sceneInput()!.click();
  await vi.waitFor(() => expect(document.body.textContent).toContain('教师统计 / 附件 (teacher.attachment)'));
  (
    [...document.querySelectorAll('.el-select-dropdown__item')].find(
      item => item.textContent === '教师统计 / 附件 (teacher.attachment)'
    ) as HTMLElement
  ).click();
  await nextTick();
}

test('selects a registered scene and preserves other upload options', async () => {
  const state = mount(field({ 'upload-files.limit': 5, 'upload-files.pathSegments': 'teacher' }));
  await vi.waitFor(() => expect(host.textContent).toContain('无法区分具体业务用途'));
  await chooseTeacherScene();
  expect(state.column.options).toEqual({
    'upload-files.sceneCode': 'teacher.attachment',
    'upload-files.limit': 5,
    'upload-files.pathSegments': 'teacher'
  });
  expect(host.textContent).not.toContain('无法区分具体业务用途');
});

test('edits JSON string options without losing other properties and follows field switching', async () => {
  const state = mount(field('{"upload-files.limit":3,"upload-files.sceneCode":"system.protected"}'), 'server');
  await chooseTeacherScene();
  expect(state.column.options).toEqual({ 'upload-files.limit': 3, 'upload-files.sceneCode': 'teacher.attachment' });
  state.column = { ...field(), columnId: 2, htmlType: 'imageUpload' };
  await nextTick();
  expect(host.textContent).toContain('无法区分具体业务用途');
  await chooseTeacherScene();
  expect(state.column.options).toEqual({ 'upload-files.sceneCode': 'teacher.attachment' });
  expect(scenesApi).toHaveBeenCalledTimes(1);
});

test('warns about an unregistered saved scene without silently replacing it', async () => {
  const state = mount(field({ 'upload-files.sceneCode': 'removed.scene' }));
  await vi.waitFor(() => expect(host.textContent).toContain('当前场景未在运行配置中注册'));
  expect(state.column.options).toEqual({ 'upload-files.sceneCode': 'removed.scene' });
  expect(host.textContent).toContain('名称、存储方式和访问模式');
});

test('cannot create an unregistered scene by typing into the selector', async () => {
  const state = mount(field({ 'upload-files.sceneCode': 'system.protected' }));
  await vi.waitFor(() => expect(scenesApi).toHaveBeenCalledOnce());
  sceneInput()!.click();
  sceneInput()!.value = 'new.unregistered.scene';
  sceneInput()!.dispatchEvent(new Event('input', { bubbles: true }));
  sceneInput()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
  await nextTick();
  expect(state.column.options).toEqual({ 'upload-files.sceneCode': 'system.protected' });
  expect(document.querySelector('.el-select-dropdown__item.created')).toBeNull();
});

test('allows retry after scene options fail to load and keeps existing settings', async () => {
  scenesApi.mockRejectedValueOnce(new Error('network unavailable'));
  const state = mount(field({ 'upload-files.sceneCode': 'teacher.attachment' }));
  await vi.waitFor(() => expect(host.textContent).toContain('资源场景加载失败'));
  expect(state.column.options).toEqual({ 'upload-files.sceneCode': 'teacher.attachment' });
  [...host.querySelectorAll('button')].find(button => button.textContent?.includes('重新加载'))!.click();
  await chooseTeacherScene();
  expect(host.textContent).not.toContain('资源场景加载失败');
});

test('does not load scenes for ordinary fields or database-only output', async () => {
  const state = mount(field(), 'db');
  await nextTick();
  expect(sceneInput()).toBeNull();
  expect(scenesApi).not.toHaveBeenCalled();
  state.column.htmlType = 'input';
  state.column.javaType = 'String';
  state.generateType = 'all';
  await nextTick();
  expect(sceneInput()).toBeNull();
  expect(scenesApi).not.toHaveBeenCalled();
});

test('does not overwrite malformed legacy options', async () => {
  const state = mount(field('{broken-json'));
  await vi.waitFor(() => expect(host.textContent).toContain('字段扩展配置格式异常'));
  expect(state.column.options).toBe('{broken-json');
  expect(sceneInput()?.disabled).toBe(true);
});
