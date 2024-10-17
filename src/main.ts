import { createApp } from 'vue';
import pinia from '@/stores';

import '@/styles/index.scss';

// element plus
import ElementPlus from 'element-plus';
// element css
import 'element-plus/dist/index.css';
// element dark css
import 'element-plus/theme-chalk/dark/css-vars.css';

// element icons
import * as Icons from '@element-plus/icons-vue';

// vue i18n
import I18n from '@/languages';

import App from '@/App.vue';
import router from '@/router';

// custom directives
import directives from '@/directives/index';

// errorHandler
import errorHandler from '@/utils/errorHandler';
// svg icons
import 'virtual:svg-icons-register';

// highlight 高亮
import 'highlight.js/styles/atom-one-dark.css';
import 'highlight.js/lib/common';
import hljsVuePlugin from '@highlightjs/vue-plugin';
import { isLocalEnv } from '@/utils';

const app = createApp(App);

if (!isLocalEnv()) {
  app.config.errorHandler = errorHandler;
}

// register the element Icons component
Object.keys(Icons).forEach(key => {
  app.component(key, Icons[key as keyof typeof Icons]);
});

app.use(ElementPlus);
app.use(pinia);
app.use(router);
app.use(directives);
app.use(I18n);

// app.use(router)
app.use(hljsVuePlugin);

app.mount('#app');
