/**
 * WRESTETICA AUTOMOTIVA - Lógica Interativa & Orçamentos
 * Vanilla JavaScript de alta performance com empacotamento modular
 */

function initWREstetica() {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
  window.addEventListener('load', () => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  /* =========================================================================
     1. STICKY NAVBAR & ACTIVE SECTION HIGHLIGHT
     ========================================================================= */
  const header = document.getElementById('main-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const handleScroll = () => {
    if (header) {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Active Section Tracking
    const scrollPosition = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPosition >= top && scrollPosition < top + height) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active', 'text-white');
            link.classList.remove('text-gray-400');
          } else {
            link.classList.remove('active', 'text-white');
            link.classList.add('text-gray-400');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* =========================================================================
     2. MOBILE MENU DRAWER
     ========================================================================= */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  const toggleMobileMenu = () => {
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  const openMobileMenu = () => {
    mobileMenu.classList.add('open');
    mobileMenuBtn.classList.add('open');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    mobileMenu.classList.remove('open');
    mobileMenuBtn.classList.remove('open');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });
  }

  /* =========================================================================
     3. STATS ANIMATED COUNTERS
     ========================================================================= */
  const counters = document.querySelectorAll('.counter');
  let animated = false;

  const animateCounters = () => {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      let count = 0;
      const duration = 1200; // ms
      const stepTime = 20;
      const totalSteps = duration / stepTime;
      const increment = target / totalSteps;

      const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
          counter.innerText = target;
          clearInterval(timer);
        } else {
          counter.innerText = Math.ceil(count);
        }
      }, stepTime);
    });
  };

  const trustBar = document.getElementById('trust-bar');
  if (trustBar && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          animateCounters();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(trustBar);
  } else {
    animateCounters();
  }

  /* =========================================================================
     4. BEFORE / AFTER COMPARISON SLIDER
     ========================================================================= */
  const slider = document.getElementById('comparison-slider');
  const beforeWrap = document.getElementById('before-image-wrap');
  const beforeImage = document.getElementById('before-image');
  const sliderHandle = document.getElementById('slider-handle');

  if (slider && beforeWrap && sliderHandle) {
    let isDragging = false;

    // Sync dimensions so the before image matches slider dimensions perfectly
    const syncImageDimensions = () => {
      if (beforeImage && slider) {
        beforeImage.style.width = `${slider.offsetWidth}px`;
        beforeImage.style.height = `${slider.offsetHeight}px`;
      }
    };

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => syncImageDimensions());
      ro.observe(slider);
    } else {
      window.addEventListener('resize', syncImageDimensions, { passive: true });
    }

    if (beforeImage.complete) {
      syncImageDimensions();
    } else {
      beforeImage.addEventListener('load', syncImageDimensions);
    }
    syncImageDimensions();

    const moveSlider = (clientX) => {
      const rect = slider.getBoundingClientRect();
      let position = ((clientX - rect.left) / rect.width) * 100;
      position = Math.max(2, Math.min(98, position));

      beforeWrap.style.width = `${position}%`;
      sliderHandle.style.left = `${position}%`;
    };

    slider.addEventListener('click', (e) => {
      moveSlider(e.clientX);
    });

    slider.addEventListener('mousedown', (e) => {
      isDragging = true;
      moveSlider(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      moveSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch events for mobile
    slider.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches.length > 0) {
        moveSlider(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length === 0) return;
      moveSlider(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    window.addEventListener('touchcancel', () => {
      isDragging = false;
    });
  }

  /* =========================================================================
     5. INTERACTIVE BUDGET CALCULATOR
     ========================================================================= */
  const vehicleButtons = document.querySelectorAll('.vehicle-btn');
  const serviceButtons = document.querySelectorAll('.service-btn');
  const calcTotalPrice = document.getElementById('calc-total-price');
  const calcTotalTime = document.getElementById('calc-total-time');
  const calcWhatsappBtn = document.getElementById('calc-whatsapp-btn');

  let selectedVehicleType = 'Hatchback / Compacto';
  let vehicleMultiplier = 1.0;

  const calculateBudget = () => {
    let baseTotal = 0;
    let selectedServices = [];
    let hasPolimentoOrCeramic = false;
    let totalEstimatedHours = 0;

    serviceButtons.forEach(btn => {
      if (btn.classList.contains('selected')) {
        const basePrice = parseFloat(btn.getAttribute('data-base')) || 0;
        const name = btn.getAttribute('data-name');
        const id = btn.getAttribute('data-id');
        
        baseTotal += basePrice;
        selectedServices.push(name);

        if (id === 'polimento' || id === 'vitrificacao') {
          hasPolimentoOrCeramic = true;
        }
      }
    });

    const finalEstimatedPrice = Math.round(baseTotal * vehicleMultiplier);

    // Calculate time estimate text
    let timeText = '2 a 4 horas';
    if (hasPolimentoOrCeramic) {
      timeText = '1 a 2 dias (inclui cura técnica)';
    } else if (selectedServices.length > 2) {
      timeText = '4 a 6 horas';
    } else if (selectedServices.length === 0) {
      timeText = 'Selecione um serviço';
    }

    if (calcTotalPrice) {
      calcTotalPrice.innerText = selectedServices.length > 0 
        ? `R$ ${finalEstimatedPrice}` 
        : 'R$ 0';
    }

    if (calcTotalTime) {
      calcTotalTime.innerText = timeText;
    }

    // Generate formatted WhatsApp message
    if (calcWhatsappBtn) {
      const servicesFormatted = selectedServices.length > 0
        ? selectedServices.map(s => `• ${s}`).join('%0A')
        : 'Nenhum selecionado';

      const whatsappText = `Ol%C3%A1%20WRestetica!%20Gostaria%20de%20um%20or%C3%A7amento%20personalizado:%0A%0A*Categoria%20do%20Carro:*%20${encodeURIComponent(selectedVehicleType)}%0A*Tratamentos%20Desejados:*%0A${servicesFormatted}%0A%0A*Estimativa%20no%20site:*%20R$%20${finalEstimatedPrice}%0A*Tempo%20estimado:*%20${encodeURIComponent(timeText)}%0A%0APor%20favor,%20qual%20a%20disponibilidade%20de%20hor%C3%A1rio?`;

      calcWhatsappBtn.href = `https://wa.me/5581984295003?text=${whatsappText}`;
    }
  };

  // Vehicle Selection Handler
  vehicleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      vehicleButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedVehicleType = btn.getAttribute('data-type');
      vehicleMultiplier = parseFloat(btn.getAttribute('data-multiplier')) || 1.0;
      calculateBudget();
    });
  });

  // Services Selection Handler
  serviceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      const isSelected = btn.classList.contains('selected');
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      calculateBudget();
      if (window.lucide) window.lucide.createIcons();
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Initial Calculation Run
  calculateBudget();

  /* =========================================================================
     6. GALLERY LIGHTBOX MODAL
     ========================================================================= */
  const galleryCards = document.querySelectorAll('.gallery-card');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');

  let currentGalleryIndex = 0;
  const galleryItems = [];

  galleryCards.forEach((card, index) => {
    const img = card.querySelector('img');
    const caption = card.getAttribute('data-caption') || (img ? img.alt : '');
    if (img) {
      galleryItems.push({
        src: img.src,
        alt: img.alt,
        caption: caption
      });

      card.addEventListener('click', () => {
        openLightbox(index);
      });
    }
  });

  const openLightbox = (index) => {
    currentGalleryIndex = index;
    updateLightbox();
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  const updateLightbox = () => {
    const item = galleryItems[currentGalleryIndex];
    if (item && lightboxImg && lightboxCaption) {
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt;
      lightboxCaption.innerText = item.caption;
    }
  };

  const nextImage = () => {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryItems.length;
    updateLightbox();
  };

  const prevImage = () => {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightbox();
  };

  if (lightboxModal) {
    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
    if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', nextImage);
    if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', prevImage);

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightboxModal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    });
  }

  /* =========================================================================
     7. FAQ ACCORDION
     ========================================================================= */
  const faqCards = document.querySelectorAll('.faq-card');

  faqCards.forEach(card => {
    const toggle = card.querySelector('.faq-toggle');
    const answer = card.querySelector('.faq-answer');

    if (toggle && answer) {
      toggle.addEventListener('click', () => {
        const isActive = card.classList.contains('active');

        // Close other items
        faqCards.forEach(other => {
          if (other !== card) {
            other.classList.remove('active');
            const otherToggle = other.querySelector('.faq-toggle');
            const otherAnswer = other.querySelector('.faq-answer');
            if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
            if (otherAnswer) otherAnswer.classList.add('hidden');
          }
        });

        // Toggle clicked
        if (isActive) {
          card.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
          answer.classList.add('hidden');
        } else {
          card.classList.add('active');
          toggle.setAttribute('aria-expanded', 'true');
          answer.classList.remove('hidden');
        }
      });
    }
  });

  // Re-run icons to make sure everything rendered
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Execute immediately or when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWREstetica);
} else {
  initWREstetica();
}
