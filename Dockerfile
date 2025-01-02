# 使用官方的 Nginx 镜像作为基础镜像
FROM nginx:1.27.3
LABEL authors="sz"

# 将前端项目静态文件复制到容器中
COPY ./dist /usr/share/nginx/sz-admin

# 暴露 9800 端口
EXPOSE 9800

# 启动 Nginx 服务
CMD ["nginx", "-g", "daemon off;"]
