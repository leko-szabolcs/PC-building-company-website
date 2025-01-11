function includeHTML() {
    fetch('/navbar.html')
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load navbar content: ${response.status}`);
            return response.text();
        })
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            setActivePage();
            initializeCartModal();
            updateLoginLink();
        })
        .catch(error => console.error('Error loading navbar:', error));

    fetch('/footer_navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
}


function updateLoginLink() {
    const userLink = document.getElementById('userLink');
    if (!userLink) {
        console.error('userLink element not found on the page.');
        return;
    }

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';

    fetch('/api/check-login', {
        method: 'GET',
        credentials: 'include' 
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to verify login status');
        return response.json();
    })
    .then(data => {
        console.log('Login status:', data.isLoggedIn);
        if (data.isLoggedIn) {
            userLink.href = '/pages/user.html'; 
        } else {
            userLink.href = '/pages/login.html';
            localStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('isLoggedIn');
        }
    })
    .catch(error => console.error('Error checking login status:', error));
}


async function fetchCartItems(userID) {
    try {
        const response = await fetch(`/api/shopping-cart?userID=${userID}`);
        if (!response.ok) throw new Error('Failed to fetch cart items.');

        const cartItems = await response.json();
        const cartModalContent = document.getElementById('pc_name_remove');
        cartModalContent.innerHTML = '';

        if (cartItems.length === 0) {
            cartModalContent.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }

        cartItems.forEach((item) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            

            cartItem.innerHTML = `
                <img src="${item.picture || '/pictures/pc_example.jpg'}" alt="${item.product_name}" class="cart-image">
                    <p class="cart-item-name">${item.product_name}</p>
                <button class="delete-item" data-id="${item.productID}">
                <img src="/pictures/delete.png" alt="Delete">
                </button>
`;

            cartModalContent.appendChild(cartItem);
        });

        document.querySelectorAll('.delete-item').forEach((button) => {
            button.addEventListener('click', async function () {
                const productID = this.getAttribute('data-id');
                await removeCartItem(userID, productID);
                fetchCartItems(userID);
            });
        });
    } catch (error) {
        console.error(error);
        alert('Failed to load cart items. Please try again later.');
    }
}

async function removeCartItem(userID, productID) {
    try {
        const response = await fetch(`/api/shopping-cart`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userID: parseInt(userID, 10),
                productID: parseInt(productID, 10),
            }),
        });

        if (!response.ok) throw new Error('Failed to remove item from cart.');
    } catch (error) {
        console.error(error);
        alert('An error occurred while removing the item.');
    }
}

async function initializeCartModal() {
    const cartIcon = document.getElementById('cartIcon');
    const overlay = document.getElementById('overlay');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    const pay = document.getElementById('pay');

    if (!cartIcon || !overlay || !cartModal || !closeCart || !pay) {
        return;
    }

    const { isLoggedIn, userID } = await checkLoginStatusAndGetUserID();

    if (!isLoggedIn || !userID) {
        console.error('A felhasználó nincs bejelentkezve, vagy hiányzik a felhasználói azonosító');
        return;
    }

    console.log('Felhasználói azonosító lekérve:', userID);

    async function toggleCartAndPayButtons() {
        const response = await fetch(`/api/shopping-cart?userID=${userID}`);
        if (!response.ok) throw new Error('Nem sikerült lekérni a kosár tételeit.');

        const cartItems = await response.json();
        
        if (cartItems.length === 0) {
            cartIcon.style.cursor = 'not-allowed';
            cartIcon.classList.add('disabled');
            cartIcon.removeEventListener('click', openCartModal);
            pay.disabled = true;
            pay.style.cursor = 'not-allowed';
            pay.classList.add('disabled');
        } else {
            cartIcon.style.cursor = 'pointer';
            cartIcon.classList.remove('disabled');
            cartIcon.addEventListener('click', openCartModal);

            pay.disabled = false;
            pay.style.cursor = 'pointer';
            pay.classList.remove('disabled');
        }
    }

    async function openCartModal() {
        overlay.style.display = 'block';
        cartModal.style.display = 'block';
        await fetchCartItems(userID);
    }

    await toggleCartAndPayButtons();

    closeCart.addEventListener('click', () => {
        overlay.style.display = 'none';
        cartModal.style.display = 'none';
    });

    overlay.addEventListener('click', () => {
        overlay.style.display = 'none';
        cartModal.style.display = 'none';
    });

    pay.addEventListener('click', () => {
        if (!pay.disabled) {
            window.location.href = '/pages/order.html';
        }
    });

    setInterval(toggleCartAndPayButtons, 30);
}



function setActivePage() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentPath);
    });
}

async function checkLoginStatusAndGetUserID() {
    try {
        const response = await fetch('/api/check-login', { 
            method: 'GET', 
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            if (data.isLoggedIn) {
                return { isLoggedIn: true, userID: data.userID || null };
            }
        }
        return { isLoggedIn: false, userID: null };
    } catch (error) {
        console.error('Hiba a bejelentkezési állapot ellenőrzése során:', error);
        return { isLoggedIn: false, userID: null };
    }
}

document.addEventListener('DOMContentLoaded', includeHTML);
document.addEventListener('DOMContentLoaded', initializeCartModal);
