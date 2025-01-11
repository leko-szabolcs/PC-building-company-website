document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        document.getElementById("loading-spinner").style.display = "none";
        document.getElementById("content").style.display = "block";
    }, 1000);
});

async function loadProducts(sortOrder = 'newest', selectedFilters = {}) {
    try {
        const queryParams = new URLSearchParams({
            sortOrder,
            ...selectedFilters,
        }).toString();

        const response = await fetch(`/api/products?${queryParams}`);
        if (!response.ok) {
            throw new Error(`HTTP hiba! Státusz: ${response.status}`);
        }

        const products = await response.json();

        const container = document.getElementById('scrollable-content');
        container.innerHTML = '';

        if (!products.length) {
            container.innerHTML = '<p class="no-results-message">Nem található a kiválasztott szűrőknek megfelelő termék.</p>';
            container.classList.add('no-results');
            return;
        }

        container.classList.remove('no-results');

        products.forEach((product) => {
            const item = document.createElement('div');
            item.className = 'item';

            const imageSrc = product.picture || '/pictures/pc_example.jpg';

            item.innerHTML = `
                <div class="item-pic">
                    <img src="${imageSrc}" alt="${product.product_name}" onerror="this.src='/pictures/pc_example.jpg';">
                </div>
                <p>${product.product_name}</p>
            `;

            item.addEventListener('click', () => {
                window.location.href = `/pc_data.html?productID=${product.productID}`;
            });

            container.appendChild(item);
        });
    } catch (error) {
        console.error('Hiba a termékek betöltésekor:', error);
    }
}

function getSelectedFilters() {
    const selectedFilters = {
        processor: [],
        videocard: [],
        memory: [],
    };

    document.querySelectorAll('#processor-type .custom-checkbox').forEach(checkbox => {
        if (checkbox.checked) selectedFilters.processor.push(checkbox.previousElementSibling.textContent.trim());
    });

    document.querySelectorAll('#videocard-type .custom-checkbox').forEach(checkbox => {
        if (checkbox.checked) selectedFilters.videocard.push(checkbox.previousElementSibling.textContent.trim());
    });

    document.querySelectorAll('#memory-type .custom-checkbox').forEach(checkbox => {
        if (checkbox.checked) selectedFilters.memory.push(checkbox.previousElementSibling.textContent.trim());
    });

    const searchQuery = document.getElementById('search').value.trim();

    return {
        processor: selectedFilters.processor.join(','),
        videocard: selectedFilters.videocard.join(','),
        memory: selectedFilters.memory.join(','),
        q: searchQuery || '',
    };
}

document.querySelectorAll('.custom-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
        const selectedFilters = getSelectedFilters();
        const sortOrder = document.getElementById('dropdownButton').textContent.trim();
        loadProducts(sortOrder, selectedFilters);
        updateFilterOptions(selectedFilters); 

    });
});

document.querySelectorAll('.dropdown-content a').forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault();

        const selectedText = this.getAttribute('data-value');
        document.getElementById('dropdownButton').textContent = selectedText;

        let sortOrder = 'newest';
        if (selectedText === 'Ár szerint növekvő') sortOrder = 'asc';
        else if (selectedText === 'Ár szerint csökkenő') sortOrder = 'desc';
        else if (selectedText === 'Legújabb') sortOrder = 'newest';
        else if (selectedText === 'Legrégibb') sortOrder = 'oldest';

        const selectedFilters = getSelectedFilters();
        loadProducts(sortOrder, selectedFilters);
    });
});

async function updateFilterOptions(selectedFilters) {
    try {
        const queryParams = new URLSearchParams(selectedFilters).toString();
        const response = await fetch(`/api/filters?${queryParams}`);
        if (!response.ok) {
            throw new Error(`Nem sikerült lekérni a filter API-t: ${response.status}`);
        }

        const filters = await response.json();

        document.querySelectorAll('#processor-type .custom-checkbox').forEach(checkbox => {
            const optionText = checkbox.previousElementSibling.textContent.trim();
            checkbox.disabled = !filters.processor.includes(optionText);
        });

        document.querySelectorAll('#videocard-type .custom-checkbox').forEach(checkbox => {
            const optionText = checkbox.previousElementSibling.textContent.trim();
            checkbox.disabled = !filters.videocard.includes(optionText);
        });

        document.querySelectorAll('#memory-type .custom-checkbox').forEach(checkbox => {
            const optionText = checkbox.previousElementSibling.textContent.trim();
            checkbox.disabled = !filters.memory.includes(optionText);
        });
    } catch (error) {
        console.error('Hiba történt a filter opció frissítése közben:', error);
    }
}


