/* ==========================================================================
   FRAME IT NAIJA - INTERACTIVE JAVASCRIPT (script.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. DATA MODELS & STATE MANAGEMENT
    // ----------------------------------------------------------------------
    const productsData = [
        {
            id: 'f1',
            title: 'Mahogany Classic Frame',
            category: 'classic',
            price: 25000,
            image: 'images/frame-it-01.jpeg',
            description: 'Rich dark mahogany wood with a classic profile. Perfect for diplomas and traditional portraits.',
            badge: 'Best Seller'
        },
        {
            id: 'f2',
            title: 'Nordic Light Oak',
            category: 'minimalist',
            price: 22000,
            image: 'images/frame-it-02.jpeg',
            description: 'Clean Scandinavian aesthetic crafted from natural light oak. Great for modern minimalist interiors.',
            badge: 'Popular'
        },
        {
            id: 'f3',
            title: 'Royal Gold Leaf Float Frame',
            category: 'luxury',
            price: 45000,
            image: 'images/frame-it-03.jpeg',
            description: 'Hand-finished gold leaf detail with float effect. Ideal for fine art prints and oil paintings.',
            badge: 'Luxury'
        },
        {
            id: 'f4',
            title: 'Matte Black Gallery Box',
            category: 'modern',
            price: 18000,
            image: 'images/frame-it-04.jpeg',
            description: 'Deep box frame with matte black coating. Adds dramatic depth to photography and line art.',
            badge: 'New'
        },
        {
            id: 'f5',
            title: 'Ornate Baroque Gold',
            category: 'luxury',
            price: 55000,
            image: 'images/frame-it-05.jpeg',
            description: 'Intricately carved vintage-style baroque frame in brushed gold tones.',
            badge: 'Exquisite'
        },
        {
            id: 'f6',
            title: 'Walnut Shadow Box',
            category: 'classic',
            price: 30000,
            image: 'images/frame-it-06.jpeg',
            description: 'Deep walnut wood construction designed for 3D objects, jerseys, and cherished memorabilia.',
            badge: 'Custom'
        }
    ];

    let cart = JSON.parse(localStorage.getItem('frameItNaijaCart')) || [];
    let wishlist = JSON.parse(localStorage.getItem('frameItNaijaWishlist')) || [];

    // ----------------------------------------------------------------------
    // 2. DOM ELEMENTS
    // ----------------------------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle');
    const scrollProgressBar = document.getElementById('scroll-progress-bar');
    const loadingScreen = document.getElementById('loading-screen');
    const productGrid = document.getElementById('product-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    
    // Cart Elements
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartCountBadge = document.getElementById('cart-count');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartTotalEl = document.getElementById('cart-total');
    const whatsappCheckoutBtn = document.getElementById('whatsapp-checkout-btn');
    
    // Estimator Elements
    const estimatorWidth = document.getElementById('calc-width');
    const estimatorHeight = document.getElementById('calc-height');
    const estimatorMaterial = document.getElementById('calc-material');
    const estimatorGlass = document.getElementById('calc-glass');
    const estimatorMatted = document.getElementById('calc-matted');
    const calculatedPriceEl = document.getElementById('calculated-price');
    
    // Quick View Modal
    const quickviewModal = document.getElementById('quickview-modal');
    const quickviewBody = document.getElementById('quickview-body');
    const closeQuickviewBtn = document.getElementById('close-quickview-btn');

    // ----------------------------------------------------------------------
    // 3. INITIALIZATION & INITIAL RENDER
    // ----------------------------------------------------------------------
    // Hide Loading Screen
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.visibility = 'hidden';
        }, 600);
    }

    // Initialize Theme State
    const savedTheme = localStorage.getItem('frameItNaijaTheme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Initial Dynamic Renders
    renderProducts(productsData);
    updateCartUI();
    calculateFrameEstimate();

    // ----------------------------------------------------------------------
    // 4. THEME TOGGLE & SCROLL INDICATOR
    // ----------------------------------------------------------------------
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('frameItNaijaTheme', newTheme);
            updateThemeIcon(newTheme);
            showToast(`Switched to ${newTheme} mode`);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeToggleBtn) return;
        const icon = themeToggleBtn.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        if (scrollProgressBar) {
            scrollProgressBar.style.width = `${scrollPercent}%`;
        }

        // Back to top button visibility
        const backToTopBtn = document.getElementById('back-to-top');
        if (backToTopBtn) {
            if (scrollTop > 400) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    });

    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ----------------------------------------------------------------------
    // 5. PRODUCT CATALOG & FILTERS
    // ----------------------------------------------------------------------
    function renderProducts(products) {
        if (!productGrid) return;

        if (products.length === 0) {
            productGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px 0; color: var(--text-muted);">
                    <i class="fas fa-search" style="font-size: 2.5rem; margin-bottom: 16px;"></i>
                    <p>No frames match your selected filters.</p>
                </div>
            `;
            return;
        }

        productGrid.innerHTML = products.map(product => {
            const isWishlisted = wishlist.includes(product.id);
            return `
                <article class="product-card" data-id="${product.id}">
                    <div class="product-image-box">
                        <span class="product-badge">${product.badge}</span>
                        <button class="wishlist-toggle-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}" title="Save to wishlist">
                            <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                        <img src="${product.image}" alt="${product.title}" loading="lazy">
                        <button class="btn btn-secondary btn-outline-sm quickview-trigger" data-id="${product.id}">
                            Quick View
                        </button>
                    </div>
                    <div class="product-details">
                        <h3 class="product-title">${product.title}</h3>
                        <p class="product-meta">${capitalize(product.category)} Collection</p>
                        <div class="product-bottom">
                            <span class="product-price">₦${product.price.toLocaleString()}</span>
                            <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        attachProductEventListeners();
    }

    function filterAndSortProducts() {
        let result = [...productsData];

        // Active Category
        const activeCategoryBtn = document.querySelector('.filter-btn.active');
        const activeCategory = activeCategoryBtn ? activeCategoryBtn.dataset.filter : 'all';

        if (activeCategory !== 'all') {
            result = result.filter(p => p.category === activeCategory);
        }

        // Search Query
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (query) {
            result = result.filter(p => 
                p.title.toLowerCase().includes(query) || 
                p.description.toLowerCase().includes(query)
            );
        }

        // Sorting
        const sortValue = sortSelect ? sortSelect.value : 'default';
        if (sortValue === 'price-low') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortValue === 'price-high') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortValue === 'name') {
            result.sort((a, b) => a.title.localeCompare(b.title));
        }

        renderProducts(result);
    }

    // Filter Button Click Listener
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterAndSortProducts();
        });
    });

    if (searchInput) searchInput.addEventListener('input', filterAndSortProducts);
    if (sortSelect) sortSelect.addEventListener('change', filterAndSortProducts);

    // ----------------------------------------------------------------------
    // 6. EVENT ATTACHMENTS (CART, WISHLIST, QUICK VIEW)
    // ----------------------------------------------------------------------
    function attachProductEventListeners() {
        // Add to Cart Buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-id');
                addToCart(productId);
            });
        });

        // Wishlist Buttons
        document.querySelectorAll('.wishlist-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = btn.getAttribute('data-id');
                toggleWishlist(productId, btn);
            });
        });

        // Quick View Buttons
        document.querySelectorAll('.quickview-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = btn.getAttribute('data-id');
                openQuickView(productId);
            });
        });
    }

    function toggleWishlist(id, btnElement) {
        if (wishlist.includes(id)) {
            wishlist = wishlist.filter(item => item !== id);
            btnElement.classList.remove('active');
            btnElement.querySelector('i').className = 'far fa-heart';
            showToast('Removed from Wishlist');
        } else {
            wishlist.push(id);
            btnElement.classList.add('active');
            btnElement.querySelector('i').className = 'fas fa-heart';
            showToast('Added to Wishlist');
        }
        localStorage.setItem('frameItNaijaWishlist', JSON.stringify(wishlist));
    }

    // ----------------------------------------------------------------------
    // 7. CART SYSTEM & WHATSAPP CHECKOUT
    // ----------------------------------------------------------------------
    function addToCart(productId) {
        const product = productsData.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        saveCart();
        updateCartUI();
        openCartDrawer();
        showToast(`${product.title} added to cart`);
    }

    function updateCartUI() {
        const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
        if (cartCountBadge) cartCountBadge.textContent = totalCount;

        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
                    <i class="fas fa-shopping-bag" style="font-size: 3rem; margin-bottom: 16px;"></i>
                    <p>Your cart is currently empty.</p>
                </div>
            `;
            if (cartSubtotalEl) cartSubtotalEl.textContent = '₦0';
            if (cartTotalEl) cartTotalEl.textContent = '₦0';
            return;
        }

        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item" style="display: flex; gap: 16px; margin-bottom: 20px; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                <img src="${item.image}" alt="${item.title}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px;">
                <div style="flex-grow: 1;">
                    <h4 style="font-size: 0.95rem; font-family: var(--font-body);">${item.title}</h4>
                    <p style="font-size: 0.85rem; color: var(--accent-gold); font-weight: 700;">₦${(item.price * item.quantity).toLocaleString()}</p>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 6px;">
                        <button class="cart-qty-btn" onclick="changeQty('${item.id}', -1)" style="border: 1px solid var(--border-color); background: none; width: 24px; height: 24px; border-radius: 4px; cursor: pointer;">-</button>
                        <span style="font-size: 0.85rem; font-weight: 600;">${item.quantity}</span>
                        <button class="cart-qty-btn" onclick="changeQty('${item.id}', 1)" style="border: 1px solid var(--border-color); background: none; width: 24px; height: 24px; border-radius: 4px; cursor: pointer;">+</button>
                    </div>
                </div>
                <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer;" title="Remove Item">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `).join('');

        if (cartSubtotalEl) cartSubtotalEl.textContent = `₦${subtotal.toLocaleString()}`;
        if (cartTotalEl) cartTotalEl.textContent = `₦${subtotal.toLocaleString()}`;
    }

    window.changeQty = function(id, delta) {
        const item = cart.find(i => i.id === id);
        if (!item) return;
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
        saveCart();
        updateCartUI();
    };

    window.removeFromCart = function(id) {
        cart = cart.filter(i => i.id !== id);
        saveCart();
        updateCartUI();
        showToast('Item removed from cart');
    };

    function saveCart() {
        localStorage.setItem('frameItNaijaCart', JSON.stringify(cart));
    }

    // Drawer Toggle Listeners
    if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCartDrawer);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeCartDrawer);

    function openCartDrawer() {
        if (cartDrawer) cartDrawer.classList.add('open');
        if (drawerOverlay) drawerOverlay.classList.add('active');
    }

    function closeCartDrawer() {
        if (cartDrawer) cartDrawer.classList.remove('open');
        if (drawerOverlay) drawerOverlay.classList.remove('active');
    }

    // WhatsApp Checkout Integration
    if (whatsappCheckoutBtn) {
        whatsappCheckoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Your cart is empty!');
                return;
            }

            let message = `*NEW FRAME ORDER - FRAME IT NAIJA*\n\n`;
            let total = 0;

            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                message += `${index + 1}. *${item.title}*\n   Qty: ${item.quantity} x ₦${item.price.toLocaleString()} = ₦${itemTotal.toLocaleString()}\n`;
            });

            message += `\n*Total Amount:* ₦${total.toLocaleString()}\n`;
            message += `\nHello! I would like to confirm and place this order. Please send payment details and delivery timeframe.`;

            const phoneNumber = '2348000000000'; // Replace with business WhatsApp number
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
        });
    }

    // ----------------------------------------------------------------------
    // 8. REAL-TIME CUSTOM FRAME ESTIMATOR CALCULATOR
    // ----------------------------------------------------------------------
    function calculateFrameEstimate() {
        if (!estimatorWidth || !estimatorHeight || !estimatorMaterial || !calculatedPriceEl) return;

        const w = parseFloat(estimatorWidth.value) || 0;
        const h = parseFloat(estimatorHeight.value) || 0;
        
        if (w <= 0 || h <= 0) {
            calculatedPriceEl.textContent = '₦0';
            return;
        }

        const areaSqInches = w * h;
        const perimeterInches = 2 * (w + h);

        const materialMultiplier = parseFloat(estimatorMaterial.value) || 50;
        const glassCost = parseFloat(estimatorGlass.value) || 3000;
        const mattingCost = (estimatorMatted && estimatorMatted.checked) ? 2500 : 0;
        const baseLaborFee = 5000;

        const calculatedPrice = (perimeterInches * materialMultiplier) + (areaSqInches * 5) + glassCost + mattingCost + baseLaborFee;

        // Round to nearest hundred
        const finalPrice = Math.ceil(calculatedPrice / 100) * 100;
        calculatedPriceEl.textContent = `₦${finalPrice.toLocaleString()}`;
    }

    const estimatorInputs = [estimatorWidth, estimatorHeight, estimatorMaterial, estimatorGlass, estimatorMatted];
    estimatorInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', calculateFrameEstimate);
            input.addEventListener('change', calculateFrameEstimate);
        }
    });

    // ----------------------------------------------------------------------
    // 9. QUICK VIEW MODAL SYSTEM
    // ----------------------------------------------------------------------
    function openQuickView(productId) {
        const product = productsData.find(p => p.id === productId);
        if (!product || !quickviewModal || !quickviewBody) return;

        quickviewBody.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center;">
                <div>
                    <img src="${product.image}" alt="${product.title}" style="width: 100%; border-radius: 12px; object-fit: cover; max-height: 380px;">
                </div>
                <div>
                    <span class="section-badge">${product.badge}</span>
                    <h2 style="font-size: 2rem; margin: 12px 0 8px;">${product.title}</h2>
                    <p style="color: var(--accent-gold); font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">₦${product.price.toLocaleString()}</p>
                    <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 0.95rem;">${product.description}</p>
                    <button class="btn btn-primary btn-block" onclick="addToCartFromModal('${product.id}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;

        quickviewModal.classList.remove('hidden');
    }

    window.addToCartFromModal = function(id) {
        addToCart(id);
        closeQuickview();
    };

    if (closeQuickviewBtn) closeQuickviewBtn.addEventListener('click', closeQuickview);
    if (quickviewModal) {
        quickviewModal.addEventListener('click', (e) => {
            if (e.target === quickviewModal) closeQuickview();
        });
    }

    function closeQuickview() {
        if (quickviewModal) quickviewModal.classList.add('hidden');
    }

    // ----------------------------------------------------------------------
    // 10. DRAG AND DROP IMAGE PREVIEW UPLOAD
    // ----------------------------------------------------------------------
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadPreviewContainer = document.getElementById('upload-preview-container');

    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
            }, false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        });

        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });
    }

    function handleFiles(files) {
        if (!files || !files[0]) return;
        const file = files[0];

        if (!file.type.startsWith('image/')) {
            showToast('Please upload an image file (PNG, JPG, WEBP)');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            if (uploadPreviewContainer) {
                uploadPreviewContainer.innerHTML = `
                    <div style="margin-top: 24px; text-align: center;">
                        <p style="font-weight: 600; margin-bottom: 12px;">Your Upload Preview:</p>
                        <div style="display: inline-block; padding: 16px; background: #fff; border: 12px solid #1a1a1a; box-shadow: var(--shadow-lg); border-radius: 4px;">
                            <img src="${e.target.result}" alt="Uploaded artwork" style="max-height: 250px; display: block; margin: 0 auto;">
                        </div>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 12px;">Image ready! Our frame artisan will contact you to confirm framing specs.</p>
                    </div>
                `;
            }
            showToast('Image uploaded successfully!');
        };
        reader.readAsDataURL(file);
    }

    // ----------------------------------------------------------------------
    // 11. TOAST NOTIFICATION UTILITY
    // ----------------------------------------------------------------------
    function showToast(message) {
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas fa-check-circle" style="color: var(--accent-gold);"></i> <span>${message}</span>`;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // Utility Helper
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
});

/* =====================================================
CUSTOM FRAME BUILDER ENGINE
===================================================== */


