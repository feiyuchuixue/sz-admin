import type { Component } from 'vue';

/**
 * 模块定义：一组高内聚的业务能力，可包含页面组件、菜单种子等。
 *
 * sz-admin 仓库本身只通过 toolbox 模块作为样板示范；
 * 真实业务模块由派生项目（SSO Community / Enterprise）注册。
 */
export interface ModuleDefinition {
  /** 模块唯一标识，建议格式：domain 或 domain.subdomain，例如 toolbox、sso.client */
  readonly name: string;

  /**
   * 页面组件映射。
   * key 为后端菜单下发的 component 字段（不含 .vue 后缀），
   * 例如 '/toolbox/generator/index'；
   * value 为 Vue 异步组件工厂或已加载组件。
   */
  readonly components?: Record<string, () => Promise<Component> | Component>;
}

/**
 * 工厂函数，便于使用方写法贴近 Vue / Vite 习惯。
 *
 * 用法：
 *   export const myModule = defineModule({
 *     name: 'toolbox',
 *     components: {
 *       '/toolbox/generator/index': () => import('./views/generator/index.vue')
 *     }
 *   });
 */
export function defineModule(def: ModuleDefinition): ModuleDefinition {
  return def;
}

class ModuleRegistry {
  private readonly modules = new Map<string, ModuleDefinition>();

  /** 注册一个模块；重复注册同名模块时忽略并打印警告 */
  register(module: ModuleDefinition): void {
    if (this.modules.has(module.name)) {
      console.warn(`[ModuleRegistry] 模块已注册，已忽略重复注册：${module.name}`);
      return;
    }
    this.modules.set(module.name, module);
  }

  /** 返回所有已注册模块的只读列表 */
  list(): ReadonlyArray<ModuleDefinition> {
    return Array.from(this.modules.values());
  }

  /**
   * 收集所有已注册模块的组件映射，合并为一个扁平对象。
   * 若不同模块登记了相同的 key，后注册的会覆盖先注册的，并打印警告。
   */
  collectComponents(): Record<string, () => Promise<unknown> | unknown> {
    const result: Record<string, () => Promise<unknown> | unknown> = {};
    for (const m of this.modules.values()) {
      if (!m.components) continue;
      for (const [key, value] of Object.entries(m.components)) {
        if (key in result) {
          console.warn(`[ModuleRegistry] 组件 key 冲突：${key}（来自模块 ${m.name}），后注册的将覆盖`);
        }
        result[key] = value;
      }
    }
    return result;
  }
}

/** 全局模块注册表单例 */
export const moduleRegistry = new ModuleRegistry();

/** 旧 views 目录扫描结果（向后兼容，保证现有菜单零迁移成本） */
const legacyViews = import.meta.glob('@/views/**/*.vue');

/** 新模块目录扫描结果 */
const moduleViews = import.meta.glob('@/modules/**/views/**/*.vue');

/**
 * 根据后端菜单下发的 component 字符串解析对应的 Vue 组件。
 *
 * 解析顺序（先命中即返回）：
 *   1. 已注册模块通过 components 映射显式登记
 *   2. modules/<domain>/views/<rest>.vue 约定路径
 *   3. views/<componentPath>.vue 旧目录兜底
 *   4. 全部未命中 → 返回 null，调用方应跳过该菜单并打印 warn
 *
 * @param componentPath 后端下发的 component 字段，例如 '/system/accountManage/index'
 */
export function resolveMenuComponent(componentPath: string) {
  if (!componentPath) return null;

  // 1. 注册表显式登记优先
  const registered = moduleRegistry.collectComponents();
  if (componentPath in registered) return registered[componentPath];

  // 2. 模块目录约定路径
  // 约定：'/toolbox/generator/index' → '/src/modules/toolbox/views/generator/index.vue'
  const segs = componentPath.replace(/^\//, '').split('/');
  if (segs.length >= 2) {
    const domain = segs[0];
    const rest = segs.slice(1).join('/');
    const moduleKey = `/src/modules/${domain}/views/${rest}.vue`;
    if (moduleKey in moduleViews) return moduleViews[moduleKey];
  }

  // 3. 旧 views 目录兜底
  const legacyKey = `/src/views${componentPath}.vue`;
  if (legacyKey in legacyViews) return legacyViews[legacyKey];

  // 4. 未命中
  return null;
}
