document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        document.getElementById("loading-spinner").style.display = "none"; 
        document.getElementById("content").style.display = "block"; 
    }, 1000); 
});
async function loadProductData() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const productID = urlParams.get('productID');
        if (!productID) {
            throw new Error('Az URL-ben nincs megadva termékazonosító.');
        }

        const response = await fetch(`/api/products/${productID}`);
        if (!response.ok) {
            throw new Error(`HTTP hiba! Státusz: ${response.status}`);
        }

        const product = await response.json();
        if (!product) {
            throw new Error('A termék nem található.');
        }

        const bigPcImg = document.getElementById('big-pc').querySelector('img');
        const smallPicsContainer = document.getElementById('small-pcs');
        const additionalPictures = product.additionalPictures || [];

        smallPicsContainer.innerHTML = '';

        const primaryImg = document.createElement('img');
        primaryImg.src = product.picture || '../pictures/pc_example.jpg';
        primaryImg.classList.add('active'); 
        smallPicsContainer.appendChild(primaryImg);

        bigPcImg.src = primaryImg.src;

        additionalPictures.forEach((imageURL) => {
            const img = document.createElement('img');
            img.src = imageURL || '../pictures/pc_example_2.jpg';
            smallPicsContainer.appendChild(img);
        });

        document.getElementById('proc-data').textContent = product.processor || 'N/A';
        document.getElementById('gpu-data').textContent = product.videocard || 'N/A';
        document.getElementById('mother-data').textContent = product.motherboard || 'N/A';
        document.getElementById('memory-data').textContent = product.memory || 'N/A';
        document.getElementById('ssd1-data').textContent = product.ssd_hdd || 'N/A';
        document.getElementById('psu-data').textContent = product.psu || 'N/A';
        document.getElementById('opsys-data').textContent = product.opsys || 'N/A';
        document.getElementById('vent-data').textContent = product.ventillation || 'N/A';
        document.getElementById('case-data').textContent = product.cases || 'N/A';
        document.getElementById('ssd2-data').textContent = product.second_hdd_ssd || 'N/A';

        document.getElementById('price').textContent = `Ár: ${product.price || 'N/A'} FT`;
        document.getElementById('pc_name').textContent = product.product_name || 'Gamer Számítógép';

        setupImageSwitcher();
    } catch (error) {
        console.error('Hiba a termékadatok betöltésekor:', error);
        alert('Nem sikerült betölteni a termékadatokat. Kérjük, próbálja újra később.');
    }
}

function setupImageSwitcher() {
    const bigPcImg = document.querySelector("#big-pc img");
    const smallPcImages = document.querySelectorAll("#small-pcs img");

    smallPcImages.forEach((smallImg) => {
        smallImg.addEventListener("click", () => {
            bigPcImg.src = smallImg.src;

            smallPcImages.forEach((img) => img.classList.remove("active"));
            smallImg.classList.add("active");
        });
    });

    const activeImg = document.querySelector("#small-pcs img.active");
    if (activeImg) {
        bigPcImg.src = activeImg.src;
    }
}


window.addEventListener('load', () => {
    loadProductData().then(() => {
        setupImageSwitcher();
    });
});


document.getElementById('basket').addEventListener('click', async function () {
    const productID = new URLSearchParams(window.location.search).get('productID');

    const { isLoggedIn, userID } = await checkLoginStatusAndGetUserID();

    if (!isLoggedIn || !userID) {
        alert('Ahhoz, hogy termékeket a kosárba helyezhessen, be kell jelentkeznie.');
        window.location.href = '/pages/login.html';
        return;
    }

    try {
        const response = await fetch('/api/shopping-cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productID: parseInt(productID, 10),
                userID: parseInt(userID, 10),
                quantity: 1,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json(); 
            throw new Error(errorData.error || 'Nem sikerült a tételt a kosárba helyezni.');
        }

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Hiba történt a tétel kosárba helyezésekor:', error);
        alert(error.message); 
    }
});

