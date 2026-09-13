const { kv } = require('@vercel/kv');

// Все объявления/предложения/уведомления/заказы хранятся как единые JSON-массивы
// под простыми ключами. Для масштаба маленького маркетплейса этого достаточно.

async function getArray(key) {
  const val = await kv.get(key);
  return Array.isArray(val) ? val : [];
}

async function setArray(key, arr) {
  await kv.set(key, arr);
}

module.exports = { kv, getArray, setArray };
