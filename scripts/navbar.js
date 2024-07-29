function includeHTML() {
    console.log('includeHTML function called'); 
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status === 200) {
                console.log('Navbar content received'); 
                document.getElementById('navbar-container').innerHTML = this.responseText;
            } else {
                console.error('Failed to load navbar content', this.status, this.statusText); 
            }
        }
    };
    xhr.open('GET', '/html/navbar.html', true); 
    xhr.send();
}

document.addEventListener('DOMContentLoaded', includeHTML);