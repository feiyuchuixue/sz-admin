/**
 * 后台管理 API 前缀，当前指向后端 sz-service-admin 启动的 /admin 上下文。
 *
 * --------------------------------------------------------------------
 * 如何为新业务（例如 SSO 认证中心、独立微服务）新增前缀
 * --------------------------------------------------------------------
 * 1) 在本文件追加导出常量，命名建议为 <DOMAIN>_MODULE：
 *      export const SSO_AUTH_MODULE: string = '/sso';
 *      export const REPORT_MODULE: string = '/report';
 *
 * 2) 在对应业务 API 文件中引用：
 *      import { SSO_AUTH_MODULE } from '@/api/helper/prefix';
 *      http.get(SSO_AUTH_MODULE + '/login', ...);
 *
 * 3) 同步检查网关 / Vite proxy / Nginx 已经为该前缀配置了路由转发。
 *
 * 注意：
 *   - 不要重命名 ADMIN_MODULE，它已被外部代码（含派生仓库）大量引用。
 *   - 不要在新前缀里塞 sz-service-admin 已有路径，避免语义混乱。
 */
export const ADMIN_MODULE: string = '/admin';
