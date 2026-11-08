
let currentUser = JSON.parse(localStorage.getItem("user") || "null");

if (!currentUser || currentUser.role !== "Elder") {
    window.location.href = "../index.html";
}

function getRequests() {
    return JSON.parse(localStorage.getItem("ae_requests") || "[]");
}

function getNotifications() {
    return JSON.parse(localStorage.getItem("ae_notifications") || "[]");
}

function showSection(id, link) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");

    document.querySelectorAll(".sidebar a").forEach(a => {
        a.classList.remove("active");
    });

    link.classList.add("active");
}

function loadDashboard() {
    let requests = getRequests();

    let myRequests = requests.filter(r => r.email === currentUser.email);

    document.getElementById("user-name").textContent = currentUser.name;
    document.getElementById("welcome-name").textContent = currentUser.name;

    document.getElementById("total-count").textContent = myRequests.length;

    document.getElementById("active-count").textContent =
        myRequests.filter(r => r.status !== "Completed").length;

    document.getElementById("completed-count").textContent =
        myRequests.filter(r => r.status === "Completed").length;

    displayRequests(myRequests, "my-request-list");
    displayRequests(myRequests.slice(-3).reverse(), "recent-requests");

    let notifications = getNotifications().filter(n =>
        n.email === currentUser.email
    );

    let notificationBox = document.getElementById("notification-list");

    notificationBox.innerHTML = "";

    if (notifications.length === 0) {
        notificationBox.innerHTML = '<p class="empty">No notifications yet.</p>';
    } else {
        notifications.slice().reverse().forEach(n => {
            notificationBox.innerHTML +=
                '<div class="request-card"><p>' + n.message + '</p></div>';
        });
    }

    loadProfile();
}

function displayRequests(requests, elementId) {
    let box = document.getElementById(elementId);

    box.innerHTML = "";

    if (requests.length === 0) {
        box.innerHTML = '<p class="empty">No requests found.</p>';
        return;
    }

    requests.forEach(r => {
        box.innerHTML += `
            <div class="request-card">
                <h4>${r.category}</h4>
                <p>${r.description}</p>
                <p><strong>Location:</strong> ${r.location}</p>
                <p><strong>Priority:</strong> ${r.priority}</p>
                <span class="status">${r.status}</span>
                ${r.helper ? '<p><strong>Helper:</strong> ' + r.helper + '</p>' : ''}
            </div>
        `;
    });
}

document.getElementById("request-form").addEventListener("submit", function (event) {
    event.preventDefault();

    let requests = getRequests();

    let newRequest = {
        id: Date.now(),
        email: currentUser.email,
        name: currentUser.name,
        category: document.getElementById("category").value,
        description: document.getElementById("description").value,
        location: document.getElementById("location").value,
        priority: document.getElementById("priority").value,
        status: "Pending",
        helper: ""
    };

    requests.push(newRequest);

    localStorage.setItem("ae_requests", JSON.stringify(requests));

    alert("Help request submitted successfully!");

    this.reset();
    loadDashboard();
    showSection("my-requests", document.querySelectorAll(".sidebar a")[2]);
});

function loadProfile() {
    let users = JSON.parse(localStorage.getItem("ae_users") || "[]");

    let user = users.find(u => u.email === currentUser.email);

    if (user) {
        document.getElementById("profile-name").value = user.name;
        document.getElementById("profile-email").value = user.email;
        document.getElementById("profile-phone").value = user.phone || "";
        document.getElementById("profile-address").value = user.address || "";
    }
}

document.getElementById("profile-form").addEventListener("submit", function (event) {
    event.preventDefault();

    let users = JSON.parse(localStorage.getItem("ae_users") || "[]");

    let index = users.findIndex(u => u.email === currentUser.email);

    if (index !== -1) {
        users[index].name = document.getElementById("profile-name").value;
        users[index].phone = document.getElementById("profile-phone").value;
        users[index].address = document.getElementById("profile-address").value;

        localStorage.setItem("ae_users", JSON.stringify(users));

        currentUser.name = users[index].name;
        localStorage.setItem("user", JSON.stringify(currentUser));

        alert("Profile updated successfully!");
        loadDashboard();
    }
});

function logout() {
    localStorage.removeItem("user");
    window.location.href = "../index.html";
}

loadDashboard();
