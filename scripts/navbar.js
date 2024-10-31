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
            setActivePage();
            initializeCartModal();  // Initialize the cart modal logic after navbar is loaded
        })
        .catch(error => {
            console.error(error);
        });

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


function initializeCartModal() {
    const cartIcon = document.getElementById('cartIcon');
    const overlay = document.getElementById('overlay');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    const pay = document.getElementById('pay');

    
    if (!cartIcon || !overlay || !cartModal || !closeCart) {
        console.error('One or more elements are not found: cartIcon, overlay, cartModal, or closeCart');
        return;
    }


    cartIcon.addEventListener('click', function() {
        overlay.style.display = 'block';  
        cartModal.style.display = 'block'; 
    });

  
    closeCart.addEventListener('click', function() {
        overlay.style.display = 'none';  
        cartModal.style.display = 'none'; 
    });

    
    overlay.addEventListener('click', function() {
        overlay.style.display = 'none';
        cartModal.style.display = 'none';
    });

    pay.addEventListener('click', function() {
        window.location.href='pages/order.html';
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
