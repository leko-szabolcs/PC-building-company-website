document.getElementById('nav_to_new_pass').addEventListener('click', function() {
    window.location.href='/pages/new_password.html';
});
document.getElementById('logout').addEventListener('click', function() {
    window.location.href='/pages/login.html';
});

document.getElementById('delete_acc').addEventListener('click', function() {
    document.getElementById('delete_acc').style.display = 'none';
    document.getElementById('delete_acc2').style.display = 'flex';
});

document.getElementById('delete_acc2').addEventListener('click', function() {
    window.location.href='/pages/login.html';
});

document.getElementById('signup').addEventListener('click', function() {
    document.getElementById('signup').style.display = 'none';
    document.getElementById('unsub').style.display = 'flex';
});

document.getElementById('unsub').addEventListener('click', function() {
    document.getElementById('unsub').style.display = 'none';
    document.getElementById('signup').style.display = 'flex';
});