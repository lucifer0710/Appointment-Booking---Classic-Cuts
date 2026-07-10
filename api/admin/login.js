const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const authRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });

    const authData = await authRes.json();
    if (!authRes.ok) {
      return res.status(401).json({ error: authData.error?.message || 'Authentication failed' });
    }

    if (authData.email !== 'singlakunal313@gmail.com') {
      return res.status(403).json({ error: 'Access denied: Unauthorized administrator email.' });
    }

    return res.status(200).json({
      token: authData.idToken,
      email: authData.email
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    return res.status(500).json({ error: error.message });
  }
};