const FrameBuilder = {


    basePrice:45000,


    settings:{


        style:"Classic Wooden",

        material:"Premium Wood",

        glass:"Normal Glass",

        size:1,

        color:"Black"


    },





    prices:{


        styles:{


            "Classic Wooden":45000,

            "Modern Black":55000,

            "Luxury Gold":75000,

            "Acrylic Glass":85000


        },



        materials:{


            "Premium Wood":0,

            "Metal":15000,

            "Acrylic":25000


        },



        glass:{


            "Normal Glass":0,

            "Anti Reflection Glass":10000,

            "Museum Glass":25000


        },


        sizes:{


            1:0,

            1.5:20000,

            2:40000,

            3:80000


        }



    }




};









/* =====================================================
FRAME BUILDER ELEMENTS
===================================================== */


const imageUpload =
document.getElementById(
"imageUpload"
);



const previewImage =
document.getElementById(
"previewImage"
);







/* =====================================================
IMAGE UPLOAD PREVIEW
===================================================== */


if(imageUpload){


imageUpload.addEventListener(
"change",
function(event){



const file =
event.target.files[0];



if(!file){

return;

}




if(!file.type.startsWith("image")){


showMessage(
"Please upload a valid image file"
);


return;


}




const imageURL =
URL.createObjectURL(file);



previewImage.src =
imageURL;




showMessage(
"Image uploaded successfully"
);



});


}









