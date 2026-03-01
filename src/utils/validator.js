const { VALID_IDENTITIES, VALID_STYLES, VALID_DAYS } = require('../constants/prompt');

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function validateGenerateParams(params) {
  const { name, identity, day, style } = params;
  const errors = [];

  if (!name || typeof name !== 'string') {
    errors.push('称呼不能为空');
  } else if (name.length > 20) {
    errors.push('称呼不能超过20字');
  }

  if (!identity || !VALID_IDENTITIES.includes(identity)) {
    errors.push('无效的身份类型');
  }

  if (!style || !VALID_STYLES.includes(style)) {
    errors.push('无效的祝福风格');
  }

  if (!day || !VALID_DAYS.includes(day)) {
    errors.push('无效的节日日期');
  }

  const sanitized = {
    name: name ? escapeHtml(name.trim()) : '',
    identity: identity || '',
    day: day || '',
    style: style || ''
  };

  return { valid: errors.length === 0, errors, data: sanitized };
}

module.exports = { validateGenerateParams, escapeHtml };
