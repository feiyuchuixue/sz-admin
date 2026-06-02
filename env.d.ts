/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_ADMIN_API_BASE?: string;
  readonly VITE_GENERATOR_API_BASE?: string;
  readonly VITE_AUDIT_API_BASE?: string;
  readonly VITE_API_CONTEXT_PATH?: string;
  readonly VITE_MODULE_API_BASE?: string;
  readonly VITE_API_PROXY_TARGET?: string;
  readonly VITE_APP_CLIENT_ID: string;
  readonly VITE_APP_HTTP_TIMEOUT: number;
  readonly VITE_SOCKET_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
