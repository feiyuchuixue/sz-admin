<template>
  <textarea ref="editorRef"></textarea>
</template>
<script setup lang="ts">
import { Jodit } from 'jodit';
import 'jodit/es2021/jodit.css';
import 'jodit/esm/plugins/all.js';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';

import type { DeepPartial } from 'jodit/types/types';
import type { Config } from 'jodit/types/config';
import { useUserStore } from '@/stores/modules/user';
import merge from 'lodash.merge';
import { ADMIN_MODULE } from '@/api/helper/prefix';

defineOptions({
  name: 'JoditEditor'
});
const baseUrl = import.meta.env.VITE_API_URL as string;
const userStore = useUserStore();

interface Plugin {
  name: string;
  callback: (...args: any[]) => any;
}

interface Props {
  modelValue: string;
  config?: DeepPartial<Config>;
  plugins?: Plugin[];
  uploadDir?: string; // （当有文件资源时的）上传目录
  height?: string; // 编辑器高度
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  config: () => ({}),
  plugins: () => [],
  uploadDir: 'editor',
  height: '400px'
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'blur'): void;
  (e: 'focus'): void;
  (e: 'ready', instance: Jodit): void;
}>();

const editorRef = ref<HTMLTextAreaElement | null>(null);
const editorInstance = shallowRef<Jodit>(); // 可暴露实例
defineExpose({ editorInstance });

