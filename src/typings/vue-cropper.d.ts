// vue-cropper/next 内部引用 ./vue-cropper.vue，但该 .vue 文件没有类型声明。
// 此处为其补充类型声明，避免 TS7016 报错。
declare module 'vue-cropper/next/lib/vue-cropper.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
