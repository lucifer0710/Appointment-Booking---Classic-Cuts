const { verifyAdmin } = require('../_auth');
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { slotId } = req.body || {};

  if (!slotId) {
    return res.status(400).json({ error: 'Missing slotId' });
  }

  try {
    // Verify admin identity and get their token
    const { idToken } = await verifyAdmin(req);

    // Perform direct cancellation (deleting the records) passing the token for auth
    const updates = {
      [`bookings/${slotId}`]: null,
      [`public_slots/${slotId}`]: null
    };

    const updateRes = await fetch(`${FIREBASE_DATABASE_URL}/.json?auth=${idToken}`, {
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
    console.error('Error admin cancelling booking:', error);
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
};
