document.addEventListener('DOMContentLoaded', async function () {
    const userStatus = await checkLoginStatus();
    if (!userStatus.isLoggedIn) {
        alert('Vélemény írásához be kell jelentkeznie!');
        window.location.href = '/pages/login.html';
        return;
    }

    const starSlider = document.getElementById('star-slider');
        const ratingValue = document.getElementById('rating-value');
        starSlider.addEventListener('input', () => {
            ratingValue.textContent = starSlider.value;
        });

    document.getElementById('send').addEventListener('click', async function () {
        const name = document.querySelector('input[placeholder="Név"]').value.trim();
        const reviewText = document.querySelector('textarea[placeholder="Szöveg"]').value.trim();
        const stars = starSlider.value;
        const fileInput = document.getElementById('file-upload');
        let picture = null;

        if (!name || !reviewText || stars <= 0) {
            alert('Kérjük, töltse ki az összes mezőt, és adjon meg értékelést.');
            return;
        }

        if (fileInput.files.length > 0) {
            try {
                picture = await fileToBase64(fileInput.files[0]);
                console.log("Base64 kép adat:", picture);
            } catch (error) {
                console.error('Hiba a fájl olvasásakor:', error);
                alert('Nem sikerült feldolgozni a feltöltött képet. Kérjük, próbálja újra!');
                return;
            }
        }

        const reviewData = { name, reviewText, stars, picture };

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Hiba a vélemény elküldésekor:', errorData.error);
                alert('Nem sikerült elküldeni a véleményt. Kérjük, próbálja újra később.');
                return;
            }

            alert('A vélemény sikeresen elküldve!');
            window.location.href = '/pages/review.html';
        } catch (error) {
            console.error('Váratlan hiba a felülvizsgálat elküldésekor:', error);
            alert('Váratlan hiba történt. Kérjük, próbálja újra.');
        }
    });

    async function checkLoginStatus() {
        try {
            const response = await fetch('/api/check-login', { method: 'GET' });
            if (response.ok) {
                return await response.json();
            }
            return { isLoggedIn: false };
        } catch (error) {
            console.error('Hiba a bejelentkezési állapot ellenőrzése során:', error);
            return { isLoggedIn: false };
        }
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
});