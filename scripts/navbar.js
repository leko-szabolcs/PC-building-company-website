function includeHTML() {
    fetch('navbar.html') 
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load navbar content: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
        })
        .catch(error => {
            console.error(error);
        });
}

document.addEventListener('DOMContentLoaded', includeHTML);