const defaultConfig: () => DeepPartial<Config> = () => ({
  width: '100%',
  height: props.height,
  placeholder: '请输入内容...',
  language: 'zh_cn',
  buttons: [
    'source', // 代码模式
    'redo',
    'undo',
    '|',
    'bold', // 粗体
    'italic', // 斜体
    'underline', // 下划线
    'strikethrough', // 删除线
    'eraser', // 清除格式
    '|',
    'ol',
    'ul',
    '|',
    'font', // 字体
    'fontsize', // 字号
    'brush', // 文字颜色
    'paragraph', // 段落格式
    'lineHeight', // 行间距
    'align',
    'outdent',
    'indent',
    'superscript', // 上标
    'subscript', // 下标
    '|',
    'file',
    'image',
    'video',
    '|',
    'hr',
    'table',
    'link',
    '|',
    'copyformat',
    'find',
    '|',
    'selectall',
    'symbols',
    '|',
    'preview',
    'fullsize'
  ],
  i18n: {
    zh_cn: {
      'Line height': '行间距',
      top: '上',
      right: '右',
      bottom: '下',
      left: '左',
      Title: '标题',
      'Insert Unordered List': '无序列表',
      'Insert Ordered List': '有序列表',
      'Insert format block': '段落',
      Circle: '空心圆',
      Dot: '点',
      Quadrate: '方形',
      'Lower Alpha': '小写英文字母',
      'Lower Greek': '小写希腊字母',
      'Lower Roman': '小写罗马数字',
      'Upper Alpha': '大写英文字母',
      'Upper Roman': '大写罗马数字',
      'Change mode': '源代码'
    }
  },
  controls: {
    font: {
      list: {
        '': 'Default',
        'Helvetica, sans-serif': 'Helvetica',
        'Arial, sans-serif': 'Arial',
        'Georgia, serif': 'Georgia',
        'Impact, Charcoal, sans-serif': 'Impact',
        'Tahoma, Geneva, sans-serif': 'Tahoma',
        'Times New Roman, Times, serif': 'Times New Roman',
        'Verdana, Geneva, sans-serif': 'Verdana',
        'Microsoft YaHei, 微软雅黑, sans-serif': '微软雅黑',
        'SimHei, 黑体, sans-serif': '黑体',
        'SimSun, 宋体, serif': '宋体',
        'FangSong, 仿宋, serif': '仿宋',
        'NSimSun, 新宋体, serif': '新宋体',
        'KaiTi, 楷体, serif': '楷体'
      }
    }
  },
  textIcons: false,
  removeButtons: [],
  disablePlugins: ['paste', 'powered-by-jodit', 'add-new-line'], // 禁用插件
  extraButtons: [],
  sizeLG: 900,
  sizeMD: 700,
  sizeSM: 400,
  zIndex: 0,
  readonly: false,
  activeButtonsInReadOnly: ['source', 'fullsize', 'print', 'about', 'dots'],
  toolbarButtonSize: 'middle',
  theme: 'default',
  saveModeInCookie: false,
  spellcheck: true,
  editorCssClass: false,
  triggerChangeEvent: true,
  minHeight: 100,
  direction: '',
  debugLanguage: false,
  tabIndex: -1,
  toolbar: true,
  useSplitMode: false,
  defaultActionOnPaste: 'insert_as_html',
  colors: {
    greyscale: ['#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF'],
    palette: ['#980000', '#FF0000', '#FF9900', '#FFFF00', '#00F0F0', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF'],
    full: [
      '#E6B8AF',
      '#F4CCCC',
      '#FCE5CD',
      '#FFF2CC',
      '#D9EAD3',
      '#D0E0E3',
      '#C9DAF8',
      '#CFE2F3',
      '#D9D2E9',
      '#EAD1DC',
      '#DD7E6B',
      '#EA9999',
      '#F9CB9C',
      '#FFE599',
      '#B6D7A8',
      '#A2C4C9',
      '#A4C2F4',
      '#9FC5E8',
      '#B4A7D6',
      '#D5A6BD',
      '#CC4125',
      '#E06666',
      '#F6B26B',
      '#FFD966',
      '#93C47D',
      '#76A5AF',
      '#6D9EEB',
      '#6FA8DC',
      '#8E7CC3',
      '#C27BA0',
      '#A61C00',
      '#CC0000',
      '#E69138',
      '#F1C232',
      '#6AA84F',
      '#45818E',
      '#3C78D8',
      '#3D85C6',
      '#674EA7',
      '#A64D79',
      '#85200C',
      '#990000',
      '#B45F06',
      '#BF9000',
      '#38761D',
      '#134F5C',
      '#1155CC',
      '#0B5394',
      '#351C75',
      '#733554',
      '#5B0F00',
      '#660000',
      '#783F04',
      '#7F6000',
      '#274E13',
      '#0C343D',
      '#1C4587',
      '#073763',
      '#20124D',
      '#4C1130'
    ]
  },
  colorPickerDefaultTab: 'background',
  imageDefaultWidth: 300,
  toolbarAdaptive: false,
  uploader: createUploader(props.uploadDir)
});

const mergedConfig = computed(() => {
  // lodash.merge深度合并，支持嵌套对象
  return merge({}, defaultConfig(), props.config);
});

const createUploader = (uploadDir: string): any => ({
  url: `${baseUrl}${ADMIN_MODULE}/sys-file/batchUpload`,
  headers: { Authorization: `Bearer ${userStore.token}` },
  method: 'POST',
  data: { dirTag: uploadDir },
  isSuccess(res: any) {
    return res;
  },
  imagesExtensions: ['jpg', 'png', 'jpeg', 'gif', 'svg', 'webp'],
  defaultHandlerSuccess(data: any) {
    //此处参数的值默认是接口返回的data值
    console.log('defaultHandlerSuccess', data);
    data.forEach((item: any) => {
      const filename = item.filename;
      const url = item.url;
      const isImage = /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(filename);
      if (isImage) {
        this.s.insertImage(url);
      } else {
        const a = this.create.element('a');
        a.href = url;
        a.textContent = filename || url.split('/').pop();
        a.target = '_blank';
        this.s.insertNode(a);
        // 插入一个换行
        const br = this.create.element('br');
        this.s.insertNode(br);
      }
    });
  }
});

const registerPlugins = () => {
  (props.plugins || []).forEach(plugin => {
    if (plugin.name && typeof plugin.callback === 'function') {
      Jodit.plugins.add(plugin.name, plugin.callback);
    }
  });
};

const initEditor = () => {
  if (!editorRef.value) return;
  registerPlugins();
  const instance = Jodit.make(editorRef.value, {
    ...mergedConfig.value
  });
  // 核心 change 事件
  instance.events.on('change', (value: string) => {
    emits('update:modelValue', value);
  });
  // 支持 blur/focus 等常用事件
  instance.events.on('blur', () => emits('blur'));
  instance.events.on('focus', () => emits('focus'));

  // 可扩展更多原生事件
  instance.events.on('ready', () => emits('ready', instance));
  editorInstance.value = instance;
  instance.setEditorValue(props.modelValue);
};

const destroyEditor = () => {
  if (editorInstance.value) {
    editorInstance.value?.destruct();
    editorInstance.value = undefined;
  }
};

onMounted(() => {
  initEditor();
});
onBeforeUnmount(() => {
  destroyEditor();
});

// --- 内容值监听（v-model双向绑定） ---
watch(
  () => props.modelValue,
  value => {
    if (editorInstance.value && editorInstance.value.value !== value) {
      editorInstance.value.value = value ?? '';
    }
  }
);

// ---- 动态配置 watch 可选（一般配置不会频繁变） ----
watch(
  () => props.config,
  () => {
    destroyEditor();
    nextTick(() => initEditor());
  }
);
watch(
  () => props.height,
  height => {
    if (editorInstance.value) {
      editorInstance.value.e.fire('setHeight', height);
    }
  }
);
</script>
<style scoped lang="scss"></style>
