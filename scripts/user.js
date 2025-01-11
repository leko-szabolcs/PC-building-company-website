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

const signupButton = document.getElementById('signup');
const unsubButton = document.getElementById('unsub');

function toggleSubscription() {
    fetch('/api/toggle-subscription', { method: 'POST', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.subscribed === 1) {
                    signupButton.style.display = 'none';
                    unsubButton.style.display = 'flex';
                } else {
                    signupButton.style.display = 'flex';
                    unsubButton.style.display = 'none';
                }
            } else {
                console.error('Nem sikerült frissíteni az előfizetési állapotot', data.message);
            }
        })
        .catch(error => console.error('Hiba történt az előfizetés állapotának frissítésekor:', error));
}

signupButton.addEventListener('click', toggleSubscription);
unsubButton.addEventListener('click', toggleSubscription);

fetch('/api/check-subscription', { method: 'GET', credentials: 'include' })
    .then(response => response.json())
    .then(data => {
        if (data.subscribed === 1) {
            signupButton.style.display = 'none';
            unsubButton.style.display = 'flex';
        } else {
            signupButton.style.display = 'flex';
            unsubButton.style.display = 'none';
        }
    })
    .catch(error => console.error('Hiba az előfizetés megfigyelése közben', error));

function logout() {
    fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', credentials: 'include' },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('rememberMe');
            sessionStorage.removeItem('isLoggedIn');
            window.location.href = '/pages/login.html';
        } else {
            console.error('Kijelentkezés sikertelen lett:', data.message);
        }
    })
    .catch(error => console.error('Hiba kijelentkezés közben', error));
}

document.getElementById('delete_acc2').addEventListener('click', function() {
    fetch('/api/delete-user', { method: 'POST', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('isLoggedIn');

                window.location.href = '/pages/login.html';
            } else {
                alert('Felhasználó törlése sikertelen.');
            }
        })
        .catch(error => {
            console.error('Hiba a törlés közben:', error);
            alert('Felhasználó törlése közben hiba lépett fel.');
        });
});

document.addEventListener('DOMContentLoaded', async () => {
    const { isLoggedIn, userID } = await checkLoginStatusAndGetUserID();

    if (!isLoggedIn) {
        console.error('A felhasználó nincsen bejelentkezve.');
        return; 
    }

    console.log('Felhasználói azonosító lekérve:', userID);

    const response = await fetch('/get-user-email', { method: 'GET', credentials: 'include' });
        const data = await response.json();

        if (!data.success) {
            console.error('Nem sikerült lekérni a felhasználói e-mailt:', data.message);
            return;
        }

        const emailElement = document.querySelector('.email');
        if (emailElement) {
            emailElement.textContent = data.email || 'N/A';
        } else {
            console.error('Az e-mail elem nem található a DOM-ban.');
        }

    fetch(`/api/last-purchased-products?userID=${userID}`, { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const rightContainer = document.getElementById('right-container');

                const productElements = document.querySelectorAll('.pc-txt');
                productElements.forEach(el => el.remove());

                if (data.products.length === 0) {
                    const noProductsMessage = document.createElement('p');
                    noProductsMessage.textContent = 'Nincsenek megvásárolt termékek.';
                    rightContainer.appendChild(noProductsMessage);
                } else {
                    data.products.forEach(product => {
                        const productElement = document.createElement('div');
                        productElement.classList.add('pc-txt');

                        productElement.innerHTML = `
                            <img src="${product.picture}" alt="${product.product_name}" class="pc">
                            <p class="pcc">${product.product_name}</p>
                        `;
                        rightContainer.appendChild(productElement);
                    });
                }
            } else {
                console.error('Nem sikerült lekérni az utoljára vásárolt termékeket:', data.message);
            }
        })
        .catch(error => console.error('Hiba történt az utoljára vásárolt termékek lekérésekor:', error));
});

document.getElementById('logout').addEventListener('click', logout);