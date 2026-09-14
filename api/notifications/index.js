const { getArray } = require('../_lib/kv');

module.exports = async (req, res) => {
  try {
    const ownerId = req.headers['x-owner-id'];
    if (!ownerId) {
      res.status(400).json({ error: 'Owner id required' });
      return;
    }

    if (req.method === 'GET') {
      const notifications = await getArray('notifications');
      const mine = notifications
        .filter(n => n.recipient === ownerId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      res.status(200).json(mine);
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
};
