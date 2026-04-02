window.actualizarOrden = function(nuevoOrden) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('orden', nuevoOrden);
    window.location.href = window.location.pathname + '?' + urlParams.toString();
};

window.toggleSortDropdown = function(e) {
    e.stopPropagation();
    const options = document.getElementById('sortOptions');
    if (options) options.classList.toggle('open');
};

document.addEventListener("DOMContentLoaded", function () {
    // Botón de scroll específico del catálogo
    window.addEventListener('scroll', () => {
        const btn = document.getElementById('scrollTopBtn');
        if (btn) {
            if (window.scrollY > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }
    });

    // Lógica del Modal de Producto
    const modal = document.getElementById('productModal');
    const closeModal = document.querySelector('.pmodal-close');
    const modalImage = document.getElementById('modalImage');
    const modalBrand = document.getElementById('modalBrand');
    const modalTitle = document.getElementById('modalTitle');
    const modalWhatsApp = document.getElementById('modalWhatsApp');

    document.querySelectorAll('.product-img-wrapper').forEach(wrapper => {
        wrapper.style.cursor = 'pointer';
        wrapper.addEventListener('click', function () {
            const card = this.closest('.product-card');
            const img = this.querySelector('.product-img').src;
            const brand = card.querySelector('.product-brand').innerText;
            const title = card.querySelector('.product-title').innerText;
            const btn = card.querySelector('.product-btn');

            if (modalImage) modalImage.src = img;
            if (modalBrand) modalBrand.innerText = brand;
            if (modalTitle) modalTitle.innerText = title;

            if (btn && modalWhatsApp) {
                modalWhatsApp.href = btn.href;
                modalWhatsApp.innerText = "Comprar por WhatsApp";
                modalWhatsApp.style.pointerEvents = btn.style.pointerEvents || 'auto';
                modalWhatsApp.style.opacity = btn.style.opacity || '1';
            }

            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
            }
        });
    });

    if (closeModal && modal) {
        closeModal.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    document.addEventListener('click', function () {
        const options = document.getElementById('sortOptions');
        if (options) options.classList.remove('open');
    });

    // Lógica para abrir modal automáticamente si viene de un link de compartir
    const urlParams = new URLSearchParams(window.location.search);
    const zapatoId = urlParams.get('ver');

    if (zapatoId) {
        // Pequeño retraso para que todo el DOM y otros scripts carguen bien
        setTimeout(() => {
            const tarjeta = document.getElementById('tarjeta-' + zapatoId);
            if (tarjeta) {
                tarjeta.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const imgWrapper = tarjeta.querySelector('.product-img-wrapper');
                if (imgWrapper) {
                    imgWrapper.click();
                }
            }
        }, 100);
    }
});
