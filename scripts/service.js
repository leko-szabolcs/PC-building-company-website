document.getElementById('service').addEventListener('click', function() {
    document.getElementById('option2-txt').style.display = 'flex';
    document.getElementById('option1-txt').style.display = 'none';
    document.getElementById('buttons').style.display = 'none';
    document.getElementById('message-button').style.display = 'flex';
    document.getElementById('shown-image').style.display = 'none';
    document.getElementById('hidden-image').style.display = 'flex';
    document.getElementById('selected-service').value = 'Szerviz';
});

document.getElementById('change').addEventListener('click', function() {
    document.getElementById('option2-txt').style.display = 'flex';
    document.getElementById('option1-txt').style.display = 'none';
    document.getElementById('buttons').style.display = 'none';
    document.getElementById('message-button').style.display = 'flex';
    document.getElementById('shown-image').style.display = 'none';
    document.getElementById('hidden-image').style.display = 'flex';
    document.getElementById('selected-service').value = 'Alkatrészcsere';
});

document.getElementById('send').addEventListener('click', function() {
    document.getElementById('option3-txt').style.display = 'flex';
    document.getElementById('option2-txt').style.display = 'none';
    document.getElementById('message-button').style.display = 'none';
    document.getElementById('email-name').style.display = 'flex';
    document.getElementById('hidden-image').style.display = 'none';
    document.getElementById('hidden-image2').style.display = 'flex';
 });

 document.getElementById('final_send').addEventListener('click', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const selectedService = document.getElementById('selected-service').value;

    if (!name || !email || !message) {
        alert('Kérjük, töltse ki az összes mezőt!'); 
        return; 
    }

    const data = {
        name: name,
        email: email,
        message: message,
        service: selectedService
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