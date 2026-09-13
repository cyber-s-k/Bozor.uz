const { getArray, setArray } = require('../_lib/kv');

module.exports = async (req, res) => {
  try {
    const ownerId = req.headers['x-owner-id'];
    if (!ownerId) {
      res.status(400).json({ error: 'Owner id required' });
      return;
    }

    if (req.method === 'POST') {
      const { id, customerName, phone, address, paymentMethod, items, total } = req.body || {};

      if (!id || !customerName || !phone || !address || !Array.isArray(items) || !items.length) {
        res.status(400).json({ error: 'Заполните имя, телефон и адрес доставки.' });
        return;
      }

      const orders = await getArray('orders');
      const order = {
        id: String(id),
        owner_id: ownerId,
        customerName: String(customerName).slice(0, 200),
        phone: String(phone).slice(0, 40),
        address: String(address).slice(0, 300),
        paymentMethod: paymentMethod === 'cash' ? 'cash' : 'card',
        items,
        total: Number(total) || 0,
        created_at: new Date().toISOString()
      };

      orders.unshift(order);
      await setArray('orders', orders);

      res.status(201).json(order);
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
};
