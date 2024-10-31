document.getElementById('send').addEventListener('click', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;

    if (!email) {
        alert('Kérjük, töltse ki az összes mezőt!'); 
        return; 
    }

    const data = {
        email: email
    };

    fetch('/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Email sikeresen elküldve.');
            window.location.href = '/main.html';
        } else {
            alert('Nem sikerült elküldeni.');
        }
    })
    .catch(error => console.error('Error:', error));
});