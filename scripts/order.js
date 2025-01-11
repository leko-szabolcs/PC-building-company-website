document.getElementById('order').addEventListener('click', async function () {
    try {
        const { isLoggedIn, userID } = await checkLoginStatusAndGetUserID();

        if (!isLoggedIn || !userID) {
            alert('A rendelés leadásához be kell jelentkeznie.');
            window.location.href = '/pages/login.html';
            return;
        }

        const response = await fetch(`/api/shopping-cart?userID=${userID}`);
        if (!response.ok) {
            throw new Error('Nem sikerült lekérni a kosár tételeit.');
        }

        const cartItems = await response.json();
        if (!cartItems || cartItems.length === 0) {
            alert('A kosara üres. A rendelés leadása előtt tegye a kosarába a termékeket.');
            return;
        }

        const totalAmount = cartItems.reduce((sum, item) => sum + (item.total || 0), 0);

        const paymentMethod = document.getElementById('cash-radio').checked ? 1 : 2;

        const paymentResponse = await fetch('/api/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: totalAmount,
                method: paymentMethod,
                userID: userID,
            }),
        });

        if (!paymentResponse.ok) {
            throw new Error('Nem sikerült feldolgozni a fizetést.');
        }

        const paymentResult = await paymentResponse.json();
        if (paymentResult.success) {
            alert('Megrendelés sikeresen leadva!');
            window.location.href = '/main.html';
        } else {
            alert('Nem sikerült leadni a rendelést. Kérjük, próbálja újra.');
        }
    } catch (error) {
        console.error('Hiba a rendelés feldolgozása közben:', error);
        alert('Hiba történt a rendelés leadása közben. Kérjük, próbálja újra később.');
    }
});


const cashRadio = document.getElementById('cash-radio');
const cardRadio = document.getElementById('card-radio');
const cardNumberInput = document.getElementById('cardnumber');
const expDateInput = document.getElementById('exp_date');
const codeInput = document.getElementById('code');

function toggleCardInputs() {
    if (cashRadio.checked) {
        cardNumberInput.disabled = true;
        expDateInput.disabled = true;
        codeInput.disabled = true;
    } else if (cardRadio.checked) {
        cardNumberInput.disabled = false;
        expDateInput.disabled = false;
        codeInput.disabled = false;
    }
}

cashRadio.addEventListener('change', toggleCardInputs);
cardRadio.addEventListener('change', toggleCardInputs);

toggleCardInputs();

async function fetchAndDisplayCartItems(userID) {
    try {
        const response = await fetch(`/api/shopping-cart?userID=${userID}`);
        if (!response.ok) {
            throw new Error('Nem sikerült lekérni a kosár tételeit.');
        }

        const cartItems = await response.json();
        const imagesRow = document.getElementById('images-row');
        const detailsColumn = document.getElementById('details-column');
        const priceContainer = document.getElementById('full-price-container');

        if (!imagesRow || !detailsColumn || !priceContainer) {
            console.error("Hiányzó tárolóelemek: #images-row, #details-column, or #full-price-container");
            return;
        }

        imagesRow.innerHTML = '';
        detailsColumn.innerHTML = '';
        priceContainer.innerHTML = '';

        let totalSum = 0;

        if (!cartItems || cartItems.length === 0) {
            detailsColumn.innerHTML = '<p class="txt">A kosarad üres.</p>';
            return;
        }

        cartItems.forEach((item) => {
            const imageElement = document.createElement('img');
            imageElement.src = item.picture || '../pictures/pc_example.jpg';
            imageElement.alt = item.product_name;
            imageElement.classList.add('pc');
            imagesRow.appendChild(imageElement);

            const detailsElement = document.createElement('div');
            detailsElement.classList.add('item-details');
            detailsElement.innerHTML = `
                <p class="price-txt">${item.quantity}x ${item.product_name}</p>
                <p class="price">${item.total} Ft</p>
            `;
            detailsColumn.appendChild(detailsElement);

            totalSum += item.total|| 0; 
        });

        priceContainer.innerHTML = `
            <p class="price-txt">Összesen:</p>
            <p class="price">${totalSum} Ft</p>
        `;
    } catch (error) {
        console.error("Hiba fetchAndDisplayCartItems-ben:", error);
        alert('Nem sikerült betölteni a kosár tételeit. Kérjük, próbálja újra később.');
    }
}





async function initPage() {
    const { isLoggedIn, userID } = await checkLoginStatusAndGetUserID();

    if (!isLoggedIn || !userID) {
        alert('Ahhoz, hogy termékeket a kosárba helyezhessen, be kell jelentkeznie.');
        window.location.href = '/pages/login.html';
        return;
    }

    fetchAndDisplayCartItems(userID);
}

initPage();

document.addEventListener("DOMContentLoaded", () => {
    console.log("Az oldal betöltve. DOM-elemek ellenőrzése...");
    console.log("Elemek tárolója:", document.getElementById('items'));
    console.log("Jobb contrainer:", document.getElementById('right-container'));
});
