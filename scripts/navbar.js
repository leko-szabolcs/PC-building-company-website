function includeHTML() {
    console.log('includeHTML function called'); 

    fetch('navbar.html') 
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load navbar content: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            console.log('Navbar content received'); 
        })
        .catch(error => {
            console.error(error);
        });
}

document.addEventListener('DOMContentLoaded', includeHTML);