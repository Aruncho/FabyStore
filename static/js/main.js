// JS para la Navbar
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const overlay = document.getElementById('overlay');

function toggleMenu() {
  const isOpen = mobileMenu.classList.toggle('open');
  if(hamburger) hamburger.classList.toggle('open', isOpen);
  if(overlay) overlay.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

if(hamburger) {
    hamburger.addEventListener('click', toggleMenu);
}
if(overlay) {
    overlay.addEventListener('click', toggleMenu);
}

if(mobileMenu) {
    mobileMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', toggleMenu);
    });
}

let lastScrollTop = 0;
const navbar = document.querySelector('nav');

window.addEventListener('scroll', function () {
  let scrollTop = window.scrollY || document.documentElement.scrollTop;
  if(navbar) {
      if (scrollTop > lastScrollTop && scrollTop > navbar.offsetHeight) {
        navbar.classList.add('nav-hidden');
      } else {
        navbar.classList.remove('nav-hidden');
      }
  }
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// Lógica del buscador expandible
const searchIcon = document.getElementById('searchIcon');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');

if (searchIcon && searchContainer) {
  searchIcon.addEventListener('click', (e) => {
    if (!searchContainer.classList.contains('active')) {
      e.preventDefault();
      e.stopPropagation();
      searchContainer.classList.add('active');
      if(searchInput) searchInput.focus();
    } else if (searchInput && searchInput.value.trim() === '') {
      e.preventDefault();
      e.stopPropagation();
      searchContainer.classList.remove('active');
    }
  });

  if(searchInput) {
      searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
      });
  }

  document.addEventListener('click', (e) => {
    if (searchContainer.classList.contains('active') && !searchContainer.contains(e.target)) {
      searchContainer.classList.remove('active');
    }
  });
}

// Lógica del Modal Selección WhatsApp
const waSelectModal = document.getElementById('waSelectModal');
const closeWaModalBtn = document.querySelector('.close-wa-modal');
const waOption1 = document.getElementById('waOption1');
const waOption2 = document.getElementById('waOption2');

document.addEventListener('click', function (e) {
  const waBtn = e.target.closest('a[href^="https://wa.me/"]');
  if (waBtn && (waBtn.classList.contains('product-btn') || waBtn.classList.contains('empty-state-whatsapp-square') || waBtn.id === 'modalWhatsApp' || waBtn.classList.contains('nav-icon'))) {
    e.preventDefault();
    const originalHref = waBtn.href;

    try {
      const urlObj = new URL(originalHref);
      const textParam = urlObj.searchParams.get('text') || '';

      const num1 = "584241147116"; 
      const num2 = "14709492753"; 

      if(waOption1) waOption1.href = `https://wa.me/${num1}?text=${encodeURIComponent(textParam)}`;
      if(waOption2) waOption2.href = `https://wa.me/${num2}?text=${encodeURIComponent(textParam)}`;
    } catch (err) {
      console.error("Link format error:", err);
      if(waOption1) waOption1.href = originalHref;
      if(waOption2) waOption2.href = originalHref.replace('584141877974', '14709492753').replace('584120000000', '14709492753');
    }

    if(waSelectModal) {
      waSelectModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
});

if(closeWaModalBtn) {
    closeWaModalBtn.addEventListener('click', () => {
      waSelectModal.classList.remove('active');
      const productModal = document.getElementById('productModal');
      if (!productModal || !productModal.classList.contains('active')) {
        document.body.style.overflow = '';
      }
    });
}

if(waSelectModal) {
    waSelectModal.addEventListener('click', (e) => {
      if (e.target === waSelectModal) {
        waSelectModal.classList.remove('active');
        const productModal = document.getElementById('productModal');
        if (!productModal || !productModal.classList.contains('active')) {
          document.body.style.overflow = '';
        }
      }
    });
}

document.querySelectorAll('.wa-option-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if(waSelectModal) waSelectModal.classList.remove('active');
    const productModal = document.getElementById('productModal');
    if (!productModal || !productModal.classList.contains('active')) {
        document.body.style.overflow = '';
    }
  });
});
