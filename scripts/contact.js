document.getElementById('email-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    if (message.length > 100) {
        e.preventDefault(); 
        document.getElementById('error').style.display = 'block';
        return;
    } else {
        document.getElementById('error').style.display = 'none';
    }

    const data = {
        name: name,
        email: email,
        message: message
    };

    fetch('/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Email sikeresen elküldve.');
            window.location.href = '/main.html'; 
        } else {
            alert('Nem sikerült elküldeni.');
        }
    })
    .catch((error) => {
        console.error('Hiba:', error);
        alert('Hiba történt küldés közben.');
    });

});
