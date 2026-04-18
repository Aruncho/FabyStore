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
    
    // Elementos del carrusel
    const modalCarouselInner = document.getElementById('modalCarouselInner');
    const carouselPrev = document.getElementById('carouselPrev');
    const carouselNext = document.getElementById('carouselNext');
    const carouselIndicators = document.getElementById('carouselIndicators');
    let carouselImages = [];
    let currentCarouselIndex = 0;

    function updateCarousel() {
        if (!modalCarouselInner) return;
        modalCarouselInner.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
        
        if (carouselIndicators) {
            Array.from(carouselIndicators.children).forEach((dot, index) => {
                dot.classList.toggle('active', index === currentCarouselIndex);
            });
        }
    }

    if (carouselPrev) {
        carouselPrev.addEventListener('click', () => {
            currentCarouselIndex = (currentCarouselIndex > 0) ? currentCarouselIndex - 1 : carouselImages.length - 1;
            updateCarousel();
        });
    }

    if (carouselNext) {
        carouselNext.addEventListener('click', () => {
            currentCarouselIndex = (currentCarouselIndex < carouselImages.length - 1) ? currentCarouselIndex + 1 : 0;
            updateCarousel();
        });
    }

    let currentShareUrl = '';

    if (modalShareBtn) {
        modalShareBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!currentShareUrl) return;

            function showFeedback() {
                const icon = modalShareBtn.querySelector('i');
                if (icon) {
                    const originalClass = icon.className; // guardamos el original
                    icon.className = 'bi bi-check-lg';
                    setTimeout(() => { if (icon.className === 'bi bi-check-lg') icon.className = 'bi bi-share'; }, 2000);
                }
                
                // Mostrar tooltip (cuadradito encima del botón)
                let tooltip = document.getElementById('shareTooltip');
                if (!tooltip) {
                    tooltip = document.createElement('div');
                    tooltip.id = 'shareTooltip';
                    tooltip.className = 'share-tooltip';
                    tooltip.innerText = 'Enlace copiado';
                    modalShareBtn.parentElement.appendChild(tooltip);
                }
                
                tooltip.classList.add('show');
                setTimeout(() => tooltip.classList.remove('show'), 2500);
            }

            function fallbackCopy() {
                const textArea = document.createElement("textarea");
                textArea.value = currentShareUrl;
                // Prevenir scroll en móviles
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    showFeedback();
                } catch (err) {
                    console.error('Fallback error:', err);
                    prompt('Tu navegador bloqueó el copiado automático. Por favor, copia el enlace manualmente:', currentShareUrl);
                }
                document.body.removeChild(textArea);
            }

            // Intento 1: API Moderna (solo en HTTPS)
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(currentShareUrl).then(() => {
                    showFeedback();
                }).catch(() => {
                    // Si falla, usar método antiguo
                    fallbackCopy();
                });
            } else {
                // Intento 2: Método antiguo (funciona en http local y navegadores viejos)
                fallbackCopy();
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

            // Construir URL limpia de compartir apuntando a la ruta que tiene las etiquetas Open Graph
            // Agregamos ?v=1 para obligar a WhatsApp a borrar su caché y leer la foto de nuevo
            const baseUrl = window.location.origin;
            currentShareUrl = `${baseUrl}/zapato/${zapatoId}?v=1`;

            // Configurar el carrusel o imagen estática
            const galeriaAttr = this.getAttribute('data-galeria');
            carouselImages = [img];
            if (galeriaAttr && galeriaAttr.trim() !== '' && galeriaAttr.trim() !== 'None') {
                carouselImages = carouselImages.concat(galeriaAttr.split(','));
            }

            if (modalCarouselInner) {
                modalCarouselInner.innerHTML = '';
                if(carouselIndicators) carouselIndicators.innerHTML = '';
                
                carouselImages.forEach((src, idx) => {
                    const imageEl = document.createElement('img');
                    imageEl.src = src;
                    imageEl.className = 'pmodal-img';
                    modalCarouselInner.appendChild(imageEl);
                    
                    if (carouselImages.length > 1 && carouselIndicators) {
                        const dot = document.createElement('div');
                        dot.className = 'carousel-indicator';
                        if (idx === 0) dot.classList.add('active');
                        dot.addEventListener('click', () => {
                            currentCarouselIndex = idx;
                            updateCarousel();
                        });
                        carouselIndicators.appendChild(dot);
                    }
                });
                
                currentCarouselIndex = 0;
                updateCarousel();
                
                if (carouselImages.length > 1) {
                    if(carouselPrev) carouselPrev.style.display = 'block';
                    if(carouselNext) carouselNext.style.display = 'block';
                } else {
                    if(carouselPrev) carouselPrev.style.display = 'none';
                    if(carouselNext) carouselNext.style.display = 'none';
                }
            } else if (modalImage) {
                modalImage.src = img;
            }

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
