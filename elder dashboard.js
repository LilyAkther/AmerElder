
let currentUser = JSON.parse(localStorage.getItem("user"));

if (!currentUser || currentUser.role !== "Elder") {
    window.location.href = "../index.html";
}

let requests = JSON.parse(localStorage.getItem("ae_requests")) || [];
let notifications = JSON.parse(localStorage.getItem("ae_notifications")) || [];

function saveRequests() {
    localStorage.setItem("ae_requests", JSON.stringify(requests));
}

function saveNotifications() {
    localStorage.setItem("ae_notifications", JSON.stringify(notifications));
}

function renderDashboard() {
    document.getElementById("userName").textContent = currentUser.name;
    document.getElementById("welcomeName").textContent = currentUser.name;

    let mine = requests.filter(r => r.elderEmail === currentUser.email);

    document.getElementById("totalRequests").textContent = mine.length;

    document.getElementById("pendingRequests").textContent =
        mine.filter(r => r.status === "Pending" || r.status === "Accepted").length;

    document.getElementById("completedRequests").textContent =
        mine.filter(r => r.status === "Completed").length;

    let requestBox = document.getElementById("myRequests");
    requestBox.innerHTML = "";

    mine.forEach(r => {
        let div = document.createElement("div");
        div.className = "request";

        let title = document.createElement("h3");
        title.textContent = r.category;

        let desc = document.createElement("p");
        desc.textContent = r.description;

        let location = document.createElement("p");
        location.textContent = "Location: " + r.location;

        let status = document.createElement("p");
        status.className = "status";
        status.textContent = "Status: " + r.status;

        div.append(title, desc, location, status);

        if (r.status === "Completed" && !r.rating) {
            let rating = document.createElement("select");
            rating.innerHTML = `
                <option value="">Rate helper</option>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
            `;

            let rateButton = document.createElement("button");
            rateButton.textContent = "Submit Rating";

            rateButton.onclick = function () {
                if (!rating.value) {
                    alert("Please select a rating.");
                    return;
                }

                let allRequests =
                    JSON.parse(localStorage.getItem("ae_requests")) || [];

                let target = allRequests.find(x => x.id === r.id);

                if (target) {
                    target.rating = Number(rating.value);
                    localStorage.setItem("ae_requests", JSON.stringify(allRequests));
                    requests = allRequests;
                    renderDashboard();
                }
            };

            div.append(rating, rateButton);
        }

        requestBox.appendChild(div);
    });

    let noteBox = document.getElementById("notifications");
    noteBox.innerHTML = "";

    notifications
        .filter(n => n.email === currentUser.email)
        .forEach(n => {
            let p = document.createElement("p");
            p.textContent = n.message + " (" + n.date + ")";
            noteBox.appendChild(p);
        });

    let historyBox = document.getElementById("history");
    historyBox.innerHTML = "";

    mine.filter(r => r.status === "Completed").forEach(r => {
        let p = document.createElement("p");
        p.textContent = r.category + " — Completed — Rating: " +
            (r.rating || "Not rated");
        historyBox.appendChild(p);
    });

    if (mine.length === 0) {
        requestBox.textContent = "You have not submitted any requests yet.";
    }
}

document.getElementById("requestForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let request = {
        id: Date.now().toString(),
        elderName: currentUser.name,
        elderEmail: currentUser.email,
        category: document.getElementById("category").value,
        description: document.getElementById("description").value.trim(),
        location: document.getElementById("location").value.trim(),
        priority: document.getElementById("priority").value,
        status: "Pending",
        helperEmail: "",
        helperName: "",
        rating: null,
        date: new Date().toLocaleString()
    };

    requests.push(request);
    saveRequests();

    document.getElementById("requestForm").reset();
    alert("Help request submitted successfully.");

    renderDashboard();
});

document.getElementById("profileForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let users = JSON.parse(localStorage.getItem("ae_users")) || [];
    let savedUser = users.find(u => u.email === currentUser.email);

    if (savedUser) {
        savedUser.phone = document.getElementById("phone").value.trim();
        savedUser.address = document.getElementById("address").value.trim();
        localStorage.setItem("ae_users", JSON.stringify(users));
    }

    alert("Profile saved.");
});

function loadProfile() {
    let users = JSON.parse(localStorage.getItem("ae_users")) || [];
    let savedUser = users.find(u => u.email === currentUser.email);

    if (savedUser) {
        document.getElementById("phone").value = savedUser.phone || "";
        document.getElementById("address").value = savedUser.address || "";
    }
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "../index.html";
}

if (currentUser && currentUser.role === "Elder") {
    loadProfile();
    renderDashboard();
}
