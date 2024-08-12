function includeHTML() {
    //load navbar
    fetch('navbar.html') 
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load navbar content: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            setActivePage();
        })
        .catch(error => {
            console.error(error);
        });

        //load footer
        fetch('footer_navbar.html') 
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load bottom_navbar content: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
            setActivePage();
        })
        .catch(error => {
            console.error(error);
            
        });
}

function setActivePage() {
    const currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.nav-link');

    const buttons = document.querySelectorAll('.button');

    navLinks.forEach(function(link) {
        var linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    buttons.forEach(button => {
        const buttonHref = button.getAttribute('data-href');
        if (buttonHref === currentPath) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    
}

document.addEventListener('DOMContentLoaded', includeHTML);