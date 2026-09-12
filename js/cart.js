// ==========================================================
//  COȘ DE CUMPĂRĂTURI – Butași Premium MD
//  Adaugă: stoc pe soi, cantitate, coș persistent (localStorage),
//  pagină de coș + plasare comandă (WhatsApp / copiere)
// ==========================================================
(function () {
    'use strict';

    var CART_KEY = 'butasi_cart';
    var WHATSAPP_ORDER_NUMBER = '37369705404'; // numărul pe care se trimit comenzile

    // ---------- Stoc disponibil (număr de butași) pentru fiecare soi ----------
    var STOCK = {
        // Butași de masă
        'Muscat Italia': 250,
        'Muscat Iantarnâi': 180,
        'Monarh': 220,
        'Super Extra': 160,
        'Priobrajenie': 200,
        'Padaroc Nesfetaia': 140,
        'Arcadia': 190,
        'Lora': 170,
        'Baicanur': 130,
        'Atos': 150,
        'Nizina': 120,
        'Muscat de Hamburg': 210,
        'Roșfor': 160,
        'Cardinal': 140,
        'Aniuta': 110,
        'Avatar': 45,
        'Lamborghini': 30,
        'Ratatui': 25,
        'Muscat Liubimâi': 40,
        'Chiș-Miș Lucistâi': 90,
        'Chiș-Miș Mecita': 85,
        'Chiș-Miș Jupiter': 75,
        'Chiș-Miș Ararat': 35,
        'Chiș-Miș Țâmus': 28,
        'Zavetnâi': 130,
        'Velica': 100,
        'Sponsor': 95,
        'Pameati Ucitelea': 105,
        'Red-Glob': 115,
        'Odeschii Suvenir': 90,
        'Moldova': 0,
        'Leondor Negru': 300,
        'Crasca Agurdino': 260,
        'Feteasca Neagră': 350,
        'Izabela / Căpșună': 320,
        'Cabernet Sauvignon': 400,
        'Merlot': 380,
        'Saperave': 240,
        'Fetească Regală': 340,
        'Muscat Ottonel': 310,
        'Muscat Poloskei': 230,
        'Cudercă': 260,
        'Floricică': 260,
        'Aligote': 300,
        'Fragă Albă': 220,
        'Riesling': 270,
        'Rkatsiteli': 330,
        'Viorica': 290,
        'Sovinion': 250,
        'Alb de Suruceni': 240
    };

    // ==================================================
    //  MEMORARE COȘ (localStorage)
    // ==================================================
    function getCart() {
        try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
        catch (e) { return {}; }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateBadges();
        if (document.getElementById('cartItems')) renderCartPage();
    }

    function cartCount() {
        var cart = getCart(), n = 0;
        Object.keys(cart).forEach(function (k) { n += cart[k].qty; });
        return n;
    }

    function cartTotal() {
        var cart = getCart(), t = 0;
        Object.keys(cart).forEach(function (k) { t += cart[k].qty * cart[k].price; });
        return t;
    }

    // ==================================================
    //  BADGE COȘ (iconița din meniu + buton plutitor)
    // ==================================================
    function updateBadges() {
        var n = cartCount();
        document.querySelectorAll('[data-cart-badge]').forEach(function (b) {
            b.textContent = n;
            b.classList.toggle('hidden', n === 0);
        });
    }

    // ==================================================
    //  NOTIFICARE (toast)
    // ==================================================
    var toastTimer;
    function showToast(msg, isError) {
        var t = document.getElementById('cartToast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'cartToast';
            t.className = 'toast';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.classList.toggle('error', !!isError);
        t.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
    }

    // ==================================================
    //  ADĂUGARE ÎN COȘ
    // ==================================================
    function addToCart(item, qty) {
        var cart = getCart();
        if (cart[item.id]) {
            var newQty = cart[item.id].qty + qty;
            if (newQty > item.stock) {
                newQty = item.stock;
                showToast('Doar ' + item.stock + ' buc. în stoc pentru „' + item.name + '”', true);
            } else {
                showToast('„' + item.name + '” adăugat în coș (' + newQty + ' buc.)');
            }
            cart[item.id].qty = newQty;
        } else {
            cart[item.id] = {
                id: item.id, name: item.name, price: item.price,
                img: item.img, stock: item.stock,
                qty: Math.min(qty, item.stock)
            };
            showToast('„' + item.name + '” adăugat în coș');
        }
        saveCart(cart);
    }

    // ==================================================
    //  TRANSFORMARE CARDURI PRODUS (butasi-masa / butasi-vin)
    //  - adaugă „În stoc: X buc”
    //  - adaugă selector cantitate + buton „Adaugă în coș”
    // ==================================================
   function enhanceProductCards() {
    var cards = document.querySelectorAll('.product-card');
    if (!cards.length) return;

    cards.forEach(function (card) {
        var titleEl = card.querySelector('.product-title');
        if (!titleEl || card.dataset.cartReady) return;
        card.dataset.cartReady = '1';

        var name  = titleEl.textContent.trim();
        var stock = (name in STOCK) ? STOCK[name] : 100;

        var priceEl = card.querySelector('.product-price');
        var price = parseInt(priceEl ? priceEl.textContent : '0', 10) || 0;

        var imgEl = card.querySelector('.product-img-wrapper img');
        var img = imgEl ? imgEl.getAttribute('src') : '';

        // ---- Verifică dacă produsul e marcat ca indisponibil ----
        var isAvailable = card.dataset.available !== 'false' && stock > 0;

        // ---- Informație stoc sub preț ----
        var stockEl = document.createElement('div');
        stockEl.className = 'stock-info ' + (isAvailable ? 'in-stock' : 'out-stock');
        stockEl.textContent = isAvailable ? ('În stoc: ' + stock + ' buc') : 'Stoc epuizat';
        priceEl.parentNode.insertBefore(stockEl, priceEl.nextSibling);

        // ---- Acțiuni ----
        var actions = card.querySelector('.product-actions');
        if (!actions) return;

        if (!isAvailable) {
            // Produs indisponibil - fără buton de coș
            actions.innerHTML =
                '<button type="button" class="btn btn-outline btn-sm" disabled>' +
                '<i class="fas fa-clock"></i> Indisponibil</button>';
            
            var badge = card.querySelector('.product-badge');
            if (badge) { 
                badge.classList.remove('in', 'premium'); 
                badge.classList.add('out'); 
                badge.textContent = 'Stoc epuizat'; 
            }
            return;
        }

        // Produs disponibil - adaugă selector + buton
        actions.innerHTML =
            '<div class="qty-selector">' +
                '<button type="button" class="qty-btn qty-minus" aria-label="Scade cantitatea">−</button>' +
                '<input type="number" class="qty-input" value="1" min="1" max="' + stock + '" inputmode="numeric" aria-label="Cantitate">' +
                '<button type="button" class="qty-btn qty-plus" aria-label="Crește cantitatea">+</button>' +
            '</div>' +
            '<button type="button" class="btn btn-sm add-cart-btn ' + (price >= 100 ? 'btn-gold' : 'btn-primary') + '">' +
                '<i class="fas fa-cart-plus"></i> Adaugă în coș' +
            '</button>';

        var input = actions.querySelector('.qty-input');

        actions.querySelector('.qty-minus').addEventListener('click', function () {
            input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
        });
        actions.querySelector('.qty-plus').addEventListener('click', function () {
            input.value = Math.min(stock, (parseInt(input.value, 10) || 0) + 1);
        });
        input.addEventListener('change', function () {
            var v = parseInt(input.value, 10) || 1;
            input.value = Math.min(stock, Math.max(1, v));
        });

        actions.querySelector('.add-cart-btn').addEventListener('click', function () {
            var qty = Math.min(stock, Math.max(1, parseInt(input.value, 10) || 1));
            addToCart({ id: name, name: name, price: price, img: img, stock: stock }, qty);
        });
    });
}

    // ==================================================
    //  UTILITARE
    // ==================================================
    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (ch) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
        });
    }

    // ==================================================
    //  PAGINA COȘULUI (cos.html)
    // ==================================================
    function renderCartPage() {
        var listEl = document.getElementById('cartItems');
        if (!listEl) return;

        var cart = getCart();
        var keys = Object.keys(cart);
        var emptyEl = document.getElementById('cartEmpty');
        var summaryEl = document.getElementById('cartSummary');

        if (!keys.length) {
            listEl.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
            if (summaryEl) summaryEl.style.display = 'none';
            var top = document.getElementById('summaryCountTop');
            if (top) top.textContent = '0';
            return;
        }

        if (emptyEl) emptyEl.style.display = 'none';
        if (summaryEl) summaryEl.style.display = '';

        var html = '';
        keys.forEach(function (k) {
            var it = cart[k];
            html +=
                '<div class="cart-item" data-id="' + escapeHtml(it.id) + '">' +
                    '<img src="' + escapeHtml(it.img) + '" alt="' + escapeHtml(it.name) + '" class="cart-item-img">' +
                    '<div class="cart-item-info">' +
                        '<h4>' + escapeHtml(it.name) + '</h4>' +
                        '<div class="cart-item-price">' + it.price + ' lei / buc</div>' +
                        '<div class="cart-item-stock"><i class="fas fa-check-circle"></i> În stoc: ' + it.stock + ' buc</div>' +
                    '</div>' +
                    '<div class="qty-selector small">' +
                        '<button type="button" class="qty-btn qty-minus" aria-label="Scade">−</button>' +
                        '<input type="number" class="qty-input" value="' + it.qty + '" min="1" max="' + it.stock + '" inputmode="numeric" aria-label="Cantitate">' +
                        '<button type="button" class="qty-btn qty-plus" aria-label="Crește">+</button>' +
                    '</div>' +
                    '<div class="cart-item-subtotal">' + (it.qty * it.price) + ' <span>lei</span></div>' +
                    '<button type="button" class="cart-item-remove" title="Elimină din coș" aria-label="Elimină din coș">' +
                        '<i class="fas fa-trash-alt"></i>' +
                    '</button>' +
                '</div>';
        });
        listEl.innerHTML = html;

        var n = cartCount();
        var sCount = document.getElementById('summaryCount');
        if (sCount) sCount.textContent = n + ' buc';
        var sTotal = document.getElementById('summaryTotal');
        if (sTotal) sTotal.textContent = cartTotal() + ' lei';
        var sTop = document.getElementById('summaryCountTop');
        if (sTop) sTop.textContent = String(n);
    }

    function initCartPage() {
        var listEl = document.getElementById('cartItems');
        if (!listEl) return;

        // Delegare evenimente: +/-, ștergere, modificare cantitate
        listEl.addEventListener('click', function (e) {
            var btn = e.target.closest('.qty-btn, .cart-item-remove');
            if (!btn) return;
            var row = btn.closest('.cart-item');
            var id = row ? row.dataset.id : null;
            if (!id) return;

            var cart = getCart();
            if (!cart[id]) return;

            if (btn.classList.contains('qty-minus')) {
                cart[id].qty = Math.max(1, cart[id].qty - 1);
            } else if (btn.classList.contains('qty-plus')) {
                if (cart[id].qty >= cart[id].stock) {
                    showToast('Doar ' + cart[id].stock + ' buc. în stoc pentru „' + cart[id].name + '”', true);
                    return;
                }
                cart[id].qty++;
            } else if (btn.classList.contains('cart-item-remove')) {
                delete cart[id];
                showToast('Produs eliminat din coș');
            }
            saveCart(cart);
        });

        listEl.addEventListener('change', function (e) {
            if (!e.target.classList.contains('qty-input')) return;
            var row = e.target.closest('.cart-item');
            var id = row ? row.dataset.id : null;
            if (!id) return;
            var cart = getCart();
            if (!cart[id]) return;
            var v = parseInt(e.target.value, 10) || 1;
            cart[id].qty = Math.min(cart[id].stock, Math.max(1, v));
            saveCart(cart);
        });

        // Golește coșul
        var clearBtn = document.getElementById('clearCartBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                if (!Object.keys(getCart()).length) { showToast('Coșul este deja gol', true); return; }
                if (confirm('Sigur dorești să golești coșul de cumpărături?')) {
                    localStorage.removeItem(CART_KEY);
                    updateBadges();
                    renderCartPage();
                    showToast('Coșul a fost golit');
                }
            });
        }

        // Formular comandă
        var orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var cart = getCart();
                if (!Object.keys(cart).length) { showToast('Coșul tău este gol', true); return; }

                var name    = document.getElementById('orderName').value.trim();
                var phone   = document.getElementById('orderPhone').value.trim();
                var address = document.getElementById('orderAddress').value.trim();
                var notes   = document.getElementById('orderNotes').value.trim();

                if (!name) { showToast('Introdu numele și prenumele', true); return; }
                if (!/^[+0-9][0-9\s\-()]{7,}$/.test(phone)) { showToast('Introdu un număr de telefon valid', true); return; }
                if (!address) { showToast('Introdu localitatea / adresa de livrare', true); return; }

                var msg = buildOrderMessage(cart, { name: name, phone: phone, address: address, notes: notes });
                window.open('https://wa.me/' + WHATSAPP_ORDER_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');

                var ok = document.getElementById('orderSuccess');
                if (ok) ok.style.display = 'block';
            });
        }

        // Copiază comanda (pentru telefon / e-mail)
        var copyBtn = document.getElementById('copyOrderBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', function () {
                var cart = getCart();
                if (!Object.keys(cart).length) { showToast('Coșul tău este gol', true); return; }
                var info = {
                    name:    (document.getElementById('orderName') || {}).value || '',
                    phone:   (document.getElementById('orderPhone') || {}).value || '',
                    address: (document.getElementById('orderAddress') || {}).value || '',
                    notes:   (document.getElementById('orderNotes') || {}).value || ''
                };
                var msg = buildOrderMessage(cart, info);
                copyText(msg, function () { showToast('Comanda a fost copiată! Trimite-ne-o pe WhatsApp sau e-mail.'); });
            });
        }

        renderCartPage();
    }

    function buildOrderMessage(cart, info) {
        var lines = ['🍇 *Comandă nouă – Butași Premium MD*', ''];
        var i = 1, total = 0;
        Object.keys(cart).forEach(function (k) {
            var it = cart[k];
            var sub = it.qty * it.price;
            total += sub;
            lines.push(i + '. ' + it.name + ' — ' + it.qty + ' buc × ' + it.price + ' lei = ' + sub + ' lei');
            i++;
        });
        lines.push('------------------------------');
        lines.push('*Total de plată: ' + total + ' lei*', '');
        lines.push('Nume: ' + (info.name || '—'));
        lines.push('Telefon: ' + (info.phone || '—'));
        lines.push('Livrare: ' + (info.address || '—'));
        if (info.notes) lines.push('Observații: ' + info.notes);
        return lines.join('\n');
    }

    function copyText(text, onOk) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(onOk, function () { legacyCopy(text, onOk); });
        } else {
            legacyCopy(text, onOk);
        }
    }

    function legacyCopy(text, onOk) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); onOk(); }
        catch (e) { showToast('Copierea nu a reușit', true); }
        document.body.removeChild(ta);
    }

    // Închide meniul mobil la click pe iconița coșului
    function initNavCartClose() {
        document.querySelectorAll('.nav-cart').forEach(function (link) {
            link.addEventListener('click', function () {
                var t = document.getElementById('navToggle');
                var m = document.getElementById('navMenu');
                if (t && m) {
                    t.classList.remove('active');
                    m.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }

    // ==================================================
    //  PORNIRE
    // ==================================================
    document.addEventListener('DOMContentLoaded', function () {
        enhanceProductCards();
        updateBadges();
        initCartPage();
        initNavCartClose();
    });
})();
