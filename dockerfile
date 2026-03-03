# 基础镜像：轻量的Node.js 18 Alpine版本
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 第一步先复制依赖清单（利用Docker缓存，避免改代码重复装依赖）
COPY package*.json ./

# 安装生产依赖（--only=production 跳过开发依赖，减小体积）
RUN npm install --only=production

# 复制项目所有代码（.dockerignore会过滤不需要的文件）
COPY . .

# 定义环境变量（默认值，用户可通过Compose覆盖）
ENV PORT=3000
ENV AI_API_KEY=""

# 暴露端口（仅声明，实际映射在Compose里配置）
EXPOSE $PORT

# 启动应用（假设你的入口文件是src/app.js，根据实际修改）
CMD ["node", "src/app.js"]