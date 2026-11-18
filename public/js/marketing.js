// ============================================================
// TIỆM TẠP HÓA - MARKETING FEATURES JS
// Flash Sale | Hero Slider | Social Proof | Floating Buttons
// ============================================================

// ===== 1. HERO BANNER SLIDER AUTO-ROTATE =====
(function initHeroSlider() {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    if (!slides.length) return;

    function goToSlide(n) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        currentSlide = (n + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    // Expose globally for dot onclick
    window.goToSlide = goToSlide;

    // Auto-rotate every 4 seconds
    setInterval(() => goToSlide(currentSlide + 1), 4000);

    // Init first slide active
    goToSlide(0);
})();


// ===== 2. FLASH SALE SECTION =====
// Danh sách sản phẩm flash sale (ID, % giảm)
const FLASH_SALE_IDS = [
    { id: 1,  discount: 20 },
    { id: 2,  discount: 15 },
    { id: 5,  discount: 25 },
    { id: 6,  discount: 18 },
    { id: 13, discount: 22 },
    { id: 15, discount: 30 },
];

function initFlashSale() {
    // Countdown: hết lúc 23:59:59 hôm nay
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    function updateCountdown() {
        const diff = endOfDay - new Date();
        if (diff <= 0) {
            document.getElementById('cdH').innerText = '00';
            document.getElementById('cdM').innerText = '00';
            document.getElementById('cdS').innerText = '00';
            return;
        }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const pad = n => String(n).padStart(2, '0');
        const cdH = document.getElementById('cdH');
        const cdM = document.getElementById('cdM');
        const cdS = document.getElementById('cdS');
        if (cdH) cdH.innerText = pad(h);
        if (cdM) cdM.innerText = pad(m);
        if (cdS) cdS.innerText = pad(s);
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Populate flash products after allProducts loaded
    function populateFlashProducts() {
        const row = document.getElementById('flashProductsRow');
        if (!row) return;
        if (!window.allProducts || window.allProducts.length === 0) {
            setTimeout(populateFlashProducts, 800);
            return;
        }

        const flashItems = FLASH_SALE_IDS.map(fi => {
            const p = window.allProducts.find(x => x.id === fi.id);
            if (!p) return null;
            return { ...p, discount: fi.discount };
        }).filter(Boolean);

        if (flashItems.length === 0) {
            setTimeout(populateFlashProducts, 800);
            return;
        }

        row.innerHTML = flashItems.map(p => {
            const originalPrice = Math.round(p.price * (100 / (100 - p.discount)));
            const isUrl = p.image && (p.image.startsWith('http') || p.image.startsWith('/'));
            const imgHtml = isUrl
                ? `<img src="${p.image}" alt="${p.name}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;" onerror="this.onerror=null;this.parentElement.innerHTML='🛒';">`
                : `<span style="font-size:3rem;">${p.image || '🛒'}</span>`;
            
            // Fake sold percentage (40–75%)
            const soldPct = 40 + Math.floor(Math.random() * 36);

            return `
            <div class="flash-product-card" onclick="addToCart(${p.id})">
                <div class="flash-discount-badge">-${p.discount}%</div>
                <div style="text-align:center;margin-bottom:6px;">${imgHtml}</div>
                <div class="flash-prod-name">${p.name}</div>
                <div class="flash-prod-price">${formatMoney(p.price)}</div>
                <div class="flash-prod-orig">${formatMoney(originalPrice)}</div>
                <div class="flash-sold-bar">
                    <div class="flash-sold-fill" style="width:${soldPct}%"></div>
                    <span class="flash-sold-label">Đã bán ${soldPct}%</span>
                </div>
                <button class="btn btn-danger btn-sm w-100 mt-1" style="font-size:0.75rem;">
                    <i class="bi bi-cart-plus me-1"></i> Mua ngay
                </button>
            </div>`;
        }).join('');
    }

    populateFlashProducts();

    // Show flash sale section
    const section = document.getElementById('flashSaleSection');
    if (section) section.style.display = 'block';
}

// Init flash sale after DOM ready
document.addEventListener('DOMContentLoaded', initFlashSale);


// ===== 3. DISCOUNT BADGES ON PRODUCT CARDS (patch renderProducts) =====
const FLASH_DISCOUNT_MAP = {};
FLASH_SALE_IDS.forEach(fi => { FLASH_DISCOUNT_MAP[fi.id] = fi.discount; });

// Hook vào renderProducts gốc để thêm badge giảm giá
const _origRenderProducts = window.renderProducts;
document.addEventListener('DOMContentLoaded', () => {
    // Patch sau khi app.js load xong
    setTimeout(() => {
        if (typeof window.renderProducts === 'function') {
            const original = window.renderProducts;
            window.renderProducts = function(products) {
                original(products);
                // Thêm badge giảm giá lên các card flash sale
                products.forEach(p => {
                    if (FLASH_DISCOUNT_MAP[p.id]) {
                        const cards = document.querySelectorAll(`#productList .product-image-container`);
                        // Tìm card theo onclick
                        cards.forEach(container => {
                            if (container.getAttribute('onclick') && container.getAttribute('onclick').includes(`openProductDetailModal(${p.id})`)) {
                                if (!container.querySelector('.product-discount-badge')) {
                                    const badge = document.createElement('div');
                                    badge.className = 'product-discount-badge';
                                    badge.innerText = `-${FLASH_DISCOUNT_MAP[p.id]}%`;
                                    container.appendChild(badge);
                                }
                            }
                        });
                    }
                });
            };
        }
    }, 500);
});


// ===== 4. SOCIAL PROOF POPUP =====
(function initSocialProof() {
    const buyers = [
        'Minh Tuấn', 'Thu Hà', 'Thanh Lan', 'Quốc Bảo', 'Ngọc Linh',
        'Hải Đăng', 'Kim Ngân', 'Trọng Nghĩa', 'Phương Uyên', 'Tiến Dũng',
        'Ánh Nguyệt', 'Văn Khoa', 'Bích Thảo', 'Đức Minh', 'Hồng Nhung'
    ];
    const products = [
        'Mì Hảo Hảo', 'Nước mắm Chin-su', 'Coca Cola 330ml', 'Dầu ăn Neptune',
        'Bánh Oreo', 'Sữa Vinamilk', 'Nước suối Lavie', 'Mì Kokomi',
        'Snack Oishi', 'Xúc xích Đức Việt', 'Muối iốt', 'Đường kính', 'Cá hộp'
    ];

    // Inject popup HTML
    const popup = document.createElement('div');
    popup.id = 'social-proof-popup';
    popup.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;">
            <div style="font-size:1.8rem;">🛍️</div>
            <div>
                <div id="sp-name" style="font-weight:700;color:#198754;font-size:0.9rem;"></div>
                <div id="sp-action" style="font-size:0.82rem;color:#333;"></div>
                <div id="sp-time" style="font-size:0.75rem;color:#888;margin-top:2px;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    function showSocialProof() {
        const name = buyers[Math.floor(Math.random() * buyers.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        const mins = Math.floor(Math.random() * 15) + 1;

        document.getElementById('sp-name').innerText = `Khách: ${name}`;
        document.getElementById('sp-action').innerText = `vừa mua "${product}"`;
        document.getElementById('sp-time').innerText = `${mins} phút trước · Tại tiệm online`;

        popup.classList.add('show');
        setTimeout(() => popup.classList.remove('show'), 4500);
    }

    // Hiện lần đầu sau 6 giây, sau đó mỗi 18-28 giây
    setTimeout(() => {
        showSocialProof();
        setInterval(() => {
            showSocialProof();
        }, 18000 + Math.random() * 10000);
    }, 6000);
})();


// ===== 5. FLOATING CONTACT BUTTONS (Zalo + Phone + Scroll Top) =====
(function initFloatingButtons() {
    const floatHtml = `
    <div class="floating-contacts" id="floatingContacts">
        <a href="https://zalo.me/0900000001" target="_blank" class="float-btn float-zalo" title="Chat Zalo với chủ tiệm">
            <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#0068FF"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="Arial">Z</text></svg>
        </a>
        <a href="tel:0900000001" class="float-btn float-phone" title="Gọi điện đặt hàng">
            <i class="bi bi-telephone-fill"></i>
        </a>
        <button onclick="window.scrollTo({top:0,behavior:'smooth'})" class="float-btn float-top" id="scrollTopBtn" title="Lên đầu trang" style="display:none;">
            <i class="bi bi-chevron-up"></i>
        </button>
    </div>`;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = floatHtml;
    document.body.appendChild(wrapper.firstElementChild);

    // Show/hide scroll-to-top based on scroll position
    window.addEventListener('scroll', () => {
        const btn = document.getElementById('scrollTopBtn');
        if (btn) btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    });
})();


// ===== 6. QUICK CATEGORY FILTER (from quick-cat icons) =====
// filterByCategory already handles null btnElement, but expose global helper
window.filterByCategoryQuick = function(catId) {
    window.currentCategoryId = catId;
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    const kw = document.getElementById('searchInput') ? document.getElementById('searchInput').value : '';
    if (typeof window.loadProducts === 'function') {
        window.loadProducts(kw, catId);
    }
    // Scroll to product section
    const section = document.getElementById('productList');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
