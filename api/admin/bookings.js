const { verifyAdmin } = require('../_auth');
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Verify admin identity and get their token
    const { idToken } = await verifyAdmin(req);

    // Fetch bookings from database passing the token for authentication
    const bookingsRes = await fetch(`${FIREBASE_DATABASE_URL}/bookings.json?auth=${idToken}`);
    if (!bookingsRes.ok) {
      const errText = await bookingsRes.text();
      throw new Error(`Firebase database read error: ${errText}`);
    }
    const data = await bookingsRes.json();
    return res.status(200).json(data || {});
  } catch (error) {
    console.error('Error fetching bookings:', error);
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
};
