let isSignup = false;

function getUsers() {
    return JSON.parse(localStorage.getItem("ae_users") || "[]");
}

function openAuth(type) {

    isSignup = type === "signup";

    document.getElementById("auth-modal").classList.remove("hidden");

    document.getElementById("modal-title").textContent =
        isSignup ? "Create Account" : "Login";

    document.getElementById("submit-btn").textContent =
        isSignup ? "Register" : "Login";

    document.getElementById("role-div").classList.toggle("hidden", !isSignup);

    document.getElementById("name").classList.toggle("hidden", !isSignup);

    document.getElementById("name").required = isSignup;

    document.getElementById("auth-message").textContent = "";
}

function closeAuth() {
    document.getElementById("auth-modal").classList.add("hidden");
}

function handleAuth(event) {

    event.preventDefault();

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim().toLowerCase();
    let password = document.getElementById("password").value;
    let role = document.getElementById("role").value;

    let users = getUsers();
    let message = document.getElementById("auth-message");

    if (isSignup) {

        if (users.some(user => user.email === email)) {
            message.textContent = "Email already registered.";
            return;
        }

        let user = {
            name: name,
            email: email,
            password: password,
            role: role,
            phone: "",
            address: "",
            skills: ""
        };

        users.push(user);

        localStorage.setItem("ae_users", JSON.stringify(users));

        loginUser(user);

    } else {

        let user = users.find(user =>
            user.email === email && user.password === password
        );

        if (!user) {
            message.textContent = "Invalid email or password.";
            return;
        }

        loginUser(user);
    }
}

function loginUser(user) {

    localStorage.setItem("user", JSON.stringify({
        name: user.name,
        email: user.email,
        role: user.role
    }));

    if (user.role === "Elder") {
        window.location.href = "elder/dashboard.html";
    } else {
        window.location.href = "helper/dashboard.html";
    }
}

function showHome() {
    window.location.href = "index.html";
}
