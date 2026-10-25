
let currentUser = JSON.parse(localStorage.getItem("user")) || null;

if (!currentUser || currentUser.role !== "Elder") {
    window.location.replace("../index.html");
} else {
    startDashboard();
}

let users = JSON.parse(localStorage.getItem("ae_users")) || [];
let requests = JSON.parse(localStorage.getItem("ae_requests")) || [];
let notifications = JSON.parse(localStorage.getItem("ae_notifications")) || [];
let reports = JSON.parse(localStorage.getItem("ae_reports")) || [];

function startDashboard() {
    loadProfile();
    renderDashboard();
    setupForms();
}

function saveData() {
    localStorage.setItem("ae_users", JSON.stringify(users));
    localStorage.setItem("ae_requests", JSON.stringify(requests));
    localStorage.setItem("ae_notifications", JSON.stringify(notifications));
    localStorage.setItem("ae_reports", JSON.stringify(reports));
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}

function showSection(sectionId, button) {
    document.querySelectorAll(".section").forEach(function (section) {
        section.classList.add("hidden");
    });

    let section = document.getElementById(sectionId);

    if (section) {
        section.classList.remove("hidden");
    }

    document.querySelectorAll(".nav-btn").forEach(function (nav) {
        nav.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    } else {
        document.querySelectorAll(".nav-btn").forEach(function (nav) {
            if (nav.getAttribute("onclick")?.includes("'" + sectionId + "'")) {
                nav.classList.add("active");
            }
        });
    }

    if (sectionId === "notifications") {
        markNotificationsRead();
    }
}

function loadProfile() {
    document.getElementById("userName").textContent =
        currentUser.name || "Elder";

    document.getElementById("welcomeName").textContent =
        currentUser.name || "Elder";

    document.getElementById("profileName").value =
        currentUser.name || "";

    document.getElementById("profileEmail").value =
        currentUser.email || "";

    document.getElementById("phone").value =
        currentUser.phone || "";

    document.getElementById("address").value =
        currentUser.address || "";
}

function getMyRequests() {
    return requests.filter(function (request) {
        return request.elderEmail === currentUser.email;
    });
}

function addNotification(message) {
    notifications.push({
        id: Date.now(),
        email: currentUser.email,
        message: message,
        date: new Date().toLocaleString(),
        read: false
    });

    saveData();
}

function markNotificationsRead() {
    let changed = false;

    notifications.forEach(function (notification) {
        if (notification.email === currentUser.email && !notification.read) {
            notification.read = true;
            changed = true;
        }
    });

    if (changed) {
        saveData();
    }

    renderNotifications();
}

function getStatusClass(status) {
    let value = String(status || "").toLowerCase().replace(/\s+/g, "-");

    if (value === "completed") return "completed";
    if (value === "accepted") return "accepted";
    if (value === "in-progress") return "in-progress";
    if (value === "cancelled") return "cancelled";

    return "";
}

function renderDashboard() {
    loadProfile();

    let myRequests = getMyRequests();

    document.getElementById("total").textContent = myRequests.length;

    document.getElementById("pending").textContent =
        myRequests.filter(function (request) {
            return request.status === "Pending";
        }).length;

    document.getElementById("completed").textContent =
        myRequests.filter(function (request) {
            return request.status === "Completed";
        }).length;

    document.getElementById("recentRequests").innerHTML =
        myRequests.slice().reverse().slice(0, 3).map(function (request) {
            return `
                <div class="item-card">
                    <h3>${escapeHTML(request.category)}</h3>
                    <p>${escapeHTML(request.description)}</p>
                    <p><strong>Location:</strong> ${escapeHTML(request.location)}</p>
                    <span class="status ${getStatusClass(request.status)}">
                        ${escapeHTML(request.status)}
                    </span>
                </div>
            `;
        }).join("") || '<div class="empty-state">You have not submitted any requests yet.</div>';

    renderRequests();
    renderNotifications();
    renderHistory();
    renderReports();
}

function setupForms() {
    document.getElementById("profileForm").addEventListener("submit", function (event) {
        event.preventDefault();

        currentUser.name = document.getElementById("profileName").value.trim();
        currentUser.phone = document.getElementById("phone").value.trim();
        currentUser.address = document.getElementById("address").value.trim();

        localStorage.setItem("user", JSON.stringify(currentUser));

        let index = users.findIndex(function (user) {
            return user.email === currentUser.email;
        });

        if (index >= 0) {
            users[index] = {
                ...users[index],
                name: currentUser.name,
                phone: currentUser.phone,
                address: currentUser.address
            };
        } else {
            users.push({ ...currentUser });
        }

        saveData();
        renderDashboard();

        alert("Your profile has been updated!");
    });

    document.getElementById("requestForm").addEventListener("submit", function (event) {
        event.preventDefault();

        let category = document.getElementById("category").value;
        let description = document.getElementById("description").value.trim();
        let location = document.getElementById("location").value.trim();
        let priority = document.getElementById("priority").value;

        if (!category || !description || !location) {
            alert("Please fill in all required fields.");
            return;
        }

        let request = {
            id: Date.now(),
            elderName: currentUser.name,
            elderEmail: currentUser.email,
            category: category,
            description: description,
            location: location,
            priority: priority,
            helperName: "",
            helperEmail: "",
            status: "Pending",
            rating: 0,
            date: new Date().toLocaleString()
        };

        requests.push(request);

        addNotification("Your " + category + " request has been submitted.");

        saveData();
        document.getElementById("requestForm").reset();

        renderDashboard();
        showSection("requests");

        alert("Help request submitted successfully!");
    });

    document.getElementById("reportForm").addEventListener("submit", function (event) {
        event.preventDefault();

        let type = document.getElementById("reportType").value;
        let description = document.getElementById("reportDescription").value.trim();

        if (!type || !description) {
            alert("Please complete all required fields.");
            return;
        }

        reports.push({
            id: Date.now(),
            email: currentUser.email,
            name: currentUser.name,
            type: type,
            description: description,
            status: "Submitted",
            date: new Date().toLocaleString()
        });

        saveData();

        document.getElementById("reportForm").reset();
        renderReports();

        alert("Your report has been submitted successfully!");
    });
}

function renderRequests() {
    let myRequests = getMyRequests();

    document.getElementById("requestList").innerHTML =
        myRequests.slice().reverse().map(function (request) {
            return `
                <div class="item-card">
                    <h3>${escapeHTML(request.category)}</h3>
                    <p>${escapeHTML(request.description)}</p>
                    <p><strong>Location:</strong> ${escapeHTML(request.location)}</p>
                    <p><strong>Priority:</strong> ${escapeHTML(request.priority)}</p>
                    <p><strong>Helper:</strong> ${escapeHTML(request.helperName || "Not assigned yet")}</p>
                    <p><strong>Date:</strong> ${escapeHTML(request.date)}</p>
                    <span class="status ${getStatusClass(request.status)}">
                        ${escapeHTML(request.status)}
                    </span>
                    ${request.status === "Pending" ? `
                        <button class="danger-btn" onclick="cancelRequest(${Number(request.id)})">
                            Cancel Request
                        </button>
                    ` : ""}
                </div>
            `;
        }).join("") || '<div class="empty-state">No help requests found.</div>';
}

function cancelRequest(requestId) {
    let request = requests.find(function (item) {
        return Number(item.id) === requestId &&
            item.elderEmail === currentUser.email;
    });

    if (!request || request.status !== "Pending") {
        alert("Only pending requests can be cancelled.");
        return;
    }

    if (!confirm("Are you sure you want to cancel this request?")) {
        return;
    }

    request.status = "Cancelled";

    addNotification("Your " + request.category + " request has been cancelled.");

    saveData();
    renderDashboard();

    alert("Request cancelled.");
}

function renderNotifications() {
    let myNotifications = notifications.filter(function (notification) {
        return notification.email === currentUser.email;
    });

    document.getElementById("notificationList").innerHTML =
        myNotifications.slice().reverse().map(function (notification) {
            return `
                <div class="item-card">
                    <h3>${notification.read ? "Notification" : "New Notification"}</h3>
                    <p>${escapeHTML(notification.message)}</p>
                    <small>${escapeHTML(notification.date)}</small>
                </div>
            `;
        }).join("") || '<div class="empty-state">No notifications yet.</div>';
}

function renderHistory() {
    let completedRequests = getMyRequests().filter(function (request) {
        return request.status === "Completed";
    });

    document.getElementById("historyList").innerHTML =
        completedRequests.slice().reverse().map(function (request) {
            let ratingHTML = request.rating
                ? `<p><strong>Your rating:</strong> ${escapeHTML(request.rating)} / 5 ⭐</p>`
                : `
                    <label for="rating-${Number(request.id)}">Rate your helper</label>
                    <select id="rating-${Number(request.id)}">
                        <option value="">Choose a rating</option>
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                    </select>
                    <button onclick="rateHelper(${Number(request.id)})">Submit Rating</button>
                `;

            return `
                <div class="item-card">
                    <h3>${escapeHTML(request.category)}</h3>
                    <p>${escapeHTML(request.description)}</p>
                    <p><strong>Helper:</strong> ${escapeHTML(request.helperName || "Community Helper")}</p>
                    <p><strong>Completed:</strong> ${escapeHTML(request.date)}</p>
                    ${ratingHTML}
                </div>
            `;
        }).join("") || '<div class="empty-state">Completed requests will appear here.</div>';
}

function rateHelper(requestId) {
    let ratingElement = document.getElementById("rating-" + requestId);

    if (!ratingElement || !ratingElement.value) {
        alert("Please select a rating first.");
        return;
    }

    let request = requests.find(function (item) {
        return Number(item.id) === requestId &&
            item.elderEmail === currentUser.email;
    });

    if (!request || request.status !== "Completed" || request.rating) {
        alert("This request cannot be rated.");
        return;
    }

    request.rating = Number(ratingElement.value);

    saveData();
    renderDashboard();

    alert("Thank you for rating your helper!");
}

function renderReports() {
    let myReports = reports.filter(function (report) {
        return report.email === currentUser.email;
    });

    document.getElementById("reportList").innerHTML =
        myReports.slice().reverse().map(function (report) {
            return `
                <div class="item-card">
                    <h3>${escapeHTML(report.type)}</h3>
                    <p>${escapeHTML(report.description)}</p>
                    <p><strong>Status:</strong> ${escapeHTML(report.status)}</p>
                    <small>${escapeHTML(report.date)}</small>
                </div>
            `;
        }).join("") || '<div class="empty-state">You have not submitted any reports.</div>';
}

function logout() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem("user");
        window.location.href = "../index.html";
    }
}
