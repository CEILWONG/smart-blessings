const http = require('http');
const config = require('./config');
const { setupRoutes } = require('./routes');
const logger = require('./utils/logger');

if (!config.dashscope.apiKey) {
  logger.error('错误：请设置环境变量 DASHSCOPE_API_KEY');
  process.exit(1);
}

const server = http.createServer();

setupRoutes(server);

server.listen(config.port, () => {
  logger.info(`✅ ${config.app.name}已启动`);
  logger.info(`🌐 访问地址: http://localhost:${config.port}`);
});

function shutdown() {
  logger.info('🛑 正在关闭服务...');
  server.close(() => {
    logger.info('👋 服务已停止');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
