document.querySelectorAll('.dropdown-content_cpu a').forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault(); 
        let selectedText = this.getAttribute('data-value');
        document.getElementById('dropdownButton_cpu').textContent = selectedText;
    });
});

document.querySelectorAll('.dropdown-content_motherboard a').forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault(); 
        let selectedText = this.getAttribute('data-value');
        document.getElementById('dropdownButton_motherboard').textContent = selectedText;
    });
});

document.querySelectorAll('.dropdown-content_memory a').forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault(); 
        let selectedText = this.getAttribute('data-value');
        document.getElementById('dropdownButton_memory').textContent = selectedText;
    });
});

document.querySelectorAll('.dropdown-content_gpu a').forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault(); 
        let selectedText = this.getAttribute('data-value');
        document.getElementById('dropdownButton_gpu').textContent = selectedText;
    });
});

document.querySelectorAll('.dropdown-content_hardDrive a').forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault(); 
        let selectedText = this.getAttribute('data-value');
        document.getElementById('dropdownButton_hardDrive').textContent = selectedText;
    });
});

document.querySelectorAll('.dropdown-content_psu a').forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault(); 
        let selectedText = this.getAttribute('data-value');
        document.getElementById('dropdownButton_psu').textContent = selectedText;
    });
});

document.getElementById('dropdown-content_cpu').addEventListener('click', function() {
    document.getElementById('dropdown-content_cpu').style.display = 'none';
    document.getElementById('dropdownButton_cpu').style.cursor = 'default';
    document.getElementById('dropdown_motherboard').style.display = 'flex';
});

document.getElementById('dropdown-content_motherboard').addEventListener('click', function() {
    document.getElementById('dropdown-content_motherboard').style.display = 'none';
    document.getElementById('dropdownButton_motherboard').style.cursor = 'default';
    document.getElementById('dropdown_memory').style.display = 'flex';
});

document.getElementById('dropdown-content_memory').addEventListener('click', function() {
    document.getElementById('dropdown-content_memory').style.display = 'none';
    document.getElementById('dropdownButton_memory').style.cursor = 'default';
    document.getElementById('dropdown_gpu').style.display = 'flex';
});

document.getElementById('dropdown-content_gpu').addEventListener('click', function() {
    document.getElementById('dropdown-content_gpu').style.display = 'none';
    document.getElementById('dropdownButton_gpu').style.cursor = 'default';
    document.getElementById('dropdown_hardDrive').style.display = 'flex';
});

document.getElementById('dropdown-content_hardDrive').addEventListener('click', function() {
    document.getElementById('dropdown-content_hardDrive').style.display = 'none';
    document.getElementById('dropdownButton_hardDrive').style.cursor = 'default';
    document.getElementById('hidden').style.display = 'flex';
    document.getElementById('dropdown_psu').style.display = 'flex';
});

document.getElementById('dropdown-content_psu').addEventListener('click', function() {
    document.getElementById('dropdown-content_psu').style.display = 'none';
    document.getElementById('dropdownButton_psu').style.cursor = 'default';
    document.getElementById('send').style.display = 'flex';
    document.getElementById('bottom-txt').style.display = 'flex';
});

document.getElementById('send').addEventListener('click', function() {
    window.location.href='/main.html';

});