# 💈 Barber Shop Booking System (Hardened & Secured)
---
🚀 Live Demo for CUSTOMER VIEW ---    *classiccuts.vercel.app*
---
🚀 Live Demo for BARBER VIEW ---    *classiccuts.vercel.app/admin.html*
---
---
A secure, real-time appointment booking web application built with **HTML**, **CSS**, **Vanilla JavaScript**, and **Firebase**. This system allows customers to view availability and book/cancel slots instantly, and provides a password-protected admin dashboard for the barber to view and manage all bookings in real time.



## 🔒 Security Enhancements & Hardening

We have audited and rewritten the application structure and security rules to resolve vulnerabilities:

1. **PII Protection:** Client booking details (names and phone numbers) are stored in a private `/bookings` node that is **restricted only to the authenticated admin** (`admin@gmail.com`). Standard users can only read `/public_slots`, which reveals whether a slot is booked or free without exposing any personal contact details.
2. **Secure Cancellations:** Instead of checking phone numbers client-side (which is easily bypassable), standard clients submit a status update with a verification phone number. The Firebase Realtime Database Security Rules perform a secure, server-side validation against the database records to approve or reject the cancellation.
3. **Admin Dashboard Authentication:** The admin panel (`admin.html`) is protected by a matching styled login screen, requiring Firebase Authentication to access any customer dashboard data.

---

## 📁 Codebase Structure

The codebase is split into modular files to keep styles and application logic clean and maintainable:
*   `index.html`: The user-facing page structure for booking slots.
*   `style.css`: All user-facing styles and modal animations.
*   `app.js`: User-facing real-time booking and cancellation database logic.
*   `admin.html`: The barber's dashboard page layout.
*   `admin.css`: Dashboard table, badge, and login overlay styles.
*   `admin.js`: Admin login controller and live dashboard state manager.

---

## 🛠️ Step-by-Step Setup

### 1. Configure Firebase Console Settings
To use this system, you need to enable Email/Password login and create your admin account:
1. Go to the **Firebase Console** and select your project.
2. Go to **Authentication > Sign-in method**.
3. Enable the **Email/Password** provider and save.
4. Go to the **Users** tab and click **Add user**.
5. Enter the administrator email: `admin@gmail.com`
6. Set a secure password and click **Add user**.

### 2. Configure Firebase Security Rules
Deploy these rules to your Realtime Database to restrict reads/writes and enforce server-side validations:
1. Go to **Realtime Database > Rules**.
2. Replace your current rules with the following rules:
```json
{
  "rules": {
    "bookings": {
      // Only the admin can read booking details (contains client names and phone numbers)
      ".read": "auth != null && auth.token.email == 'admin@gmail.com'",
      "$slotId": {
        // Admin can write anything.
        // A client can write to create a new booking if the slot is free.
        // A client can update status to 'cancelled' if they provide the matching phone number.
        ".write": "
          (auth != null && auth.token.email == 'admin@gmail.com') ||
          (
            (!data.exists() || data.child('status').val() == 'cancelled') && 
            newData.exists() && 
            newData.child('status').val() == 'booked' && 
            newData.child('name').isString() && 
            newData.child('phone').isString()
          ) ||
          (
            data.exists() && 
            data.child('status').val() == 'booked' && 
            newData.exists() && 
            newData.child('status').val() == 'cancelled' && 
            newData.child('verifyPhone').val() == data.child('phone').val()
          )
        "
      }
    },
    "public_slots": {
      // Anyone can see availability
      ".read": "true",
      "$slotId": {
        // Admin can write anything.
        // A client can mark a slot as booked if it is free.
        // A client can delete a public slot if it is booked.
        ".write": "
          (auth != null && auth.token.email == 'admin@gmail.com') ||
          (!data.exists() && newData.exists() && newData.child('booked').val() == true) ||
          (data.exists() && !newData.exists())
        "
      }
    }
  }
}
```
3. Click **Publish**.

### 3. Update Client Configurations
Before running the app, update your Firebase settings:
1. Open **`app.js`** and **`admin.js`**.
2. Locate the `firebaseConfig` block at the top of both files:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     databaseURL: "YOUR_DATABASE_URL",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```
3. Replace the placeholder strings with your actual Firebase project credentials copied from the Firebase project settings.
