function toggleMenu() {
    document.getElementById('mobileMenu').classList.toggle('open');
}
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
document.querySelectorAll('a[href^="#"]:not(.shop-now-btn)').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const id = a.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        // document.getElementById('mobileMenu').classList.remove('open');
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) mobileMenu.classList.remove('open');

        console.log('In-page anchor handler fired for:', a.href);

    });
});

const artisanCaptions = [
    "The beauty you see is built on hours you don't.",
    "Every motif is drawn freehand, never traced.",
    "A single tapestry holds over two hundred strokes.",
    "No two pieces are ever quite the same."
];
let artisanIndex = 0;
let artisanBusy = false;
function paintMotif() {
    if (artisanBusy) return;
    artisanBusy = true;
    const wrap = document.getElementById('artisanWrap');
    const caption = document.getElementById('artisanCaption');
    const motif = document.getElementById('newMotif');
    wrap.classList.add('painting');
    caption.style.opacity = 0;
    setTimeout(() => {
        caption.textContent = artisanCaptions[artisanIndex % artisanCaptions.length];
        caption.style.opacity = 1;
        artisanIndex++;
        motif.classList.add('shown');
    }, 1500);
    setTimeout(() => {
        wrap.classList.remove('painting');
        artisanBusy = false;
    }, 2300);
}


document.querySelectorAll('.celestial').forEach(el => {
    el.addEventListener('click', () => {
        if (el.classList.contains('sparkle')) return;
        el.classList.add('sparkle');
        spawnParticles(el);
        setTimeout(() => el.classList.remove('sparkle'), 900);
    });
});

function spawnParticles(el) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const count = 10;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'sparkle-particle particle-anim';
        const angle = (Math.PI * 2 * i) / count;
        const dist = 30 + Math.random() * 20;
        p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
        p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
        p.style.left = cx + 'px';
        p.style.top = cy + 'px';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 850);
    }
}






// Highlight the target section when arriving via #anchor (e.g. from Collections grid)
window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash;
    if (hash) {
        const target = document.querySelector(hash);
        if (target && target.classList.contains('shop-section')) {
            target.classList.add('highlight');
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                target.classList.remove('highlight');
            }, 1800);
        }
    }
});


// ============================
// TROVE SHOP — CSV PRODUCT FEED
// ============================

const PRODUCTS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSaGeHFYcbGLX_XbYgNphfG7066Pi55NG8T7RQ1j4MdrFqltvfCtS-WhFXWcSv2ad2iQZAl4efrxKKM/pub?gid=0&single=true&output=csv";

// Converts a normal Google Drive share link into a direct-image URL
function convertDriveLink(shareLink) {
    if (!shareLink) return '';
    const match = shareLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        const fileId = match[1];
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
    return shareLink;
}

// Builds the HTML for a single product card
function buildProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const img = document.createElement('div');
    img.className = 'product-card-img';

    const imageUrl = convertDriveLink(product.Image1);

    // console.log('Raw link:', product.Image1, '→ Converted:', imageUrl); // TEMP DEBUG

    if (imageUrl) {
        img.style.backgroundImage = `url('${imageUrl}')`;
        img.style.backgroundSize = 'cover';
        img.style.backgroundPosition = 'center';
    }

    const name = document.createElement('p');
    name.className = 'product-name';
    name.textContent = product.Name || 'Untitled Product';

    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = product.Price ? `₹${product.Price}` : '';

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(price);

    // Clicking a card will eventually link to product.html?id=slug
    card.addEventListener('click', () => {
        if (product['ID/Slug']) {
            window.location.href = `product.html?id=${product['ID/Slug']}`;
        }
    });

    return card;
}

// Fetches the CSV, parses it, and renders products into matching category grids
function loadProductsFromSheet() {
    if (typeof Papa === 'undefined') {
        return; // PapaParse not loaded on this page — skip silently
    }



    if (!PRODUCTS_CSV_URL || PRODUCTS_CSV_URL.includes('PASTE_YOUR')) {
        console.warn('Trove: No CSV URL set yet — skipping product load.');
        return;
    }

    Papa.parse(PRODUCTS_CSV_URL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const products = results.data;
            // console.log('Fetched products:', products); // TEMP DEBUG LINE


            const grids = document.querySelectorAll('.shop-grid');

            grids.forEach(grid => {
                const categoryName = grid.getAttribute('data-category');
                const matchingProducts = products.filter(
                    p => (p.Category || '').trim() === categoryName
                );

                grid.innerHTML = ''; // clear anything currently inside

                if (matchingProducts.length === 0) {
                    return; // leave empty if no products yet for this category
                }

                matchingProducts.forEach(product => {
                    grid.appendChild(buildProductCard(product));
                });
            });
        },
        error: function (err) {
            console.error('Trove: Failed to load products CSV', err);
        }
    });
}

window.addEventListener('DOMContentLoaded', loadProductsFromSheet);