import { defineModule } from '@/core';

/**
 * audit 模块：数据库审计、性能诊断和异常诊断查询能力。
 *
 * 后端菜单 SQL 中 component 字段保持 '/system/sysOperationLog/index'，
 * 通过显式登记映射到 modules/audit 下的页面。
 */
export const auditModule = defineModule({
  name: 'audit',
  components: {
    '/system/sysOperationLog/index': () => import('./views/sysOperationLog/index.vue')
  }
});
