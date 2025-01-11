document.getElementById('register').addEventListener('click', async function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordRepeat = document.getElementById('passwordRepeat').value;

    if (!email || !password || !passwordRepeat) {
        alert('Kérjük, töltse ki az összes mezőt!');
        return;
    }
    
    if (password !== passwordRepeat) {
        alert('A jelszavak nem egyeznek!');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.success) {
            alert('Sikeres regisztráció!');
            window.location.href = '/pages/login.html';
        } else {
            alert(result.message || 'Hiba történt a regisztráció során.');
        }
    } catch (error) {
        console.error('Hiba:', error);
        alert('Nem sikerült kapcsolatot létesíteni a szerverrel.');
    }
});