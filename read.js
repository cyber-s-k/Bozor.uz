const { getArray, setArray } = require('../_lib/kv');

module.exports = async (req, res) => {
  try {
    const ownerId = req.headers['x-owner-id'];
    if (!ownerId) {
      res.status(400).json({ error: 'Owner id required' });
      return;
    }

    if (req.method === 'PATCH') {
      const notifications = await getArray('notifications');
      let changed = false;
      notifications.forEach(n => {
        if (n.recipient === ownerId && n.unread) {
          n.unread = false;
          changed = true;
        }
      });
      if (changed) await setArray('notifications', notifications);

      const offers = await getArray('offers');
      let offersChanged = false;
      offers.forEach(o => {
        if (o.seller_id === ownerId && o.unread_seller) {
          o.unread_seller = false;
          offersChanged = true;
        }
        if (o.buyer_id === ownerId && o.unread_buyer) {
          o.unread_buyer = false;
          offersChanged = true;
        }
      });
      if (offersChanged) await setArray('offers', offers);

      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
};