/* =====================================================
FRAME STYLE SELECTION
===================================================== */


const frameStyle =
document.getElementById(
"frameStyle"
);



if(frameStyle){


frameStyle.addEventListener(
"change",
function(){



FrameBuilder.settings.style =
this.value;



updateFramePrice();



applyFrameStyle();



});


}









/* =====================================================
FRAME SIZE SELECTION
===================================================== */


const frameSize =
document.getElementById(
"frameSize"
);



if(frameSize){


frameSize.addEventListener(
"change",
function(){


FrameBuilder.settings.size =
this.value;



updateFramePrice();


});


}









/* =====================================================
ALL BUILDER SELECT INPUTS
===================================================== */


const builderSelects =
document.querySelectorAll(
".builder-options select"
);



builderSelects.forEach(
(select,index)=>{


select.addEventListener(
"change",
function(){



if(index===0){

FrameBuilder.settings.style =
this.value;

}



if(index===1){

FrameBuilder.settings.color =
this.value;

}



if(index===2){

FrameBuilder.settings.material =
this.value;

}



if(index===3){

FrameBuilder.settings.glass =
this.value;

}



updateFramePrice();


applyFrameStyle();



});


});









/* =====================================================
PRICE CALCULATION
===================================================== */


function updateFramePrice(){


let total =


FrameBuilder.prices.styles[

FrameBuilder.settings.style

]



+

FrameBuilder.prices.materials[

FrameBuilder.settings.material

]



+

FrameBuilder.prices.glass[

FrameBuilder.settings.glass

]



+

FrameBuilder.prices.sizes[

FrameBuilder.settings.size

];





const priceElement =
document.getElementById(
"framePrice"
);



if(priceElement){


priceElement.innerHTML =
formatMoney(total);



}




FrameBuilder.currentPrice =
total;



}









