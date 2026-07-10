const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const response = await fetch(`${FIREBASE_DATABASE_URL}/public_slots.json`);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Firebase error: ${errText}`);
    }
    const data = await response.json();
    return res.status(200).json(data || {});
  } catch (error) {
    console.error('Error fetching slots:', error);
    return res.status(500).json({ error: error.message });
  }
};
