
let user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "Helper") location.href = "../index.html";

function get(key) {
    return JSON.parse(localStorage.getItem(key) || "[]");
}

function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function showSection(id, link) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    document.querySelectorAll(".sidebar a").forEach(a => a.classList.remove("active"));
    link.classList.add("active");
}

function notify(email, message) {
    let notes = get("ae_notifications");
    notes.push({ email, message, date: new Date().toLocaleString() });
    save("ae_notifications", notes);
}

function loadDashboard() {
    let requests = get("ae_requests");
    let mine = requests.filter(r => r.helperEmail === user.email);
    let available = requests.filter(r => r.status === "Pending");

    document.getElementById("user-name").textContent = user.name;
    document.getElementById("welcome-name").textContent = user.name;
    document.getElementById("available-count").textContent = available.length;
    document.getElementById("accepted-count").textContent = mine.filter(r => r.status === "Accepted").length;
    document.getElementById("completed-count").textContent = mine.filter(r => r.status === "Completed").length;

    showRequests(available, "available-list");
    showRequests(mine, "my-task-list");
    showRequests(mine.slice(-3), "recent-tasks");

    let notes = get("ae_notifications").filter(n => n.email === user.email);
    document.getElementById("notification-list").innerHTML =
        notes.length ? notes.reverse().map(n => `<div class="request-card">${n.message}<p>${n.date}</p></div>`).join("") : "No notifications.";

    let u = get("ae_users").find(x => x.email === user.email);
    if (u) {
        ["name", "email", "phone", "address", "skills"].forEach(x => {
            document.getElementById("profile-" + x).value = u[x] || "";
        });
    }
}

function showRequests(list, box) {
    document.getElementById(box).innerHTML = list.length ? list.slice().reverse().map(r => `
        <div class="request-card">
            <h3>${r.category}</h3>
            <p>${r.description}</p>
            <p>Elder: ${r.name} | ${r.location}</p>
            <p>Status: ${r.status}</p>
            ${box === "available-list"
            ? `<button class="btn" onclick="updateTask(${r.id},'Accepted')">Accept</button>`
            : r.status === "Accepted"
                ? `<button class="btn" onclick="updateTask(${r.id},'Completed')">Complete</button>` : ""}
        </div>`).join("") : "<p class='empty'>No requests found.</p>";
}

function updateTask(id, status) {
    let requests = get("ae_requests");
    let r = requests.find(x => x.id === id);

    if (!r || (status === "Accepted" && r.status !== "Pending") ||
        (status === "Completed" && (r.status !== "Accepted" || r.helperEmail !== user.email))) return;

    r.status = status;
    if (status === "Accepted") {
        r.helper = user.name;
        r.helperEmail = user.email;
    }

    save("ae_requests", requests);
    notify(r.email, user.name + " " + status.toLowerCase() + " your request.");
    alert("Task " + status + "!");
    loadDashboard();
}

document.getElementById("profile-form").onsubmit = function (e) {
    e.preventDefault();

    let users = get("ae_users");
    let u = users.find(x => x.email === user.email);
    if (!u) return;

    ["name", "phone", "address", "skills"].forEach(x => {
        u[x] = document.getElementById("profile-" + x).value.trim();
    });

    user.name = u.name;
    save("ae_users", users);
    localStorage.setItem("user", JSON.stringify(user));

    alert("Profile updated!");
    loadDashboard();
};

function logout() {
    localStorage.removeItem("user");
    location.href = "../index.html";
}

loadDashboard();
