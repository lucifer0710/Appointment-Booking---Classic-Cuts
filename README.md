# 💈 Barber Shop Booking System

A real-time appointment booking web application built with **HTML**, **CSS**, **JavaScript**, and **Firebase**. This system allows customers to book slots instantly and allows the barber to see updates live on their own device without refreshing.

🚀 Live Demo for CUSTOMER VIEW ---    *classiccuts.vercel.app*
---
🚀 Live Demo for BARBER VIEW ---    *classiccuts.vercel.app/admin.html*
---

## ✨ Features

### 👤 Customer Portal (`index.html`)
* **Real-time Slots:** See which time slots are available or taken instantly.
* **Booking System:** Customers can book a slot by entering their Name and Phone Number.
* **Cancellation:** Customers can cancel their own appointments by verifying their phone number.
* **Live Updates:** If another user books a slot, it updates on everyone's screen immediately.
* **Confirmation:** Shows a "ticket" visual upon successful booking.

### ✂️ Admin Dashboard (`admin.html`)
* **Live Dashboard:** View all appointments for the day in a clean table format.
* **Instant Sync:** Updates automatically when a customer books or cancels.
* **Management:** The barber can cancel any booking directly from the dashboard.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
* **Backend (Database):** Google Firebase Realtime Database
* **Hosting:** Vercel / GitHub Pages / Netlify (Static Hosting)

---

## 🚀 How to Set Up (Locally)

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/barber-shop.git](https://github.com/your-username/barber-shop.git)
cd barber-shop 

```
### 2. Configure Firebase
Since this app uses Firebase, you need your own API keys.

* Go to Firebase Console.

* Create a new project.

* Go to Build → Realtime Database → Create Database (Select Test Mode).

* Go to Project Settings → General → Click the </> (Web) icon.

* Copy the firebaseConfig object.

### 3. Update the Code
Open both index.html and admin.html. Look for the configuration section and paste your keys:
```bash
// REPLACE THIS SECTION IN BOTH FILES
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "[https://your-project-default-rtdb.firebaseio.com](https://your-project-default-rtdb.firebaseio.com)",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123...",
    appId: "1:123..."
};
```
---

### 🌐 Deployment (Vercel)
This project is static, making it free and easy to deploy.

Push your code to GitHub.

Log in to Vercel.

Click "Add New Project" and select your repository.

Click Deploy.
