# modules 目录说明

`src/modules/` 是 sz-admin 底座的**可组合业务模块**承载目录。

sz-admin 仓库本身只提供 `toolbox` 作为迁移样板；真实业务模块（SSO Community、SSO Enterprise 等）由派生项目在各自仓库中注册。

---

## 模块约定结构

```
src/modules/<domain>/
├── views/          # 页面组件，路径约定见下文
├── api/            # 该模块的 API 请求函数
├── types/          # 该模块的 TypeScript 类型
├── stores/         # 该模块的 Pinia Store（可选）
└── register.ts     # 模块注册声明（必须）
```

---

## 注册示例

```typescript
// src/modules/sso/client/register.ts
import { defineModule } from '@/core';

export const ssoClientModule = defineModule({
  name: 'sso.client',
  components: {
    '/sso/ssoClient/index': () => import('./views/index.vue'),
    '/sso/ssoClient/SsoClientForm': () => import('./views/SsoClientForm.vue')
  }
});
```

在 edition 文件中注册：

```typescript
// src/editions/sso-community.ts
import { moduleRegistry, setAuthAdapter } from '@/core';
import { ssoClientModule } from '@/modules/sso/client/register';

export const SSO_COMMUNITY_EDITION = {
  id: 'sso-community',
  name: 'SSO Community',
  setup() {
    moduleRegistry.register(ssoClientModule);
    // setAuthAdapter(ssoAuthAdapter); // 如需替换登录方式
  }
};
```

在 `main.ts` 中替换 edition：

```typescript
import { SSO_COMMUNITY_EDITION } from '@/editions/sso-community';
SSO_COMMUNITY_EDITION.setup();
app.mount('#app');
```

---

## 组件 key 与后端菜单 SQL 的对齐

后端菜单表的 `component` 字段决定了前端加载哪个组件。

| 后端 component 字段        | 对应模块组件 key           | 物理文件路径                                    |
| -------------------------- | -------------------------- | ----------------------------------------------- |
| `/toolbox/generator/index` | `/toolbox/generator/index` | `src/modules/toolbox/views/generator/index.vue` |
| `/sso/ssoClient/index`     | `/sso/ssoClient/index`     | `src/modules/sso/views/ssoClient/index.vue`     |

**规则**：`component` 字段的值就是 `components` 映射的 key，也是约定路径解析的依据。

---

## 与 `src/views/` 旧目录的兼容关系

`dynamicRouter.ts` 使用双扫描机制，解析顺序如下：

1. **模块注册表显式登记**（`register.ts` 中的 `components` 映射）
2. **约定路径**：`/src/modules/<domain>/views/<rest>.vue`
3. **旧 views 目录兜底**：`/src/views/<componentPath>.vue`

因此：

- 现有 `views/system/*` 等页面**无需迁移**，后端菜单 SQL 不需要改动
- 新模块放在 `modules/` 下，通过 `register.ts` 显式登记即可
- 后端误下发当前 edition 不存在的组件时，会跳过该菜单并打印 `console.warn`，不会白屏

---

## 参考实现

- `src/modules/toolbox/` — toolbox 代码生成器，sz-admin 提供的迁移样板
