let isSignup = false;
let currentUser = JSON.parse(localStorage.getItem('user')) || null;

window.onload = () => {
    if (currentUser) showDashboard();
};

function openAuth(type) {
    isSignup = (type === 'signup');
    document.getElementById('auth-modal').classList.remove('hidden');
    document.getElementById('modal-title').innerText = isSignup ? 'Sign Up' : 'Login';
    document.getElementById('submit-btn').innerText = isSignup ? 'Register' : 'Login';

    document.getElementById('role-div').classList.toggle('hidden', !isSignup);
    document.getElementById('name').classList.toggle('hidden', !isSignup);
}

function closeAuth() {
    document.getElementById('auth-modal').classList.add('hidden');
}

function handleAuth(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;

    if (isSignup) {
        currentUser = {
            name: document.getElementById('name').value,
            email: email,
            role: document.getElementById('role').value
        };
        localStorage.setItem('user', JSON.stringify(currentUser));
        alert('Sign Up Successful!');
    } else {
        currentUser = { name: "User", email: email, role: "Elder" };
        alert('Login Successful!');
    }

    closeAuth();
    showDashboard();
}

function showDashboard() {
    document.getElementById('nav-auth').innerHTML = `
        <span style="font-weight:bold; color:#047857; margin-right:15px;">${currentUser.name} (${currentUser.role})</span>
        <button onclick="logout()" style="background:#ef4444; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">Logout</button>
    `;

    document.getElementById('main-content').innerHTML = `
        <div class="dashboard">
            <h2>Welcome to your Dashboard, ${currentUser.name}!</h2>
            <p style="font-size: 18px; color: #065f46;">Role-based Authentication successful. Your role is: <strong>${currentUser.role}</strong></p>
        </div>
    `;
}

function showHome() {
    location.reload();
}

function logout() {
    localStorage.removeItem('user');
    location.reload();
}