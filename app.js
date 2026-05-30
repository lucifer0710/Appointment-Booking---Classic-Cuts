import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, remove, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- PASTE YOUR FIREBASE CONFIG HERE ---
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

let selectedTime = '';
const allSlots = generateSlots();

function generateSlots() {
    const times = [];
    for (let i = 9; i <= 17; i++) { 
        const period = i >= 12 ? 'PM' : 'AM';
        let hour = i > 12 ? i - 12 : i;
        times.push(`${hour}:00 ${period}`);
        if (i < 17) times.push(`${hour}:30 ${period}`);
    }
    return times;
}

const publicSlotsRef = ref(db, 'public_slots');
onValue(publicSlotsRef, (snapshot) => {
    const data = snapshot.val() || {};
    renderGrid(data);
});

function renderGrid(publicSlots) {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    
    allSlots.forEach(time => {
        const slotId = time.replace(/[:\s]/g, ''); 
        const isBooked = !!publicSlots[slotId];
        
        const div = document.createElement('div');
        div.className = `slot ${isBooked ? 'booked' : 'available'}`;
        
        div.innerHTML = `
            <span class="time">${time}</span>
            <span class="status">${isBooked ? 'Booked' : 'Available'}</span>
        `;
        
        div.onclick = () => openModal(time, slotId, isBooked);
        grid.appendChild(div);
    });
}

window.openModal = (time, slotId, isBooked) => {
    selectedTime = time;
    window.selectedSlotId = slotId;
    
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
    document.getElementById('modalTime').innerText = time;

    // Reset inputs
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('cancelPhone').value = '';

    if (isBooked) {
        document.getElementById('modalTitle').innerText = "Manage Booking";
        document.getElementById('bookForm').style.display = 'none';
        document.getElementById('cancelForm').style.display = 'block';
        document.getElementById('modalTime').style.color = 'var(--status-red)';
    } else {
        document.getElementById('modalTitle').innerText = "New Appointment";
        document.getElementById('bookForm').style.display = 'block';
        document.getElementById('cancelForm').style.display = 'none';
        document.getElementById('modalTime').style.color = 'var(--status-green)';
    }
};

window.closeModal = () => { document.getElementById('modal').style.display = 'none'; };

window.handleBook = async () => {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    if(!name || !phone) return alert("Please fill in all fields");

    const snapshot = await get(ref(db, 'public_slots/' + window.selectedSlotId));
    if (snapshot.exists()) return alert("Slot was just taken by someone else!");

    const updates = {};
    updates['bookings/' + window.selectedSlotId] = {
        name,
        phone,
        time: selectedTime,
        status: 'booked'
    };
    updates['public_slots/' + window.selectedSlotId] = {
        booked: true,
        time: selectedTime
    };

    update(ref(db), updates).then(() => {
        closeModal();
    }).catch((e) => alert("Error: " + e.message));
};

window.handleCancel = async () => {
    const phone = document.getElementById('cancelPhone').value;
    if (!phone) return alert("Please enter your phone number");

    const updates = {};
    updates[`bookings/${window.selectedSlotId}/status`] = 'cancelled';
    updates[`bookings/${window.selectedSlotId}/verifyPhone`] = phone;
    updates[`public_slots/${window.selectedSlotId}`] = null;

    update(ref(db), updates).then(() => {
        closeModal();
    }).catch((e) => alert("Incorrect Phone Number or booking not found."));
};