document.getElementById('search-btn').addEventListener('click', async () => {
    const searchInput = document.getElementById('search').value.trim();


    document.querySelectorAll('.custom-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });

    const selectedFilters = {
        processor: '',
        videocard: '',
        memory: '',
        q: searchInput || '',
    };
    loadProducts('newest', selectedFilters); 
    updateFilterOptions(selectedFilters);

    if (!searchInput) {
        return;
    }

    try {
        const queryParams = new URLSearchParams(selectedFilters).toString();

        const response = await fetch(`/api/products?${queryParams}`);
        if (!response.ok) {
            if (response.status === 404) {
                const container = document.getElementById('scrollable-content');
                container.innerHTML = '<p class="no-results-message">Nem található termék.</p>';
                return;
            }
            throw new Error(`HTTP hiba! Státusz: ${response.status}`);
        }

        const products = await response.json();

        const container = document.getElementById('scrollable-content');
        container.innerHTML = '';

        if (!products.length) {
            container.innerHTML = '<p class="no-results-message">Nem található a keresésnek megfelelő termék</p>';
            return;
        }

        products.forEach(product => {
            const item = document.createElement('div');
            item.className = 'item';

            const imageSrc = product.picture || '/pictures/pc_example.jpg';

            item.innerHTML = `
                <div class="item-pic">
                    <img src="${imageSrc}" alt="${product.product_name}" onerror="this.src='/pictures/pc_example.jpg';">
                </div>
                <p>${product.product_name}</p>
            `;

            item.addEventListener('click', () => {
                window.location.href = `/pc_data.html?productID=${product.productID}`;
            });

            container.appendChild(item);
        });
    } catch (error) {
        console.error('Hiba a keresés során:', error);
        alert('Nem sikerült lekérni a keresési eredményeket. Kérjük, próbálja újra később.');
    }
});

document.getElementById('search').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        document.getElementById('search-btn').click();
    }
});

window.addEventListener('load', () => {
    const sortOrder = 'newest';
    const selectedFilters = getSelectedFilters();
    loadProducts(sortOrder, selectedFilters);
    updateFilterOptions(selectedFilters); 
});

const scrollableContent = document.getElementById('scrollable-content');
const customScrollbar = document.getElementById('custom-scrollbar');
const scrollbarThumb = customScrollbar.querySelector('div');

let isDragging = false;
let startY;
let startTop;

function updateScrollbarThumb() {
    const contentHeight = scrollableContent.scrollHeight;
    const visibleHeight = scrollableContent.clientHeight;
    const thumbHeight = (visibleHeight / contentHeight) * customScrollbar.clientHeight;

    scrollbarThumb.style.height = `${thumbHeight}px`;
}

function updateScrollbarThumbPosition() {
    const scrollTop = scrollableContent.scrollTop;
    const contentHeight = scrollableContent.scrollHeight;
    const visibleHeight = scrollableContent.clientHeight;
    const scrollRatio = scrollTop / (contentHeight - visibleHeight);

    const maxThumbPosition = customScrollbar.clientHeight - scrollbarThumb.clientHeight;
    const thumbTop = scrollRatio * maxThumbPosition;

    scrollbarThumb.style.top = `${thumbTop}px`;
}

scrollbarThumb.addEventListener('mousedown', function (e) {
    isDragging = true;
    startY = e.clientY;
    startTop = parseInt(window.getComputedStyle(scrollbarThumb).top, 10) || 0;
    document.body.style.userSelect = 'none';
});

document.addEventListener('mouseup', function () {
    isDragging = false;
    document.body.style.userSelect = '';
});

document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;

    const deltaY = e.clientY - startY;
    const newTop = startTop + deltaY;

    const maxThumbPosition = customScrollbar.clientHeight - scrollbarThumb.clientHeight;
    const clampedTop = Math.max(0, Math.min(newTop, maxThumbPosition));

    scrollbarThumb.style.top = `${clampedTop}px`;
    
    const scrollRatio = clampedTop / maxThumbPosition;
    const newScrollTop = scrollRatio * (scrollableContent.scrollHeight - scrollableContent.clientHeight);
    scrollableContent.scrollTop = newScrollTop;
});

scrollableContent.addEventListener('scroll', updateScrollbarThumbPosition);

window.addEventListener('load', updateScrollbarThumb);
window.addEventListener('resize', updateScrollbarThumb);
