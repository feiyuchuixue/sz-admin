<template>
  <div>
    <div class="card mb10">
      <h4 class="title">简介</h4>
      <span class="text">
        <el-link type="primary" href="https://github.com/feiyuchuixue" target="_blank">Sz Admin</el-link>，一个基于 Spring Boot
        3、JDK21、Vue 3 和 Element-Plus
        的开源后台管理框架，致力于为您提供一个流畅、直观且功能强大的开发框架。它不仅融合了最新的技术趋势，而且通过精心设计，确保了系统的简洁性和高效，让使用者可以专注业务。
      </span>
    </div>
    <div class="card mb10">
      <h4 class="title">项目信息</h4>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="版本号" label-align="left">
          <el-tag>v{{ version }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="作者" label-align="left">
          <el-tag> 升职哦 （sz）</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="前端仓库" label-align="left">
          <el-link type="primary" href="https://github.com/feiyuchuixue/sz-admin" target="_blank"> Github: sz-admin </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="镜像仓库" label-align="left">
          <el-link type="primary" href="https://gitee.com/feiyuchuixue/sz-admin" target="_blank"> Gitee: sz-admin</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="后端仓库" label-align="left">
          <el-link type="primary" href="https://github.com/feiyuchuixue/sz-boot-parent" target="_blank">
            Github: sz-boot-parent
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="镜像仓库" label-align="left">
          <el-link type="primary" href="https://gitee.com/feiyuchuixue/sz-boot-parent" target="_blank">
            Gitee: sz-boot-parent
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item :span="3" label="官网地址" label-align="left">
          <el-link type="primary" href="https://szadmin.cn" target="_blank"> https://szadmin.cn </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="文档地址" label-align="left">
          <el-link type="primary" href="https://szadmin.cn/md/Help/doc/info/start.html" target="_blank"> start </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="预览地址" label-align="left">
          <el-link type="primary" href="https://preview.szadmin.cn" target="_blank"> https://preview.szadmin.cn </el-link>
        </el-descriptions-item>
        <el-descriptions-item :span="3" label="更新日志" label-align="left">
          <el-link type="primary" href="https://szadmin.cn/md/Help/doc/other/change-log.html" target="_blank">
            change-log
          </el-link>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts" name="about">
const version: string = __APP_VERSION__;
</script>

<style lang="scss" scoped>
.card {
  .title {
    margin: 0 0 15px;
    font-size: 17px;
    font-weight: bold;
    color: var(--el-text-color-primary);
  }
  .text {
    font-size: 15px;
    line-height: 25px;
    color: var(--el-text-color-regular);
    .el-link {
      font-size: 15px;
    }
  }

  /* 添加 Markdown 内容样式 */
  [v-html] {
    padding: 1em;
    background: #f9f9f9;
    border-radius: 5px;
    line-height: 1.6;
    font-size: 14px;
    color: #333;
  }

  [v-html] h1,
  [v-html] h2,
  [v-html] h3 {
    border-bottom: 1px solid #ddd;
    padding-bottom: 0.3em;
    margin-bottom: 0.5em;
    color: #333;
  }

  [v-html] pre {
    background: #f3f3f3;
    padding: 1em;
    border-radius: 5px;
    overflow-x: auto;
  }

  [v-html] code {
    background: #f3f3f3;
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }
}
</style>
