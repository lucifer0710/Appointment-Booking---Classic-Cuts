import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- PASTE THE SAME FIREBASE CONFIG HERE ---
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const generateSlots = () => {
    const times = [];
    for (let i = 9; i <= 17; i++) { 
        const period = i >= 12 ? 'PM' : 'AM';
        let hour = i > 12 ? i - 12 : i;
        times.push(`${hour}:00 ${period}`);
        if (i < 17) times.push(`${hour}:30 ${period}`);
    }
    return times;
};
const allSlots = generateSlots();

let bookingsUnsubscribe = null;

function loadDashboard() {
    if (bookingsUnsubscribe) bookingsUnsubscribe();

    const bookingsRef = ref(db, 'bookings');
    bookingsUnsubscribe = onValue(bookingsRef, (snapshot) => {
        const data = snapshot.val() || {};
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        allSlots.forEach(time => {
            const slotId = time.replace(/[:\s]/g, '');
            const booking = data[slotId];
            const isBooked = booking && booking.status === 'booked';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: bold; color: #fff;">${time}</td>
                <td><span class="badge ${isBooked ? 'badge-booked' : 'badge-free'}">${isBooked ? 'BOOKED' : 'FREE'}</span></td>
                <td style="color: ${isBooked ? '#fff' : '#a0c4ff'}">${isBooked ? booking.name : '-'}</td>
                <td class="hide-mobile" style="color: #8da9c4; font-family: monospace;">${isBooked ? booking.phone : '-'}</td>
                <td style="text-align: right;">
                    ${isBooked ? `<button class="btn-cancel" onclick="cancelBooking('${slotId}')">Cancel</button>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }, (error) => {
        console.error("Database read error: ", error);
        document.getElementById('tableBody').innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color: var(--status-red);">Permission Denied: ${error.message}</td></tr>`;
    });
}

// Authentication State Listener
onAuthStateChanged(auth, (user) => {
    const loginOverlay = document.getElementById('loginOverlay');
    const errorDiv = document.getElementById('loginError');
    errorDiv.innerText = '';

    if (user) {
        if (user.email === 'admin@gmail.com') {
            loginOverlay.style.display = 'none';
            loadDashboard();
        } else {
            errorDiv.innerText = "Access denied: Unauthorized administrator email.";
            signOut(auth);
        }
    } else {
        if (bookingsUnsubscribe) {
            bookingsUnsubscribe();
            bookingsUnsubscribe = null;
        }
        loginOverlay.style.display = 'flex';
        document.getElementById('tableBody').innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 30px; color: #a0c4ff;">Please login to view dashboard.</td></tr>';
    }
});

// Event Handlers
window.handleLogin = () => {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('loginError');
    errorDiv.innerText = '';

    if (!email || !password) {
        errorDiv.innerText = "Please fill in all fields.";
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .catch(err => {
            errorDiv.innerText = "Login failed: " + err.message;
        });
};

window.handleLogout = () => {
    signOut(auth);
};

window.cancelBooking = (slotId) => {
    if(confirm("Are you sure you want to cancel this booking?")) {
        const updates = {};
        updates['bookings/' + slotId] = null;
        updates['public_slots/' + slotId] = null;
        update(ref(db), updates).then(() => {
            alert("Booking cancelled successfully.");
        }).catch(e => alert("Error: " + e.message));
    }
};
