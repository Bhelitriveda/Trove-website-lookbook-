// ============================
// TROVE — PRODUCT DETAIL PAGE
// ============================

const INSTAGRAM_USERNAME = "trove_placeholder"; // TODO: swap with real Trove Instagram username
const WHATSAPP_NUMBER = "917217092030"; // TODO: swap with real Trove WhatsApp number (with country code, no + or spaces)


let currentSlide = 0;
let totalSlides = 0;

function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function renderProduct(product) {
    document.getElementById('productLoading').style.display = 'none';
    document.getElementById('productDetail').style.display = 'grid';

    document.getElementById('productCategory').textContent = product.Category || '';
    document.getElementById('productName').textContent = product.Name || 'Untitled Product';
    document.getElementById('productPrice').textContent = product.Price ? `₹${product.Price}` : '';
    document.getElementById('productDescription').textContent = product.Description || '';

    if (product.Badge && product.Badge.trim() !== '') {
        const badge = document.getElementById('productBadge');
        badge.textContent = product.Badge;
        badge.style.display = 'inline-block';
    }

    // Shop Now → Instagram DM
    document.getElementById('shopNowBtn').href = `https://ig.me/m/trove.handcrafted`;

    // Shop Now → WhatsApp DM, with pre-filled message
    const whatsappMessage = `Hi! I'm interested in: ${product.Name || 'this product'}${product.Price ? ` (₹${product.Price})` : ''}`;
    const encodedMessage = encodeURIComponent(whatsappMessage);
    document.getElementById('shopNowWhatsApp').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Build gallery from Image1–Image4, skipping empty ones
    const imageFields = ['Image1', 'Image2', 'Image3', 'Image4'];
    const images = imageFields
        .map(field => convertDriveLink(product[field]))
        .filter(url => url && url.trim() !== '');

    const track = document.getElementById('galleryTrack');
    const dotsContainer = document.getElementById('galleryDots');
    track.innerHTML = '';
    dotsContainer.innerHTML = '';

    images.forEach((url, index) => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = `${product.Name || 'Product'} image ${index + 1}`;
        track.appendChild(img);

        const dot = document.createElement('div');
        dot.className = 'gallery-dot' + (index === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    totalSlides = images.length;
    currentSlide = 0;
    updateGalleryPosition();

    // Hide arrows/dots entirely if there's only one image (or none)
    const hasMultiple = totalSlides > 1;
    document.getElementById('galleryPrev').style.display = hasMultiple ? 'flex' : 'none';
    document.getElementById('galleryNext').style.display = hasMultiple ? 'flex' : 'none';
    dotsContainer.style.display = hasMultiple ? 'flex' : 'none';
}

function updateGalleryPosition() {
    const track = document.getElementById('galleryTrack');
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    document.querySelectorAll('.gallery-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

function goToSlide(index) {
    if (totalSlides === 0) return;
    currentSlide = (index + totalSlides) % totalSlides;
    updateGalleryPosition();
}

function nextSlide() {
    goToSlide(currentSlide + 1);
}

function prevSlide() {
    goToSlide(currentSlide - 1);
}

function setupGalleryControls() {
    document.getElementById('galleryNext').addEventListener('click', nextSlide);
    document.getElementById('galleryPrev').addEventListener('click', prevSlide);

    // Swipe support for mobile
    const track = document.getElementById('galleryTrack');
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const swipeDistance = touchStartX - touchEndX;
        const swipeThreshold = 40;

        if (swipeDistance > swipeThreshold) {
            nextSlide();
        } else if (swipeDistance < -swipeThreshold) {
            prevSlide();
        }
    });
}

function loadProductDetail() {
    const productId = getProductIdFromUrl();

    if (!productId || typeof Papa === 'undefined' || !PRODUCTS_CSV_URL || PRODUCTS_CSV_URL.includes('PASTE_YOUR')) {
        showProductError();
        return;
    }

    Papa.parse(PRODUCTS_CSV_URL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const product = results.data.find(
                p => (p['ID/Slug'] || '').trim() === productId.trim()
            );

            if (!product) {
                showProductError();
                return;
            }

            renderProduct(product);
        },
        error: function () {
            showProductError();
        }
    });
}

function showProductError() {
    document.getElementById('productLoading').style.display = 'none';
    document.getElementById('productError').style.display = 'block';
}

window.addEventListener('DOMContentLoaded', () => {
    setupGalleryControls();
    loadProductDetail();
});