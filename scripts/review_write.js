document.getElementById('send').addEventListener('click', function() {
    window.location.href='/pages/review.html';
});

document.getElementById('file-upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const uploadImage = document.getElementById('upload-image');
            uploadImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});