/* =====================================================
DYNAMIC FRAME APPEARANCE
===================================================== */


function applyFrameStyle(){



const frame =
document.querySelector(
".preview-frame"
);



if(!frame){

return;

}





switch(
FrameBuilder.settings.color
){


case "Black":

frame.style.border =
"20px solid #000";

break;



case "White":

frame.style.border =
"20px solid white";

break;



case "Gold":

frame.style.border =
"20px solid #c9a227";

break;



case "Natural Wood":

frame.style.border =
"20px solid #8b5a2b";

break;



}



}









/* =====================================================
ADD CUSTOM FRAME TO CART
===================================================== */


const customFrameButton =
document.querySelector(
".builder-options .primary-btn"
);



if(customFrameButton){


customFrameButton.addEventListener(
"click",
()=>{


const item = {


id:
Date.now(),


name:
"Custom Designed Frame",


price:
FrameBuilder.currentPrice || FrameBuilder.basePrice,


options:
FrameBuilder.settings,


image:
previewImage?.src || ""


};




Cart.add(item);



showMessage(
"Custom frame added to cart"
);



});


}









/* =====================================================
FRAME BUILDER RESET
===================================================== */


function resetFrameBuilder(){


FrameBuilder.settings = {


style:"Classic Wooden",

material:"Premium Wood",

glass:"Normal Glass",

size:1,

color:"Black"


};



updateFramePrice();


}

