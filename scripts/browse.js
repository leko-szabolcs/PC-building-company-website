document.querySelectorAll('.dropdown-content a').forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault(); 
        let selectedText = this.getAttribute('data-value');
        document.getElementById('dropdownButton').textContent = selectedText;
    });
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