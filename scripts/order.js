document.getElementById('order').addEventListener('click', function() {
    window.location.href='/main.html';
});

// Get the radio buttons and the card input fields
const cashRadio = document.getElementById('cash-radio');
const cardRadio = document.getElementById('card-radio');
const cardNumberInput = document.getElementById('cardnumber');
const expDateInput = document.getElementById('exp_date');
const codeInput = document.getElementById('code');

// Function to disable or enable the card inputs
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

// Add event listeners to the radio buttons
cashRadio.addEventListener('change', toggleCardInputs);
cardRadio.addEventListener('change', toggleCardInputs);

// Initial toggle on page load (since cash is checked by default)
toggleCardInputs();