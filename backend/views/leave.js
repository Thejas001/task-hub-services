const API_URL = 'http://localhost:5000/api/leave'; 

// Function to Save Token from Input Field
function saveToken() {
    const token = document.getElementById('tokenInput').value;
    if (!token) {
        alert("Please enter a valid token!");
        return;
    }
    localStorage.setItem('token', token);
    alert("Token saved successfully!");
}

// Get Token from Storage
function getToken() {
    return localStorage.getItem('token') || "";
}

// 📌 Apply for Leave
document.getElementById('leaveForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
        alert("Token is missing! Please enter a valid token.");
        return;
    }

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const reason = document.getElementById('reason').value;

    const response = await fetch(`${API_URL}/apply`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Attach Token
        },
        body: JSON.stringify({ startDate, endDate, reason })
    });

    const data = await response.json();
    alert(data.message);
});

// 📌 Fetch Employee Leave History
async function getUserLeaves() {
    const token = getToken();
    if (!token) {
        alert("Token is missing! Please enter a valid token.");
        return;
    }

    const response = await fetch(`${API_URL}/history`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` } // Attach Token
    });

    const leaves = await response.json();
    const leaveList = document.getElementById('leaveHistory');
    leaveList.innerHTML = '';

    if (leaves.length === 0) {
        leaveList.innerHTML = '<li>No leave records found</li>';
        return;
    }

    leaves.forEach(leave => {
        const listItem = document.createElement('li');
        listItem.textContent = `From ${leave.startDate} to ${leave.endDate} - ${leave.status}`;
        leaveList.appendChild(listItem);
    });
}

// 📌 Fetch All Leave Requests (Admin)
async function getAllLeaves() {
    const token = getToken();
    if (!token) {
        alert("Token is missing! Please enter a valid token.");
        return;
    }

    const response = await fetch(`${API_URL}/all`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` } // Attach Token
    });

    const requests = await response.json();
    const requestList = document.getElementById('leaveRequests');
    requestList.innerHTML = '';

    if (requests.length === 0) {
        requestList.innerHTML = '<li>No leave requests found</li>';
        return;
    }

    requests.forEach(request => {
        const listItem = document.createElement('li');
        listItem.textContent = `Employee ${request.employeeId}: ${request.startDate} to ${request.endDate} - ${request.status}`;
        requestList.appendChild(listItem);
    });
}
