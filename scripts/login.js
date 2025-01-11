document.getElementById('login').addEventListener('click', async function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('custom-checkbox').checked;

    if (!email || !password) {
        alert('Kérjük, töltse ki az összes mezőt!');
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, rememberMe })
        });

        const result = await response.json();

        if (result.success) {
            alert('Sikeres bejelentkezés!');
            if (rememberMe) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('rememberMe', 'true');
            } else {
                sessionStorage.setItem('isLoggedIn', 'true');
            }
            window.location.href='/main.html';
            sessionStorage.setItem('isLoggedIn', 'true'); 
        } else {
            alert(result.message || 'Hiba történt a bejelentkezés során.');
        }
    } catch (error) {
        console.error('Hiba:', error);
        alert('Nem sikerült kapcsolatot létesíteni a szerverrel.');
    }
});