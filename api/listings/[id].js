const { getArray, setArray } = require('../_lib/kv');

module.exports = async (req, res) => {
  try {
    const { id } = req.query;
    const ownerId = req.headers['x-owner-id'];

    if (req.method === 'DELETE') {
      if (!ownerId) {
        res.status(400).json({ error: 'Owner id required' });
        return;
      }

      const listings = await getArray('listings');
      const idx = listings.findIndex(x => String(x.id) === String(id));

      if (idx === -1) {
        res.status(404).json({ error: 'Товар не найден' });
        return;
      }
      if (listings[idx].owner_id !== ownerId) {
        res.status(403).json({ error: 'Можно удалять только свои объявления' });
        return;
      }

      listings.splice(idx, 1);
      await setArray('listings', listings);

      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
};
