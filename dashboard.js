
const USERS_KEY = "ae_users";
const REQUESTS_KEY = "ae_requests";
const NOTICES_KEY = "ae_notifications";

const current = JSON.parse(localStorage.getItem("user") || "null");

if (!current || current.role !== "Helper") {
    location.href = "../index.html";
}

function read(key) {
    return JSON.parse(localStorage.getItem(key) || "[]");
}

function write(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function notify(email, message) {
    let notices = read(NOTICES_KEY);

    notices.push({
        email: email,
        message: message,
        date: new Date().toISOString()
    });

    write(NOTICES_KEY, notices);
}

function render() {
    document.getElementById("welcome").textContent = "Welcome, " + current.name + "!";

    let all = read(REQUESTS_KEY);

    let available = all.filter(r => r.status === "Pending");
    let mine = all.filter(r => r.helperEmail === current.email);
    let accepted = mine.filter(r => r.status === "Accepted");
    let completed = mine.filter(r => r.status === "Completed");

    document.getElementById("available-count").textContent = available.length;
    document.getElementById("accepted-count").textContent = accepted.length;
    document.getElementById("completed-count").textContent = completed.length;
    document.getElementById("total-count").textContent = mine.length;

    let availableList = document.getElementById("available-list");

    if (available.length === 0) {
        availableList.innerHTML = "<p>No pending requests right now.</p>";
    } else {
        availableList.innerHTML = available.map(r => `
            <article class="request-card">
                <span class="tag">${r.priority}</span>
                <h3>${r.category}</h3>
                <p>${r.description}</p>
                <p><b>Elder:</b> ${r.elderName}</p>
                <p><b>Location:</b> ${r.location}</p>
                <button class="btn" onclick="acceptRequest('${r.id}')">Accept Request</button>
            </article>
        `).join("");
    }

    let acceptedList = document.getElementById("accepted-list");

    if (mine.length === 0) {
        acceptedList.innerHTML = "<p>You have not accepted any requests yet.</p>";
    } else {
        acceptedList.innerHTML = mine.slice().reverse().map(r => `
            <article class="request-card">
                <span class="tag">${r.status}</span>
                <h3>${r.category}</h3>
                <p>${r.description}</p>
                <p><b>Elder:</b> ${r.elderName}</p>
                <p><b>Location:</b> ${r.location}</p>
                ${r.status === "Accepted" ? `
                    <button class="btn" onclick="completeRequest('${r.id}')">Mark as Completed</button>
                ` : `
                    <p>Completed ${r.completedAt ? new Date(r.completedAt).toLocaleString() : ""}</p>
                `}
            </article>
        `).join("");
    }

    let notices = read(NOTICES_KEY).filter(n => n.email === current.email);
    let notificationList = document.getElementById("notification-list");

    if (notices.length === 0) {
        notificationList.innerHTML = "<p>No notifications yet.</p>";
    } else {
        notificationList.innerHTML = notices.slice().reverse().map(n => `
            <div class="notice">
                ${n.message}
                <small>${new Date(n.date).toLocaleString()}</small>
            </div>
        `).join("");
    }
}

function acceptRequest(id) {
    let all = read(REQUESTS_KEY);
    let request = all.find(r => r.id === id);

    if (!request || request.status !== "Pending") {
        alert("This request is no longer available.");
        return;
    }

    request.status = "Accepted";
    request.helperName = current.name;
    request.helperEmail = current.email;

    write(REQUESTS_KEY, all);

    notify(
        request.elderEmail,
        current.name + " accepted your " + request.category + " request."
    );

    render();
}

function completeRequest(id) {
    let all = read(REQUESTS_KEY);
    let request = all.find(r => r.id === id);

    if (!request || request.helperEmail !== current.email || request.status !== "Accepted") {
        return;
    }

    request.status = "Completed";
    request.completedAt = new Date().toISOString();

    write(REQUESTS_KEY, all);

    notify(
        request.elderEmail,
        current.name + " completed your " + request.category + " request."
    );

    render();
}

document.getElementById("profile-form").addEventListener("submit", function (e) {
    e.preventDefault();

    let users = read(USERS_KEY);
    let user = users.find(u => u.email === current.email);

    if (user) {
        user.phone = document.getElementById("profile-phone").value;
        user.address = document.getElementById("profile-address").value;
        user.skills = document.getElementById("profile-skills").value;

        write(USERS_KEY, users);

        alert("Profile saved.");
    }
});

function logout() {
    localStorage.removeItem("user");
    location.href = "../index.html";
}

document.getElementById("profile-name").value = current.name;
document.getElementById("profile-email").value = current.email;

let saved = read(USERS_KEY).find(u => u.email === current.email);

if (saved) {
    document.getElementById("profile-phone").value = saved.phone || "";
    document.getElementById("profile-address").value = saved.address || "";
    document.getElementById("profile-skills").value = saved.skills || "";
}

render();
