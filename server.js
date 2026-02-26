// server.js - 原生 Node.js + Qwen API 祝福生成器 (已升级风格模块)
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 🔑 从环境变量读取 API Key
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
if (!DASHSCOPE_API_KEY) {
  console.error('❌ 错误：请设置环境变量 DASHSCOPE_API_KEY');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const HTML_FILE = path.join(__dirname, 'zhufu.html');

// 调用 Qwen API 的函数

// ✅ 修改后的 callQwen 函数（支持处理流式响应）
// ✅ 终极版 callQwen 函数 (兼容 qwen3-max 的强制流式输出)
function callQwen(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: "qwen3-max", // 确保模型名正确
      input: {
        messages: [{ role: "user", content: prompt }]
      },
      parameters: {
        max_tokens: 400,
        temperature: 0.85,
        top_p: 0.9
        // 注意：qwen3-max 可能会忽略 stream: false，所以我们后端必须自己处理流
        // stream: false 
      }
    });

    const options = {
      hostname: 'dashscope.aliyuncs.com',
      port: 443,
      path: '/api/v1/services/aigc/text-generation/generation',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      let finalText = '';

      res.on('data', chunk => {
        body += chunk;

        // ✅ 关键点：边接收边处理（流式处理）
        // 因为 qwen3-max 很可能返回的是流，我们不能等 'end' 事件才处理
        const lines = body.split('\n');
        body = lines.pop(); // 把不完整的最后一行留着，剩下的处理掉

        lines.forEach(line => {
          if (line.trim().startsWith('data:')) {
            const jsonString = line.trim().replace('data:', '', 1).trim();
            if (jsonString === '[DONE]') return;

            try {
              const jsonChunk = JSON.parse(jsonString);

              // 路径1: 如果是流式结构，文本在 delta.content 里
              if (jsonChunk.output?.choices?.[0]?.delta?.content) {
                finalText += jsonChunk.output.choices[0].delta.content;
              }
              // 路径2: 如果是完整结构，文本在 message.content 里
              else if (jsonChunk.output?.choices?.[0]?.message?.content) {
                finalText = jsonChunk.output.choices[0].message.content;
              }
            } catch (e) {
              // 解析单个 chunk 失败就跳过，不要 throw，继续接收下一行
              console.error('解析 Chunk 失败:', e);
            }
          }
        });
      });

      res.on('end', () => {
        // 如果在流处理中已经拼接出了文本，直接返回
        if (finalText.trim()) {
          resolve(finalText.trim());
        } else {
          // 如果上面的流处理没捕获到（比如服务器一次性返回了JSON）
          // 再尝试用传统方式解析一次
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

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}








// ✅ 修改点1: 构造 Prompt - 增加了 style 参数
function buildPrompt(name, identity, day, style) {
  const identityMap = {
    '长辈': '父母、祖父母等年长亲人，需要尊敬、传统、健康长寿的祝福',
    '平辈': '朋友、同事、兄弟姐妹等同龄人，需要亲切、自然、友谊长存的祝福',
    '晚辈': '孩子、学生等年轻一代，需要鼓励、活泼、学业进步的祝福',
    '领导': '公司领导，需要正式、大气、事业高升的祝福',
    '客户': '合作伙伴或重要客户，需要商务、互利共赢、财源广进的祝福',
    '爱人': '伴侣或恋人，需要浪漫、深情、甜蜜的祝福',
    '同学': '老同学或校友，需要怀旧、轻松、回忆杀的祝福',
    '老师': '恩师，需要感恩、敬重、桃李满天下的祝福'
  };

  const identityDesc = identityMap[identity] || identity;

  // ✅ 修改点1: 重构风格描述，特别是幽默风格
  let styleInstruction = '';
  let toneExample = '';

  switch (style) {
    case '幽默搞怪':
      styleInstruction = `
        ✍️ **核心风格 - 幽默搞怪**：
        - 必须打破常规，拒绝老气横秋。
        - 使用夸张、自嘲、反转或网络热梗。
        - 可以用“土味情话”或者“一本正经胡说八道”的语气。
      `;
      break;
    case '真诚用心':
      styleInstruction = '✍️ **核心风格 - 真诚用心**：语气走心、温暖、朴实，像面对面聊天一样自然，注重情感表达。';
      break;
    case '传统吉祥':
      styleInstruction = '✍️ **核心风格 - 传统吉祥**：使用成语、对仗句式，辞藻华丽，充满年味和仪式感。';
      break;
    case '文艺清新':
      styleInstruction = '✍️ **核心风格 - 文艺清新**：引用诗词或优美散文，意境深远，简洁唯美。';
      break;
    case '职场商务':
      styleInstruction = '✍️ **核心风格 - 职场商务**：措辞严谨、得体、大气，侧重事业、合作和财运，不卑不亢。';
      break;
    case '简短精炼':
      styleInstruction = '✍️ **核心风格 - 简短精炼**：直击要点，不啰嗦，一句话到位。';
      break;
    default:
      styleInstruction = '✍️ **核心风格**：自然流畅。';
  }

  // ✅ 修改点2: 极其强硬的输出指令
  return `你是一位全能的祝福文案大师。请根据以下信息，创作一条独一无二的2026马年新春祝福语：

【基本信息】
- 对方称呼：${name}
- 对方身份：${identity} (${identityDesc})
- 发送时间：${day}

【创作要求】
1. ${styleInstruction}

2. 🐎 **元素**：融入“马年”等意象，祝福语里巧妙融入对方称呼（如名字、昵称），不要生硬堆砌。

3. 📏 **字数控制**：严格控制在 80 到 150 个汉字之间（简短风格除外）。

4. 🚫 **输出规范（非常重要）**：
   - 不要使用引号、markdown格式、序号。
   - 不要输出任何解释、前缀（如“祝你”、“亲爱的”）、后缀或礼貌用语。
   - **直接输出纯文本的祝福语内容**。
   - **如果是幽默风格，必须包含至少一个具体的梗、夸张的比喻或反转笑点。**

请开始你的创作：`;
}












// HTTP 服务器
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // 静态首页
  if (parsedUrl.pathname === '/' && req.method === 'GET') {
    fs.readFile(HTML_FILE, 'utf8', (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('❌ 未找到 zhufu.html 文件');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
    return;
  }

  // 健康检查
  if (parsedUrl.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ status: 'OK', message: '马年祝福生成器运行中 🐴' }));
    return;
  }

  // AI 生成接口
  if (parsedUrl.pathname === '/generate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        // ✅ 修改点4: 解构赋值时接收 style 参数
        const { name, identity, day, style } = JSON.parse(body);
        
        // 简单的参数校验
        if (!name || !identity || !day || !style) {
          throw new Error('参数缺失');
        }

        const prompt = buildPrompt(name, identity, day, style);
        const blessing = await callQwen(prompt);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, blessing }));
      } catch (err) {
        console.error('生成失败:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'AI 生成失败，请重试' }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  console.log(`✅ 马年祝福生成器已启动`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`📄 HTML 文件: ${HTML_FILE}`);
});

// 优雅关闭
function shutdown() {
  console.log('\n🛑 正在关闭服务...');
  server.close(() => {
    console.log('👋 服务已停止');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);