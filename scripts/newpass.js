document.getElementById('send').addEventListener('click', async () => {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert("A jelszavak nem egyeznek.");
        return;
    }

    try {
        const response = await fetch('/api/update-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            window.location.href = '/main.html';
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Valami hiba történt.');
    }
});