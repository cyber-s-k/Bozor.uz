const { getArray, setArray } = require('../_lib/kv');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const listings = await getArray('listings');
      res.status(200).json(listings);
      return;
    }

    if (req.method === 'POST') {
      const ownerId = req.headers['x-owner-id'];
      if (!ownerId) {
        res.status(400).json({ error: 'Owner id required' });
        return;
      }

      const { id, name, price, cat, description, img } = req.body || {};

      if (!id || !name || !price || Number(price) <= 0) {
        res.status(400).json({ error: 'Заполните название и цену.' });
        return;
      }

      if (/\b(\d{4}[ -]?){3}\d{4}\b|\bCVV\b|\b(парол(ь|я)|password|pin)\b/i.test(String(description || ''))) {
        res.status(400).json({ error: 'Нельзя указывать данные карты, CVV или пароли в описании.' });
        return;
      }

      const listings = await getArray('listings');

      const item = {
        id: String(id),
        name: String(name).slice(0, 200),
        price: Number(price),
        cat: String(cat || 'Другое').slice(0, 60),
        description: String(description || '').slice(0, 2000),
        img: typeof img === 'string' ? img.slice(0, 2000000) : '',
        owner_id: ownerId,
        owner: 'Продавец',
        createdAt: new Date().toISOString()
      };

      listings.unshift(item);
      await setArray('listings', listings);

      res.status(201).json(item);
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
};
