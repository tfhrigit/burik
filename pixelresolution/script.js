document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const uploadContainer = document.getElementById('uploadContainer');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const appContainer = document.getElementById('appContainer');
    const errorMessage = document.getElementById('errorMessage');
    const pixelSizeSlider = document.getElementById('pixelSize');
    const blurAmountSlider = document.getElementById('blurAmount');
    const pixelSizeValue = document.getElementById('pixelSizeValue');
    const blurValue = document.getElementById('blurValue');
    const originalCanvas = document.getElementById('originalCanvas');
    const resultCanvas = document.getElementById('resultCanvas');
    const downloadPng = document.getElementById('downloadPng');
    const downloadJpeg = document.getElementById('downloadJpeg');
    const resetBtn = document.getElementById('resetBtn');
    
    // Canvas contexts
    const originalCtx = originalCanvas.getContext('2d');
    const resultCtx = resultCanvas.getContext('2d');
    
    // State
    let originalImage = null;
    const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12MB
    
    // Event Listeners
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    uploadContainer.addEventListener('dragover', handleDragOver);
    uploadContainer.addEventListener('drop', handleDrop);
    pixelSizeSlider.addEventListener('input', updatePixelSize);
    blurAmountSlider.addEventListener('input', updateBlurAmount);
    downloadPng.addEventListener('click', () => downloadImage('png'));
    downloadJpeg.addEventListener('click', () => downloadImage('jpeg'));
    resetBtn.addEventListener('click', resetImage);
    
    // Functions
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadContainer.style.borderColor = '#ffcc66';
        uploadContainer.style.backgroundColor = 'rgba(90, 62, 54, 0.7)';
    }
    
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadContainer.style.borderColor = '#c19a6b';
        uploadContainer.style.backgroundColor = 'rgba(61, 47, 47, 0.7)';
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }
    
    function handleFileSelect(e) {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    }
    
    function handleFile(file) {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            showError('File terlalu besar! Maksimal 12MB.');
            return;
        }
        
        // Check file type
        if (!file.type.match('image.*')) {
            showError('File harus berupa gambar!');
            return;
        }
        
        // Hide error message
        hideError();
        
        // Read file
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                originalImage = img;
                displayOriginalImage();
                processImage();
                appContainer.style.display = 'flex';
                uploadContainer.style.display = 'none';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    function displayOriginalImage() {
        // Set canvas dimensions
        const maxWidth = 400;
        const maxHeight = 300;
        let { width, height } = originalImage;
        
        // Scale down if needed
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
        }
        
        originalCanvas.width = width;
        originalCanvas.height = height;
        resultCanvas.width = width;
        resultCanvas.height = height;
        
        // Draw original image
        originalCtx.clearRect(0, 0, width, height);
        originalCtx.drawImage(originalImage, 0, 0, width, height);
    }
    
    function processImage() {
        if (!originalImage) return;
        
        const pixelSize = parseInt(pixelSizeSlider.value);
        const blurAmount = parseInt(blurAmountSlider.value);
        
        // Get canvas dimensions
        const width = resultCanvas.width;
        const height = resultCanvas.height;
        
        // Clear result canvas
        resultCtx.clearRect(0, 0, width, height);
        
        // Draw original image to result canvas
        resultCtx.drawImage(originalImage, 0, 0, width, height);
        
        // Get image data
        const imageData = resultCtx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Pixelate
        for (let y = 0; y < height; y += pixelSize) {
            for (let x = 0; x < width; x += pixelSize) {
                // Get color of the pixel at top-left corner of the block
                const pixelIndex = (y * width + x) * 4;
                const r = data[pixelIndex];
                const g = data[pixelIndex + 1];
                const b = data[pixelIndex + 2];
                
                // Fill the block with that color
                resultCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                resultCtx.fillRect(x, y, pixelSize, pixelSize);
            }
        }
        
        // Apply blur if needed
        if (blurAmount > 0) {
            // Apply a simple blur effect
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = width;
            tempCanvas.height = height;
            
            // Draw pixelated image to temp canvas
            tempCtx.drawImage(resultCanvas, 0, 0);
            
            // Apply blur
            resultCtx.filter = `blur(${blurAmount}px)`;
            resultCtx.clearRect(0, 0, width, height);
            resultCtx.drawImage(tempCanvas, 0, 0);
            resultCtx.filter = 'none';
        }
    }
    
    function updatePixelSize() {
        pixelSizeValue.textContent = this.value;
        processImage();
    }
    
    function updateBlurAmount() {
        blurValue.textContent = this.value;
        processImage();
    }
    
    function downloadImage(format) {
        if (!originalImage) return;
        
        const link = document.createElement('a');
        link.download = `pixel-burik.${format === 'png' ? 'png' : 'jpg'}`;
        link.href = resultCanvas.toDataURL(`image/${format === 'png' ? 'png' : 'jpeg'}`);
        link.click();
    }
    
    function resetImage() {
        if (originalImage) {
            pixelSizeSlider.value = 10;
            blurAmountSlider.value = 0;
            pixelSizeValue.textContent = '10';
            blurValue.textContent = '0';
            processImage();
        }
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
    
    function hideError() {
        errorMessage.style.display = 'none';
    }
});