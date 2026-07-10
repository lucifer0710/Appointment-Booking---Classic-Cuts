const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { slotId, name, phone, time } = req.body || {};

  if (!slotId || !name || !phone || !time) {
    return res.status(400).json({ error: 'Missing required fields (slotId, name, phone, time)' });
  }

  try {
    // 1. Check if the slot is already taken
    const slotCheckRes = await fetch(`${FIREBASE_DATABASE_URL}/public_slots/${slotId}.json`);
    if (!slotCheckRes.ok) {
      const errText = await slotCheckRes.text();
      throw new Error(`Firebase check error: ${errText}`);
    }
    const slotCheck = await slotCheckRes.json();
    if (slotCheck) {
      return res.status(400).json({ error: 'Slot was just taken by someone else!' });
    }

    // 2. Perform updates
    const updates = {
      [`bookings/${slotId}`]: {
        name,
        phone,
        time,
        status: 'booked'
      },
      [`public_slots/${slotId}`]: {
        booked: true,
        time
      }
    };

    const updateRes = await fetch(`${FIREBASE_DATABASE_URL}/.json`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`Firebase update error: ${errText}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error booking slot:', error);
    return res.status(500).json({ error: error.message });
  }
};
