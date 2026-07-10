const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

async function verifyAdmin(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Unauthorized: Missing token');
    error.status = 401;
    throw error;
  }
  const idToken = authHeader.split(' ')[1];
  
  const lookupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });
  
  const lookupData = await lookupRes.json();
  if (!lookupRes.ok || !lookupData.users || lookupData.users.length === 0) {
    const error = new Error('Unauthorized: Invalid token');
    error.status = 401;
    throw error;
  }
  
  const user = lookupData.users[0];
  if (user.email !== 'singlakunal313@gmail.com') {
    const error = new Error('Forbidden: Unauthorized administrator email');
    error.status = 403;
    throw error;
  }
  
  return { user, idToken };
}

module.exports = {
  verifyAdmin
};
