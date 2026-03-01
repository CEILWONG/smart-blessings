const https = require('https');
const config = require('../config');
const logger = require('../utils/logger');

function callQwen(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: config.dashscope.model,
      input: { messages: [{ role: 'user', content: prompt }] },
      parameters: { max_tokens: 400, temperature: 0.85, top_p: 0.9 }
    });

    const options = {
      hostname: config.dashscope.baseUrl,
      port: 443,
      path: '/api/v1/services/aigc/text-generation/generation',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.dashscope.apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      let finalText = '';

      res.on('data', chunk => {
        body += chunk;
        const lines = body.split('\n');
        body = lines.pop();

        lines.forEach(line => {
          if (line.trim().startsWith('data:')) {
            const jsonString = line.trim().replace('data:', '', 1).trim();
            if (jsonString === '[DONE]') return;

            try {
              const jsonChunk = JSON.parse(jsonString);
              if (jsonChunk.output?.choices?.[0]?.delta?.content) {
                finalText += jsonChunk.output.choices[0].delta.content;
              } else if (jsonChunk.output?.choices?.[0]?.message?.content) {
                finalText = jsonChunk.output.choices[0].message.content;
              }
            } catch (e) {
              logger.error('解析 Chunk 失败:', e.message);
            }
          }
        });
      });

      res.on('end', () => {
        if (finalText.trim()) {
          resolve(finalText.trim());
        } else {
          try {
            const result = JSON.parse(body);
            if (result.output?.choices?.[0]?.message?.content) {
              resolve(result.output.choices[0].message.content.trim());
            } else {
              reject(new Error('无法从响应中提取文本: ' + JSON.stringify(result)));
            }
          } catch (e) {
            reject(new Error('响应解析失败: ' + e.message));
          }
        }
      });
    });

    req.on('error', (err) => {
      logger.error('API 请求失败:', err.message);
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

module.exports = { callQwen };
