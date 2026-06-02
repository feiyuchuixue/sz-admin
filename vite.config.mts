// vite.config.mts
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, ConfigEnv, UserConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import viteCompression from 'vite-plugin-compression';
// @ts-expect-error package.json is imported for build-time version injection.
import pkg from './package.json';

// 由于我们使用的是 ESM，不再需要 const path = require('node:path');
// 直接使用 import { resolve } from 'path'; 即可

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();
  const env = loadEnv(mode, root);
  const normalizeApiBase = (value: string | undefined, fallback: string) => {
    const raw = (value || fallback).trim();
    const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
    return withLeadingSlash.replace(/\/+$/, '');
  };
  const createApiProxy = (target: string) => ({
    target,
    changeOrigin: true,
    ws: true,
    ...(/^https:\/\//.test(target) ? { secure: false } : {})
  });
  const adminApiBase = normalizeApiBase(env.VITE_ADMIN_API_BASE, '/api/admin');
  const generatorApiBase = normalizeApiBase(env.VITE_GENERATOR_API_BASE, '/api/generator');
  const auditApiBase = normalizeApiBase(env.VITE_AUDIT_API_BASE, '/api/audit');
  const apiContextPath = normalizeApiBase(env.VITE_API_CONTEXT_PATH || env.VITE_MODULE_API_BASE, '/api');
  const proxyTarget = env.VITE_API_PROXY_TARGET;
  const proxy = proxyTarget
    ? {
        [apiContextPath]: createApiProxy(proxyTarget),
        [adminApiBase]: createApiProxy(proxyTarget),
        [generatorApiBase]: createApiProxy(proxyTarget),
        [auditApiBase]: createApiProxy(proxyTarget)
      }
    : {};

  return {
    base: env.VITE_PUBLIC_PATH,
    root,
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      // 使用 svg 图标
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
        symbolId: 'icon-[dir]-[name]'
      }),
      // 配置 gzip 压缩插件
      viteCompression({
        algorithm: 'gzip', // 使用 gzip 压缩
        ext: '.gz', // 压缩文件扩展名
        threshold: 10240, // 只有大于 10 KB 的文件才会被压缩
        deleteOriginFile: false // 不删除源文件
      })
    ],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version)
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'package.json': new URL('package.json', import.meta.url).pathname
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler', // https://github.com/sass/dart-sass/issues/2395#issuecomment-988870897
          additionalData: `@use "@/styles/element/index.scss" as *;`
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (/[\\/]node_modules[\\/](vue|vue-router|pinia|@vueuse)[\\/]/.test(id)) return 'vue-vendor';
            if (/[\\/]node_modules[\\/](element-plus|@element-plus)[\\/]/.test(id)) return 'element-plus';
            if (/[\\/]node_modules[\\/](jodit|dompurify)[\\/]/.test(id)) return 'rich-editor';
            if (/[\\/]node_modules[\\/](highlight\.js|@highlightjs)[\\/]/.test(id)) return 'highlight';
            if (/[\\/]node_modules[\\/]axios[\\/]/.test(id)) return 'http';
            return 'vendor';
          }
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_PORT),
      open: env.VITE_OPEN === 'true',
      proxy
    }
  };
});
