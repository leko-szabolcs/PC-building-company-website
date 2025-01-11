document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/reviews');
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Hiba történt a vélemények lekérésekor:', errorData.error);
            return;
        }

        const reviews = await response.json();
        const reviewsContainer = document.querySelector('.reviews-container');
        reviewsContainer.innerHTML = '';

        reviews.forEach((review) => {
            const reviewElement = document.createElement('div');
            reviewElement.classList.add('review');
            reviewElement.innerHTML = `
                <img src="${review.picture}" alt="Review Image" class="review-image">
                <div class="review-content">
                    <p class="review-text">${review.review_text}</p>
                    <p class="review-author">${review.name}</p>
                </div>
                <div class="review-right">
                    <p class="review-rating">${review.stars}/5</p>
                    <img src="../pictures/star.png" alt="Star Rating Image" class="review-image">
                </div>
            `;
            reviewsContainer.appendChild(reviewElement);
        });
    } catch (error) {
        console.error('Hiba a vélemények betöltésekor:', error);
    }
});

document.getElementById('nav_to_write').addEventListener('click', function() {
    window.location.href='/pages/review_write.html';
});