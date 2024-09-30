document.getElementById('service').addEventListener('click', function() {
    document.getElementById('option2-txt').style.display = 'flex';
    document.getElementById('option1-txt').style.display = 'none';
    document.getElementById('buttons').style.display = 'none';
    document.getElementById('message-button').style.display = 'flex';
    document.getElementById('shown-image').style.display = 'none';
    document.getElementById('hidden-image').style.display = 'flex';
});

document.getElementById('change').addEventListener('click', function() {
    document.getElementById('option2-txt').style.display = 'flex';
    document.getElementById('option1-txt').style.display = 'none';
    document.getElementById('buttons').style.display = 'none';
    document.getElementById('message-button').style.display = 'flex';
    document.getElementById('shown-image').style.display = 'none';
    document.getElementById('hidden-image').style.display = 'flex';
});

document.getElementById('send').addEventListener('click', function() {
    document.getElementById('option3-txt').style.display = 'flex';
    document.getElementById('option2-txt').style.display = 'none';
    document.getElementById('message-button').style.display = 'none';
    document.getElementById('email-name').style.display = 'flex';
    document.getElementById('hidden-image').style.display = 'none';
    document.getElementById('hidden-image2').style.display = 'flex';
 });

 document.getElementById('final_send').addEventListener('click', function() {
    window.location.href='/main.html';
 });
