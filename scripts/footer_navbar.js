function includeHTML() {
    fetch('footer_navbar.html') 
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load bottom_navbar content: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        })
        .catch(error => {
            console.error(error);
            
        });
}

document.addEventListener('DOMContentLoaded', includeHTML);