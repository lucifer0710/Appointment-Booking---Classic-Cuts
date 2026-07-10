const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { slotId, phone } = req.body || {};

  if (!slotId || !phone) {
    return res.status(400).json({ error: 'Missing required fields (slotId, phone)' });
  }

  try {
    // Perform direct updates. Firebase rules will authorize/deny this based on phone verification.
    const updates = {
      [`bookings/${slotId}/status`]: 'cancelled',
      [`bookings/${slotId}/verifyPhone`]: phone,
      [`public_slots/${slotId}`]: null
    };

    const updateRes = await fetch(`${FIREBASE_DATABASE_URL}/.json`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!updateRes.ok) {
      // Permission denied or other error (e.g. incorrect phone number)
      return res.status(403).json({ error: 'Incorrect Phone Number or booking not found.' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({ error: error.message });
  }
};
