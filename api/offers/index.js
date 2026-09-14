const crypto = require('crypto');
const { getArray, setArray } = require('../_lib/kv');

module.exports = async (req, res) => {
  try {
    const ownerId = req.headers['x-owner-id'];
    if (!ownerId) {
      res.status(400).json({ error: 'Owner id required' });
      return;
    }

    if (req.method === 'GET') {
      const offers = await getArray('offers');
      const mine = offers
        .filter(o => o.seller_id === ownerId || o.buyer_id === ownerId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      res.status(200).json(mine);
      return;
    }

    if (req.method === 'POST') {
      const { id, listingId, price } = req.body || {};
      if (!id || !listingId || !price || Number(price) <= 0) {
        res.status(400).json({ error: 'Введите корректную цену.' });
        return;
      }

      const listings = await getArray('listings');
      const listing = listings.find(x => String(x.id) === String(listingId));
      if (!listing) {
        res.status(404).json({ error: 'Товар не найден' });
        return;
      }
      if (listing.owner_id === ownerId) {
        res.status(400).json({ error: 'Нельзя предложить цену на свой товар' });
        return;
      }

      const offers = await getArray('offers');
      const offer = {
        id: String(id),
        listingId: String(listingId),
        product: listing.name,
        price: Number(price),
        original: Number(listing.price),
        status: 'pending',
        seller_id: listing.owner_id,
        buyer_id: ownerId,
        unread_seller: true,
        unread_buyer: false,
        created_at: new Date().toISOString()
      };
      offers.unshift(offer);
      await setArray('offers', offers);

      const notifications = await getArray('notifications');
      notifications.unshift({
        id: crypto.randomUUID(),
        type: 'offer',
        text: `Покупатель предлагает ${Number(price).toLocaleString('ru-RU')} сум за «${listing.name}»`,
        unread: true,
        recipient: listing.owner_id,
        created_at: new Date().toISOString()
      });
      await setArray('notifications', notifications);

      res.status(201).json(offer);
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
};
