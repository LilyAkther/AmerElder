
let currentUser = JSON.parse(localStorage.getItem("user") || "null");

if (!currentUser) {
    window.location.href = "index.html";
}

let requests = JSON.parse(localStorage.getItem("ae_requests") || "[]");
let notifications = JSON.parse(localStorage.getItem("ae_notifications") || "[]");
let reports = JSON.parse(localStorage.getItem("ae_reports") || "[]");

function saveData() {
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

function showHome() {
    window.location.href = "index.html";
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(function (section) {
        section.classList.add("hidden");
    });

    document.getElementById(sectionId).classList.remove("hidden");

    if (sectionId === "overview") renderOverview();
    if (sectionId === "requests") renderRequests();
    if (sectionId === "notifications") renderNotifications();
    if (sectionId === "history") renderHistory();
    if (sectionId === "reports") renderReports();
}

function addNotification(message, email) {
    notifications.unshift({
        id: Date.now() + Math.random(),
        email: email,
        message: message,
        date: new Date().toLocaleString(),
        read: false
    });
}

function getMyRequests() {
    return requests.filter(function (request) {
        return request.email === currentUser.email ||
            request.helperEmail === currentUser.email;
    });
}

function renderOverview() {
    const mine = getMyRequests();

    document.getElementById("totalRequests").textContent = mine.length;

    document.getElementById("pendingRequests").textContent =
        mine.filter(request => request.status === "Pending").length;

    document.getElementById("completedRequests").textContent =
        mine.filter(request => request.status === "Completed").length;

    document.getElementById("recentRequests").innerHTML =
        mine.slice(0, 3).map(request => `
            <div class="item-card">
                <h3>${escapeHTML(request.category)}</h3>
                <p>${escapeHTML(request.description)}</p>
                <p>Status: <span class="status">${escapeHTML(request.status)}</span></p>
            </div>
        `).join("") || "<p>No requests yet.</p>";
}

function renderProfile() {
    document.getElementById("userName").textContent =
        currentUser.name + " (" + currentUser.role + ")";

    document.getElementById("welcome").textContent =
        "Welcome to your Dashboard, " + currentUser.name + "!";

    document.getElementById("profileName").value = currentUser.name || "";
    document.getElementById("profileEmail").value = currentUser.email || "";
    document.getElementById("profilePhone").value = currentUser.phone || "";
    document.getElementById("profileAddress").value = currentUser.address || "";
}

document.getElementById("profileForm").addEventListener("submit", function (event) {
    event.preventDefault();

    currentUser.name = document.getElementById("profileName").value.trim();
    currentUser.phone = document.getElementById("profilePhone").value.trim();
    currentUser.address = document.getElementById("profileAddress").value.trim();

    localStorage.setItem("user", JSON.stringify(currentUser));

    let users = JSON.parse(localStorage.getItem("ae_users") || "[]");

    users = users.map(function (user) {
        if (user.email === currentUser.email) {
            return {
                ...user,
                name: currentUser.name,
                phone: currentUser.phone,
                address: currentUser.address
            };
        }

        return user;
    });

    localStorage.setItem("ae_users", JSON.stringify(users));

    document.getElementById("profileMessage").textContent =
        "Profile updated successfully!";

    renderProfile();
});

document.getElementById("requestForm").addEventListener("submit", function (event) {
    event.preventDefault();

    if (currentUser.role !== "Elder") {
        alert("Only Elder accounts can create help requests.");
        return;
    }

    const request = {
        id: Date.now(),
        name: currentUser.name,
        email: currentUser.email,
        category: document.getElementById("requestCategory").value,
        description: document.getElementById("requestDescription").value.trim(),
        location: document.getElementById("requestLocation").value.trim(),
        priority: document.getElementById("requestPriority").value,
        status: "Pending",
        helperEmail: "",
        helperName: "",
        rating: 0,
        date: new Date().toLocaleString()
    };

    requests.unshift(request);

    addNotification(
        "Your help request has been submitted.",
        currentUser.email
    );

    saveData();
    this.reset();

    alert("Help request submitted successfully!");

    showSection("requests");
});

function renderRequests() {
    const container = document.getElementById("requestList");

    if (currentUser.role === "Helper") {
        container.innerHTML = requests.map(function (request) {
            let actions = "";

            if (request.email === currentUser.email) {
                actions = "<p>You created this request.</p>";
            } else if (request.status === "Pending" && !request.helperEmail) {
                actions = `
                    <button class="action-btn" onclick="acceptRequest(${request.id})">
                        I Can Help
                    </button>
                `;
            } else if (request.helperEmail === currentUser.email &&
                request.status !== "Completed") {
                actions = `
                    <button class="action-btn" onclick="updateStatus(${request.id}, 'In Progress')">
                        Start Helping
                    </button>
                    <button class="action-btn" onclick="updateStatus(${request.id}, 'Completed')">
                        Mark Completed
                    </button>
                `;
            }

            return `
                <div class="item-card">
                    <h3>${escapeHTML(request.category)}</h3>
                    <p><b>Elder:</b> ${escapeHTML(request.name)}</p>
                    <p><b>Description:</b> ${escapeHTML(request.description)}</p>
                    <p><b>Location:</b> ${escapeHTML(request.location)}</p>
                    <p><b>Priority:</b> ${escapeHTML(request.priority)}</p>
                    <p><b>Status:</b> <span class="status">${escapeHTML(request.status)}</span></p>
                    <p><b>Helper:</b> ${escapeHTML(request.helperName || "Not assigned")}</p>
                    ${actions}
                </div>
            `;
        }).join("") || "<p>No help requests available.</p>";

        return;
    }

    const mine = requests.filter(request => request.email === currentUser.email);

    container.innerHTML = mine.map(function (request) {
        let ratingHTML = "";

        if (request.status === "Completed" && request.rating === 0) {
            ratingHTML = `
                <label>Rate your helper</label>
                <select id="rating-${request.id}" class="rating-select">
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                </select>
                <button class="action-btn" onclick="rateRequest(${request.id})">Submit Rating</button>
            `;
        } else if (request.rating > 0) {
            ratingHTML = `<p>Your Rating: ${request.rating}/5</p>`;
        }

        return `
            <div class="item-card">
                <h3>${escapeHTML(request.category)}</h3>
                <p>${escapeHTML(request.description)}</p>
                <p><b>Location:</b> ${escapeHTML(request.location)}</p>
                <p><b>Priority:</b> ${escapeHTML(request.priority)}</p>
                <p><b>Status:</b> <span class="status">${escapeHTML(request.status)}</span></p>
                <p><b>Helper:</b> ${escapeHTML(request.helperName || "Not assigned")}</p>
                <p><b>Date:</b> ${escapeHTML(request.date)}</p>
                ${ratingHTML}
            </div>
        `;
    }).join("") || "<p>You have not created any help requests.</p>";
}

function acceptRequest(id) {
    const request = requests.find(item => item.id === id);

    if (!request || request.status !== "Pending" ||
        request.email === currentUser.email || request.helperEmail) {
        alert("This request is no longer available.");
        renderRequests();
        return;
    }

    request.helperEmail = currentUser.email;
    request.helperName = currentUser.name;
    request.status = "Accepted";

    addNotification(
        currentUser.name + " accepted your " + request.category + " request.",
        request.email
    );

    addNotification(
        "You accepted a help request from " + request.name + ".",
        currentUser.email
    );

    saveData();
    renderRequests();
    renderOverview();
    alert("Request accepted successfully!");
}

function updateStatus(id, status) {
    const request = requests.find(item => item.id === id);

    if (!request || request.helperEmail !== currentUser.email) {
        alert("You cannot update this request.");
        return;
    }

    if (status === "In Progress") {
        if (request.status !== "Accepted") {
            alert("You can start helping after accepting the request.");
            return;
        }
    } else if (status === "Completed") {
        if (request.status !== "In Progress") {
            alert("Start helping before marking it completed.");
            return;
        }
    } else {
        return;
    }

    request.status = status;

    addNotification(
        "Your request status changed to " + status + ".",
        request.email
    );

    addNotification(
        "You updated a request to " + status + ".",
        currentUser.email
    );

    saveData();
    renderRequests();
    renderOverview();
}

function rateRequest(id) {
    const request = requests.find(item => item.id === id);

    if (!request || request.email !== currentUser.email ||
        request.status !== "Completed") {
        alert("You cannot rate this request.");
        return;
    }

    const rating = Number(document.getElementById("rating-" + id).value);

    request.rating = rating;

    addNotification(
        "Your help request received a " + rating + "/5 rating.",
        request.helperEmail
    );

    saveData();
    renderRequests();
    renderHistory();

    alert("Thank you for your rating!");
}

function renderNotifications() {
    const mine = notifications.filter(item => item.email === currentUser.email);

    document.getElementById("notificationList").innerHTML =
        mine.map(item => `
            <div class="item-card">
                <p>${escapeHTML(item.message)}</p>
                <small>${escapeHTML(item.date)}</small>
                ${!item.read ? `
                    <button class="action-btn" onclick="markRead('${item.id}')">
                        Mark as Read
                    </button>
                ` : "<p>Read</p>"}
            </div>
        `).join("") || "<p>No notifications yet.</p>";
}

function markRead(id) {
    const item = notifications.find(notification =>
        String(notification.id) === String(id) &&
        notification.email === currentUser.email
    );

    if (item) {
        item.read = true;
        saveData();
        renderNotifications();
    }
}

function renderHistory() {
    const mine = getMyRequests().filter(request =>
        request.status === "Completed"
    );

    document.getElementById("historyList").innerHTML =
        mine.map(request => `
            <div class="item-card">
                <h3>${escapeHTML(request.category)}</h3>
                <p>${escapeHTML(request.description)}</p>
                <p><b>Status:</b> Completed</p>
                <p><b>Elder:</b> ${escapeHTML(request.name)}</p>
                <p><b>Helper:</b> ${escapeHTML(request.helperName || "Not assigned")}</p>
                <p><b>Rating:</b> ${request.rating ? request.rating + "/5" : "Not rated"}</p>
                <p><b>Date:</b> ${escapeHTML(request.date)}</p>
            </div>
        `).join("") || "<p>No completed requests in your history.</p>";
}

document.getElementById("reportForm").addEventListener("submit", function (event) {
    event.preventDefault();

    reports.unshift({
        id: Date.now(),
        name: currentUser.name,
        email: currentUser.email,
        type: document.getElementById("reportType").value,
        details: document.getElementById("reportDetails").value.trim(),
        date: new Date().toLocaleString(),
        status: "Submitted"
    });

    saveData();
    this.reset();

    alert("Your report has been submitted!");
    renderReports();
});

function renderReports() {
    const mine = reports.filter(report => report.email === currentUser.email);

    document.getElementById("reportList").innerHTML =
        mine.map(report => `
            <div class="item-card">
                <h3>${escapeHTML(report.type)}</h3>
                <p>${escapeHTML(report.details)}</p>
                <p><b>Status:</b> ${escapeHTML(report.status)}</p>
                <small>${escapeHTML(report.date)}</small>
            </div>
        `).join("") || "<p>You have not submitted any reports.</p>";
}

renderProfile();
renderOverview();
renderRequests();