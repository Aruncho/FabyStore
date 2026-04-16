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
    const modalShareBtn = document.getElementById('modalShareBtn');
    let currentShareUrl = '';

    if (modalShareBtn) {
        modalShareBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            if (!currentShareUrl) return;

            const copyToClipboard = async () => {
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(currentShareUrl);
                    } else {
                        throw new Error('Clipboard API not available');
                    }
                } catch (e) {
                    const textArea = document.createElement("textarea");
                    textArea.value = currentShareUrl;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-9999px";
                    textArea.style.top = "0";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                        document.execCommand('copy');
                    } catch (err) {
                        console.error('Fallback error:', err);
                    }
                    textArea.remove();
                }

                // Feedback visual en el botón
                const icon = modalShareBtn.querySelector('i');
                if (icon) {
                    const originalClass = icon.className;
                    icon.className = 'bi bi-check-lg';
                    setTimeout(() => icon.className = originalClass, 2000);
                }
            };
            
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: modalTitle ? modalTitle.innerText : "Faby's Store",
                        text: '¡Mira este producto en Faby\'s Store!',
                        url: currentShareUrl
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') await copyToClipboard();
                }
            } else {
                await copyToClipboard();
            }
        });
    }

    document.querySelectorAll('.product-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function (e) {
            if (e.target.closest('.product-btn')) return;

            const img = this.querySelector('.product-img').src;
            const brand = this.querySelector('.product-brand').innerText;
            const title = this.querySelector('.product-title').innerText;
            const btn = this.querySelector('.product-btn');
            
            // Extraer ID correctamente de la tarjeta
            const zapatoId = this.id.split('-').pop();

            // Construir URL limpia de compartir
            const baseUrl = window.location.origin + window.location.pathname;
            currentShareUrl = `${baseUrl}?ver=${zapatoId}`;

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
                tarjeta.click();
            }
        }, 100);
    }
});