/* =====================================================
SHOPPING CART SYSTEM
===================================================== */


const Cart = {



items:getData(
FrameItApp.storageKeys.cart
),






add(item){



this.items.push(item);



this.save();



updateCartCount();



},







remove(id){



this.items =

this.items.filter(
item=>item.id !== id
);



this.save();



updateCartCount();


},







clear(){


this.items=[];


this.save();


},






save(){


saveData(

FrameItApp.storageKeys.cart,

this.items

);


},







total(){


return this.items.reduce(

(sum,item)=>sum + item.price,

0

);


},







count(){


return this.items.length;


}



};









/* =====================================================
UPDATE CART COUNTER
===================================================== */


function updateCartCount(){


const cartButtons =
document.querySelectorAll(
".nav-actions button"
);



if(cartButtons.length){



cartButtons.forEach(
(button,index)=>{


if(index===1){


button.innerHTML =

"🛒 " +

Cart.count();



}



});


}



}





updateCartCount();









/* =====================================================
PRODUCT ADD TO CART
===================================================== */


const addButtons =
document.querySelectorAll(
".product-details button"
);





addButtons.forEach(
(button,index)=>{


button.addEventListener(
"click",
()=>{



const cards =
document.querySelectorAll(
".product-card"
);



const card =
cards[index];



const name =
card.querySelector(
"h3"
).innerText;



const priceText =
card.querySelector(
"strong"
).innerText;



const price =

Number(

priceText

.replace(

/[^0-9]/g,

""

)

);



const image =
card.querySelector(
"img"
).src;





const product={


id:

Date.now(),


name:name,


price:price,


image:image,


quantity:1


};





Cart.add(product);



showMessage(
name +
" added to cart"
);



});


});









