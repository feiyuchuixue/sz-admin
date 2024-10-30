/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_CLIENT_ID: string
  readonly VITE_APP_HTTP_TIMEOUT: number
  readonly VITE_SOCKET_URL: string
  readonly VITE_ADMIN_BYPASS_PERMISSION: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
