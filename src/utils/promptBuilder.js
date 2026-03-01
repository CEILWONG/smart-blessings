const { IDENTITY_MAP, STYLE_INSTRUCTIONS } = require('../constants/prompt');

function buildPrompt(name, identity, day, style) {
  const identityDesc = IDENTITY_MAP[identity] || identity;
  const styleInstruction = STYLE_INSTRUCTIONS[style] || '✍️ **核心风格**：自然流畅。';

  return `你是一位全能的祝福文案大师。请根据以下信息，创作一条独一无二的2026马年新春祝福语：

【基本信息】
- 对方称呼：${name}
- 对方身份：${identity} (${identityDesc})
- 发送时间：${day}

【创作要求】
1. ${styleInstruction}

2. 🐎 **元素**：融入"马年"等意象，祝福语里巧妙融入对方称呼（如名字、昵称），不要生硬堆砌。

3. 📏 **字数控制**：严格控制在 80 到 150 个汉字之间（简短风格除外）。

4. 🚫 **输出规范（非常重要）**：
   - 不要使用引号、markdown格式、序号。
   - 不要输出任何解释、前缀（如"祝你"、"亲爱的"）、后缀或礼貌用语。
   - **直接输出纯文本的祝福语内容**。
   - **如果是幽默风格，必须包含至少一个具体的梗、夸张的比喻或反转笑点。**

请开始你的创作：`;
}

module.exports = { buildPrompt };
