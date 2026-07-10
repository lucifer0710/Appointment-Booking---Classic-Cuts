require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(express.json());

// Serve static frontend files from customer and barber directories
app.use(express.static(path.join(__dirname, 'customer')));
app.use('/barber', express.static(path.join(__dirname, 'barber')));

// Wire Vercel serverless function exports to Express routes
app.get('/api/slots', require('./api/slots.js'));
app.post('/api/book', require('./api/book.js'));
app.post('/api/cancel', require('./api/cancel.js'));
app.get('/api/admin/bookings', require('./api/admin/bookings.js'));
app.post('/api/admin/cancel-booking', require('./api/admin/cancel-booking.js'));
app.post('/api/admin/login', require('./api/admin/login.js'));

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Classic Cuts Local Server running at http://localhost:${PORT}`);
  console.log(`👉 Customer view: http://localhost:${PORT}`);
  console.log(`👉 Barber admin view: http://localhost:${PORT}/barber/admin.html`);
  console.log(`\n⚠️ Make sure to create a '.env' file in this directory with your Firebase configuration!\n`);
});
