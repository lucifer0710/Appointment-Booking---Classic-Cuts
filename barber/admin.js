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

let adminToken = localStorage.getItem('adminToken');
let dashboardInterval = null;

async function loadDashboard() {
    if (!adminToken) return;

    try {
        const res = await fetch('/api/admin/bookings', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        if (res.status === 401 || res.status === 403) {
            handleLogout();
            return;
        }

        if (!res.ok) {
            let errorMsg = `Failed to load bookings (Status ${res.status})`;
            try {
                const errData = await res.json();
                if (errData && errData.error) {
                    errorMsg += `: ${errData.error}`;
                }
            } catch (_) {}
            throw new Error(errorMsg);
        }

        const data = await res.json();
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
    } catch (error) {
        console.error("Database read error: ", error);
        document.getElementById('tableBody').innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color: var(--status-red);">Error: ${error.message}</td></tr>`;
    }
}

function checkAuthState() {
    const loginOverlay = document.getElementById('loginOverlay');
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) errorDiv.innerText = '';

    if (adminToken) {
        loginOverlay.style.display = 'none';
        loadDashboard();
        if (!dashboardInterval) {
            dashboardInterval = setInterval(loadDashboard, 5000);
        }
    } else {
        if (dashboardInterval) {
            clearInterval(dashboardInterval);
            dashboardInterval = null;
        }
        loginOverlay.style.display = 'flex';
        document.getElementById('tableBody').innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 30px; color: #a0c4ff;">Please login to view dashboard.</td></tr>';
    }
}

// Initial state check
checkAuthState();

// Event Handlers
window.handleLogin = async () => {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('loginError');
    errorDiv.innerText = '';

    if (!email || !password) {
        errorDiv.innerText = "Please fill in all fields.";
        return;
    }

    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        let data = {};
        try {
            data = await res.json();
        } catch (_) {}
        
        if (!res.ok) {
            errorDiv.innerText = "Login failed: " + (data.error || `HTTP error ${res.status}`);
            return;
        }

        adminToken = data.token;
        localStorage.setItem('adminToken', adminToken);
        checkAuthState();
    } catch (err) {
        errorDiv.innerText = "Login failed: " + err.message;
    }
};

window.handleLogout = () => {
    adminToken = null;
    localStorage.removeItem('adminToken');
    checkAuthState();
};

window.cancelBooking = async (slotId) => {
    if(confirm("Are you sure you want to cancel this booking?")) {
        try {
            const res = await fetch('/api/admin/cancel-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ slotId })
            });
            
            let data = {};
            try {
                data = await res.json();
            } catch (_) {}

            if (!res.ok) {
                return alert(data.error || `Failed to cancel booking (Status ${res.status}).`);
            }
            alert("Booking cancelled successfully.");
            loadDashboard(); // Refresh table immediately
        } catch (e) {
            alert("Error: " + e.message);
        }
    }
};