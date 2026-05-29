import { defineModule } from '@/core';

/**
 * toolbox 模块：代码生成器等开发工具能力。
 *
 * 这是 sz-admin 提供的迁移样板，展示如何将业务页面从 views/ 迁移到 modules/<domain>/。
 *
 * 后端菜单 SQL 中 component 字段仍保持 '/toolbox/generator/index'，无需修改。
 * 通过 components 显式登记，dynamicRouter 会优先命中此处的组件映射，
 * 不依赖约定路径解析（虽然约定路径也能命中，显式登记更明确）。
 *
 * 派生项目（SSO Community/Enterprise）参考此文件注册自己的模块：
 *   export const ssoClientModule = defineModule({
 *     name: 'sso.client',
 *     components: {
 *       '/sso/ssoClient/index': () => import('./views/index.vue')
 *     }
 *   });
 */
export const toolboxModule = defineModule({
  name: 'toolbox',
  components: {
    '/toolbox/generator/index': () => import('./views/generator/index.vue')
    // 如有其他 toolbox 子页面继续在此追加
  }
});
