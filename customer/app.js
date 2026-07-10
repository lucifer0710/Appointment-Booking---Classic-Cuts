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

let publicSlots = {};

async function fetchSlots() {
    try {
        const res = await fetch('/api/slots');
        if (!res.ok) throw new Error('Failed to fetch slots');
        publicSlots = await res.json();
        renderGrid(publicSlots);
    } catch (err) {
        console.error("Error fetching slots:", err);
    }
}

// Initial fetch & Polling (equivalent to Realtime Database listener)
fetchSlots();
setInterval(fetchSlots, 5000);

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

    try {
        const res = await fetch('/api/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                slotId: window.selectedSlotId,
                name,
                phone,
                time: selectedTime
            })
        });

        const data = await res.json();
        if (!res.ok) {
            return alert(data.error || "Booking failed.");
        }

        closeModal();
        fetchSlots(); // Refresh grid immediately
    } catch (e) {
        alert("Error: " + e.message);
    }
};

window.handleCancel = async () => {
    const phone = document.getElementById('cancelPhone').value;
    if (!phone) return alert("Please enter your phone number");

    try {
        const res = await fetch('/api/cancel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                slotId: window.selectedSlotId,
                phone
            })
        });

        const data = await res.json();
        if (!res.ok) {
            return alert(data.error || "Incorrect Phone Number or booking not found.");
        }

        closeModal();
        fetchSlots(); // Refresh grid immediately
    } catch (e) {
        alert("Error: " + e.message);
    }
};