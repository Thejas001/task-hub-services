document.addEventListener("DOMContentLoaded", function () {
    const API_BASE = "http://localhost:5000/api"; // Backend API
    let token = "";
    let userId = "";

    function displayResponse(data) {
        document.getElementById("responseContainer").innerHTML = 
            `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }

    async function loginUser() {
        try {
            const response = await fetch(`${API_BASE}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: document.getElementById("loginEmail").value,
                    password: document.getElementById("loginPassword").value
                })
            });

            const data = await response.json();

            if (data.token) {
                token = data.token;
                userId = data.user.id; // Fix: Ensure user object exists
                sessionStorage.setItem("token", token);
                sessionStorage.setItem("userId", userId);

                displayResponse({ message: "Login successful!", token, userId });

                // ✅ Fix: Ensure these elements exist before using classList
                const authSection = document.getElementById("auth-section");
                const empSection = document.getElementById("employee-section");
                const attSection = document.getElementById("attendance-section");

                if (authSection) authSection.classList.add("hidden");
                if (empSection) empSection.classList.remove("hidden");
                if (attSection) attSection.classList.remove("hidden");

                // Fetch employee details
                getEmployeeDetails(userId);
            } else {
                displayResponse(data);
            }
        } catch (error) {
            displayResponse({ error: error.message });
        }
    }

    async function getEmployeeDetails(userId) {
        try {
            const response = await fetch(`${API_BASE}/employees/${userId}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await response.json();

            if (data) {
                document.getElementById("userId").value = data.id || "";
                document.getElementById("position").value = data.position || "";
                document.getElementById("department").value = data.department || "";
                document.getElementById("salary").value = data.salary || "";
                document.getElementById("joiningDate").value = data.joiningDate || "";

                const editSection = document.getElementById("editEmployeeSection");
                if (editSection) editSection.classList.remove("hidden");
            } else {
                displayResponse({ message: "No employee details found" });
            }
        } catch (error) {
            displayResponse({ error: error.message });
        }
    }

    async function updateEmployeeDetails() {
        try {
            const response = await fetch(`${API_BASE}/employees/update/${userId}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    position: document.getElementById("position").value,
                    department: document.getElementById("department").value,
                    salary: document.getElementById("salary").value,
                    joiningDate: document.getElementById("joiningDate").value
                })
            });

            const data = await response.json();
            displayResponse(data);
        } catch (error) {
            displayResponse({ error: error.message });
        }
    }

    // Attach event listeners
    document.getElementById("loginButton").addEventListener("click", loginUser);
    document.getElementById("updateButton").addEventListener("click", updateEmployeeDetails);
});
