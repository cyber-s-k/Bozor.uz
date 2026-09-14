const crypto = require('crypto');
const { getArray, setArray } = require('../_lib/kv');

module.exports = async (req, res) => {
  try {
    const { id } = req.query;
    const ownerId = req.headers['x-owner-id'];
    if (!ownerId) {
      res.status(400).json({ error: 'Owner id required' });
      return;
    }

    if (req.method === 'PATCH') {
      const { approve } = req.body || {};
      const offers = await getArray('offers');
      const idx = offers.findIndex(o => String(o.id) === String(id));

      if (idx === -1) {
        res.status(404).json({ error: 'Предложение не найдено' });
        return;
      }

      const offer = offers[idx];
      if (offer.seller_id !== ownerId) {
        res.status(403).json({ error: 'Решение может принять только продавец' });
        return;
      }

      offer.status = approve ? 'approved' : 'rejected';
      offer.unread_seller = false;
      offer.unread_buyer = true;
      offers[idx] = offer;
      await setArray('offers', offers);

      const notifications = await getArray('notifications');
      notifications.unshift({
        id: crypto.randomUUID(),
        type: approve ? 'approved' : 'rejected',
        text: approve
          ? `Продавец одобрил вашу цену за «${offer.product}»`
          : `Продавец отклонил вашу цену за «${offer.product}»`,
        unread: true,
        recipient: offer.buyer_id,
        created_at: new Date().toISOString()
      });
      await setArray('notifications', notifications);

      res.status(200).json(offer);
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
};
