const { kv } = require('@vercel/kv');

async function getArray(key) {
  const val = await kv.get(key);
  return Array.isArray(val) ? val : [];
}

async function setArray(key, arr) {
  await kv.set(key, arr);
}

module.exports = { kv, getArray, setArray };
