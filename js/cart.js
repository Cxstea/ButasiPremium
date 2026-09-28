(function () {
    'use strict';

    var CART_KEY = 'butasi_cart';
    var MAX_QTY = 9999;

    var ORDER_PHONE = '37360010332';
    var ORDER_PHONE_DISPLAY = '060 010 332';
    var ORDER_EMAIL = 'gt.puscasu.andrei@gmail.com'; 

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

    function updateBadges() {
        var n = cartCount();
        document.querySelectorAll('[data-cart-badge]').forEach(function (b) {
            b.textContent = n;
            b.classList.toggle('hidden', n === 0);
        });
    }

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

    function addToCart(item, qty) {
        var cart = getCart();

        if (cart[item.id]) {
            var newQty = Math.min(MAX_QTY, cart[item.id].qty + qty);
            cart[item.id].qty = newQty;
            showToast('„' + item.name + '” adăugat în coș (' + newQty + ' buc.)');
        } else {
            cart[item.id] = {
                id: item.id,
                name: item.name,
                price: item.price,
                img: item.img,
                qty: Math.min(MAX_QTY, qty)
            };
            showToast('„' + item.name + '” adăugat în coș');
        }

        saveCart(cart);
    }

    function enhanceProductCards() {
        var cards = document.querySelectorAll('.product-card');
        if (!cards.length) return;

        cards.forEach(function (card) {
            var titleEl = card.querySelector('.product-title');
            if (!titleEl || card.dataset.cartReady) return;
            card.dataset.cartReady = '1';

            var name = titleEl.textContent.trim();

            var priceEl = card.querySelector('.product-price');
            var price = parseInt(priceEl ? priceEl.textContent : '0', 10) || 0;

            var imgEl = card.querySelector('.product-img-wrapper img');
            var img = imgEl ? imgEl.getAttribute('src') : '';

            var badge = card.querySelector('.product-badge');
            var isOut = badge && badge.classList.contains('out');

            if (badge && !isOut && /în stoc/i.test(badge.textContent)) {
                badge.remove();
            }

            var actions = card.querySelector('.product-actions');
            if (!actions) return;

            if (isOut) {
                actions.innerHTML =
                    '<button type="button" class="btn btn-outline btn-sm" disabled>' +
                    '<i class="fas fa-clock"></i> Indisponibil</button>';
                if (badge) badge.textContent = 'Indisponibil';
                return;
            }

            actions.innerHTML =
                '<div class="qty-selector">' +
                    '<button type="button" class="qty-btn qty-minus" aria-label="Scade cantitatea">−</button>' +
                    '<input type="number" class="qty-input" value="1" min="1" max="' + MAX_QTY + '" inputmode="numeric" aria-label="Cantitate">' +
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
                input.value = Math.min(MAX_QTY, (parseInt(input.value, 10) || 0) + 1);
            });

            input.addEventListener('change', function () {
                var v = parseInt(input.value, 10) || 1;
                input.value = Math.min(MAX_QTY, Math.max(1, v));
            });

            actions.querySelector('.add-cart-btn').addEventListener('click', function () {
                var qty = Math.min(MAX_QTY, Math.max(1, parseInt(input.value, 10) || 1));
                addToCart({ id: name, name: name, price: price, img: img }, qty);
            });
        });
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (ch) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
        });
    }

    function isMobile() {
        return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    }

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
                    '</div>' +
                    '<div class="qty-selector small">' +
                        '<button type="button" class="qty-btn qty-minus" aria-label="Scade">−</button>' +
                        '<input type="number" class="qty-input" value="' + it.qty + '" min="1" max="' + MAX_QTY + '" inputmode="numeric" aria-label="Cantitate">' +
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

    var CHANNELS = {
        whatsapp: { label: 'WhatsApp', icon: 'fab fa-whatsapp' },
        telegram: { label: 'Telegram', icon: 'fab fa-telegram' },
        viber:    { label: 'Viber',    icon: 'fab fa-viber' },
        gmail:    { label: 'Gmail',    icon: 'fas fa-envelope' }
    };

    function getChannel() {
        var r = document.querySelector('input[name="sendChannel"]:checked');
        return r ? r.value : 'whatsapp';
    }

    function updateSendButton() {
        var btn = document.getElementById('submitOrderBtn');
        if (!btn) return;
        var ch = CHANNELS[getChannel()] || CHANNELS.whatsapp;
        btn.innerHTML = '<i class="' + ch.icon + '"></i> Trimite comanda pe ' + ch.label;
    }

    function sendOrder(channel, msg, info) {
        var ok = document.getElementById('orderSuccess');
        var okMsg;

        if (channel === 'whatsapp') {
            window.open('https://wa.me/' + ORDER_PHONE + '?text=' + encodeURIComponent(msg), '_blank');
            okMsg = 'Comanda a fost pregătită! Am deschis WhatsApp cu detaliile comenzii – apasă „Trimite".';

        } else if (channel === 'telegram') {
            copyText(msg, function () {
                showToast('Comanda a fost copiată – lipește-o în chat și trimite.');
            });
            window.open('https://t.me/+' + ORDER_PHONE, '_blank');
            okMsg = 'Comanda a fost copiată! Am deschis Telegram – lipește mesajul în chat (Ctrl+V / apăsare lungă → Lipește) și apasă „Trimite".';

        } else if (channel === 'viber') {
            copyText(msg, function () {
                showToast('Comanda a fost copiată – lipește-o în chat și trimite.');
            });
            window.location.href = 'viber://chat?number=%2B' + ORDER_PHONE;
            okMsg = 'Comanda a fost copiată! Am deschis Viber – lipește mesajul în chat și apasă „Trimite".';

        } else if (channel === 'gmail') {
            var subject = 'Comandă nouă – Butași Premium MD';
            if (isMobile()) {
                window.location.href = 'mailto:' + ORDER_EMAIL +
                    '?subject=' + encodeURIComponent(subject) +
                    '&body=' + encodeURIComponent(msg.replace(/\*/g, ''));
            } else {
                window.open('https://mail.google.com/mail/?view=cm&fs=1' +
                    '&to=' + encodeURIComponent(ORDER_EMAIL) +
                    '&su=' + encodeURIComponent(subject) +
                    '&body=' + encodeURIComponent(msg.replace(/\*/g, '')), '_blank');
            }
            okMsg = 'Comanda a fost pregătită! Am deschis e-mailul cu detaliile comenzii – apasă „Trimite".';
        }

        if (ok) {
            ok.innerHTML = '<i class="fas fa-check-circle"></i> ' + okMsg +
                ' Dacă nu s-a deschis, sună-ne la ' + ORDER_PHONE_DISPLAY + '.';
            ok.style.display = 'block';
        }
    }

    function initCartPage() {
        var listEl = document.getElementById('cartItems');
        if (!listEl) return;

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
                cart[id].qty = Math.min(MAX_QTY, cart[id].qty + 1);
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
            cart[id].qty = Math.min(MAX_QTY, Math.max(1, v));
            saveCart(cart);
        });

        var clearBtn = document.getElementById('clearCartBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                if (!Object.keys(getCart()).length) {
                    showToast('Coșul este deja gol', true);
                    return;
                }
                if (confirm('Sigur dorești să golești coșul de cumpărături?')) {
                    localStorage.removeItem(CART_KEY);
                    updateBadges();
                    renderCartPage();
                    showToast('Coșul a fost golit');
                }
            });
        }

        document.querySelectorAll('input[name="sendChannel"]').forEach(function (r) {
            r.addEventListener('change', updateSendButton);
        });
        updateSendButton();

        var orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var cart = getCart();
                if (!Object.keys(cart).length) {
                    showToast('Coșul tău este gol', true);
                    return;
                }

                var name    = document.getElementById('orderName').value.trim();
                var phone   = document.getElementById('orderPhone').value.trim();
                var address = document.getElementById('orderAddress').value.trim();
                var emailEl = document.getElementById('orderEmail');
                var email   = emailEl ? emailEl.value.trim() : '';
                var notes   = document.getElementById('orderNotes').value.trim();

                if (!name) { showToast('Introdu numele și prenumele', true); return; }
                if (!/^[+0-9][0-9\s\-()]{7,}$/.test(phone)) { showToast('Introdu un număr de telefon valid', true); return; }
                if (!address) { showToast('Introdu localitatea / adresa de livrare', true); return; }

                var info = { name: name, phone: phone, address: address, email: email, notes: notes };
                var msg = buildOrderMessage(cart, info);

                sendOrder(getChannel(), msg, info);
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
        if (info.email) lines.push('Email: ' + info.email);
        if (info.notes) lines.push('Observații: ' + info.notes);

        return lines.join('\n');
    }

    function copyText(text, onOk) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(onOk, function () {
                legacyCopy(text, onOk);
            });
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
        try {
            document.execCommand('copy');
            onOk();
        } catch (e) {
            showToast('Copierea nu a reușit', true);
        }
        document.body.removeChild(ta);
    }

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

    document.addEventListener('DOMContentLoaded', function () {
        enhanceProductCards();
        updateBadges();
        initCartPage();
        initNavCartClose();
    });
})();