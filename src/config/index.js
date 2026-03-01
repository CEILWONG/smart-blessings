require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  dashscope: {
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseUrl: 'dashscope.aliyuncs.com',
    model: 'qwen3-max'
  },
  app: {
    name: '马年祝福生成器'
  },
  logLevel: process.env.LOG_LEVEL || 'INFO'
};
