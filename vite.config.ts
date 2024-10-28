import { resolve } from "path";
import {fileURLToPath, URL} from 'node:url'
import {defineConfig, ConfigEnv, UserConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import {createSvgIconsPlugin} from "vite-plugin-svg-icons";
const path = require('node:path');

// https://vitejs.dev/config/
export default defineConfig(({mode}: ConfigEnv): UserConfig => {
  const root: string = process.cwd();
  const env: Record<string, string> = loadEnv(mode, root);

  return {
    base: env.VITE_PUBLIC_PATH,
    root,
    build: {
      outDir: 'sz-admin'
    },
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
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'package.json': path.resolve(__dirname, 'package.json')
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
      // open: env.VITE_OPEN === "true",
      proxy: {
        "/api": {
          // 这里代理到后端项目的api访问路径
          // 后端项目地址  https://github.com/feiyuchuixue/sz-admin.git
          // sz-admin 官网: https://szadmin.cn/
          target: "http://localhost:9991/api",
          changeOrigin: true,
          ws: true,
          rewrite: (path) => {
            return path.replace(/^\/api/, '')
          },
          // https is require secure=false
          ...(/^https:\/\//.test(env.VITE_API_URL) ? {secure: false} : {})
        }
      },
    },
  }
})