/* =====================================================
WISHLIST SYSTEM
===================================================== */


const Wishlist = {


items:getData(
FrameItApp.storageKeys.wishlist
),





add(product){


this.items.push(product);



saveData(

FrameItApp.storageKeys.wishlist,

this.items

);



},





remove(id){



this.items =

this.items.filter(

item=>item.id!==id

);



saveData(

FrameItApp.storageKeys.wishlist,

this.items

);



}



};









/* =====================================================
WISHLIST BUTTONS
===================================================== */


const wishlistButtons =
document.querySelectorAll(
".wishlist"
);



wishlistButtons.forEach(
button=>{


button.addEventListener(
"click",
()=>{


showMessage(
"Added to wishlist"
);


});


});









/* =====================================================
CART DISPLAY RENDERER
===================================================== */


function renderCart(){


const cartContainer =
document.querySelector(
".cart-items"
);



if(!cartContainer){

return;

}




cartContainer.innerHTML="";





if(Cart.items.length===0){


cartContainer.innerHTML =

`

<h3>
Your cart is empty
</h3>

`;

return;


}






Cart.items.forEach(
item=>{



cartContainer.innerHTML +=


`

<div class="cart-item">


<img src="${item.image}">



<div>

<h3>

${item.name}

</h3>


<strong>

${formatMoney(item.price)}

</strong>


</div>



<button

onclick="Cart.remove(${item.id});renderCart()">

Remove

</button>


</div>


`;



});





const totalElement =
document.querySelector(
".total strong"
);



if(totalElement){


totalElement.innerHTML =

formatMoney(
Cart.total()
);



}



}







renderCart();









/* =====================================================
CHECKOUT VALIDATION
===================================================== */


const checkoutForm =
document.querySelector(
".checkout-form"
);



if(checkoutForm){


checkoutForm.addEventListener(
"submit",
function(event){


event.preventDefault();



const inputs =
this.querySelectorAll(
"input, textarea"
);



let valid=true;



inputs.forEach(
input=>{


if(!input.value.trim()){


valid=false;


}


});





if(!valid){


showMessage(
"Please complete all fields"
);


return;


}




showMessage(
"Order successfully created"
);



Cart.clear();



renderCart();



});


}









/* =====================================================
ORDER TRACKING
===================================================== */


const trackButton =
document.querySelector(
".tracking-box button"
);



if(trackButton){


trackButton.addEventListener(
"click",
()=>{


const input =
document.querySelector(
".tracking-box input"
);



if(input.value.trim()===""){


showMessage(
"Enter your order number"
);


return;


}





showMessage(

"Order found: Your frame is currently being processed"

);



});


}









/* =====================================================
PRODUCT SEARCH FOUNDATION
===================================================== */


function searchProducts(keyword){


const products =
document.querySelectorAll(
".product-card"
);



products.forEach(
product=>{


const text =
product.innerText.toLowerCase();



if(
text.includes(
keyword.toLowerCase()
)

){


product.style.display="block";


}

else{


product.style.display="none";


}



});



}









/* =====================================================
CATEGORY FILTER FOUNDATION
===================================================== */


function filterProducts(category){


const products =
document.querySelectorAll(
".product-card"
);



products.forEach(
product=>{


if(category==="all"){


product.style.display="block";


return;


}





const title =
product.querySelector(
"h3"
)
.innerText
.toLowerCase();





product.style.display =

title.includes(
category.toLowerCase()
)

?

"block"

:

"none";



});


}