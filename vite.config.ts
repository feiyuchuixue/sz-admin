import { resolve } from "path";
import {fileURLToPath, URL} from 'node:url'
import {defineConfig, ConfigEnv, UserConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import {createSvgIconsPlugin} from "vite-plugin-svg-icons";

// https://vitejs.dev/config/
export default defineConfig(({mode}: ConfigEnv): UserConfig => {
  const root: string = process.cwd();
  const env: Record<string, string> = loadEnv(mode, root);

  return {
    base: env.VITE_PUBLIC_PATH,
    root,
    plugins: [
      vue(),
      vueJsx(),
      // 使用 svg 图标
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), "src/assets/icons")],
        symbolId: "icon-[dir]-[name]"
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/element/index.scss" as *;`
        }
      }
    },
    server: {
      host: "0.0.0.0",
      port: Number(env.VITE_PORT),
      open: env.VITE_OPEN === "true",
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          ws: true,
          rewrite: path => path.replace(new RegExp(`^/api`), ""),
          // https is require secure=false
          ...(/^https:\/\//.test(env.VITE_API_URL) ? {secure: false} : {})
        }
      },
    },
  }
})
