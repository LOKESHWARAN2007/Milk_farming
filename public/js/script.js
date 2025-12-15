document.addEventListener('DOMContentLoaded', async () => {
    // Check login status
    const response = await fetch('/api/auth/check-session');
    const data = await response.json();

    const navLinks = document.getElementById('nav-links');
    const userMenu = document.getElementById('user-menu');

    if (navLinks && userMenu) {
        if (data.loggedIn) {
            navLinks.style.display = 'none';
            userMenu.style.display = 'block';
            document.getElementById('user-name').textContent = `Welcome, ${data.user.name}`;
        } else {
            navLinks.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }
});

if (document.getElementById('logout-btn') && !document.getElementById('logout-btn').onclick) {
    document.getElementById('logout-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        await fetch('/api/auth/logout');
        window.location.href = 'index.html';
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
