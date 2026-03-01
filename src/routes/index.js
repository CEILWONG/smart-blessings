const fs = require('fs');
const path = require('path');
const { callQwen } = require('../services/qwen');
const { validateGenerateParams } = require('../utils/validator');
const { buildPrompt } = require('../utils/promptBuilder');
const logger = require('../utils/logger');

const HTML_FILE = path.join(__dirname, '../../public/zhufu.html');

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function serveStatic(res, filePath, contentType) {
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('文件未找到');
    }
    res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
    res.end(content);
  });
}

async function handleGenerate(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const params = JSON.parse(body);
      const { valid, errors, data } = validateGenerateParams(params);

      if (!valid) {
        return sendJson(res, 400, { success: false, errors });
      }

      logger.info('生成请求:', data);
      const prompt = buildPrompt(data.name, data.identity, data.day, data.style);
      const blessing = await callQwen(prompt);

      logger.info('生成成功');
      sendJson(res, 200, { success: true, blessing });
    } catch (err) {
      logger.error('生成失败:', err.message);
      sendJson(res, 500, { success: false, error: 'AI 生成失败，请重试' });
    }
  });
}

function setupRoutes(server) {
  server.on('request', async (req, res) => {
    const { method } = req;
    let parsedUrl;
    try {
      parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Invalid URL');
    }

    const pathname = parsedUrl.pathname;

    if (pathname === '/' && method === 'GET') {
      return serveStatic(res, HTML_FILE, 'text/html');
    }

    if (pathname === '/health' && method === 'GET') {
      return sendJson(res, 200, { status: 'OK', message: '马年祝福生成器运行中 🐴' });
    }

    if (pathname === '/generate' && method === 'POST') {
      return handleGenerate(req, res);
    }

    sendJson(res, 404, { error: 'Not Found' });
  });
}

module.exports = { setupRoutes };
