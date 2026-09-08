/**
 * MUBIN VERT - Solar & Energy Solutions
 * Shared JavaScript (script.js)
 * Features:
 *  - Mobile hamburger navigation toggle
 *  - Header shadow on scroll
 *  - IntersectionObserver for smooth fade-in animations
 *  - Products order button URL parameter handling & auto-fill
 *  - WhatsApp order submission logic (validation + wa.me redirect)
 *  - Contact form submission mock with feedback
 *  - Product category filter functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollEffects();
  initIntersectionAnimations();
  initProductFiltering();
  initOrderForm();
  initContactForm();
});

/* ==========================================
   1. Mobile Navigation
   ========================================== */
function initMobileNav() {
  const hamburger = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');

  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !isExpanded);
    hamburger.classList.toggle('is-active');
    navMenu.classList.toggle('open');
  });

  // Close menu when clicking on a nav link
  const navLinks = navMenu.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('open')) {
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
    }
  });
}

/* ==========================================
   2. Scroll Effects (Header)
   ========================================== */
function initScrollEffects() {
  const header = document.querySelector('.header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================
   3. Intersection Observer for Scroll Animations
   ========================================== */
function initIntersectionAnimations() {
  const animatedElements = document.querySelectorAll('.fade-in-up');
  if (!animatedElements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('appear');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver not supported
    animatedElements.forEach(el => el.classList.add('appear'));
  }
}

/* ==========================================
   4. Product Filtering (products.html)
   ========================================== */
function initProductFiltering() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  if (!filterBtns.length || !productCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active class
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================
   5. Order Form Logic (WhatsApp integration)
   ========================================== */
function initOrderForm() {
  const orderForm = document.getElementById('solarOrderForm');
  const productSelect = document.getElementById('orderProduct');
  const quantityInput = document.getElementById('orderQuantity');
  const selectedProductSummary = document.getElementById('summaryProductName');
  const selectedQtySummary = document.getElementById('summaryQuantity');
  const orderSection = document.getElementById('orderSection');

  // If on products page and product selected via click or URL param
  const urlParams = new URLSearchParams(window.location.search);
  const prefillProduct = urlParams.get('product');

  if (productSelect && prefillProduct) {
    productSelect.value = prefillProduct;
    updateSummary();
    if (orderSection) {
      setTimeout(() => {
        orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }

  // Handle "Order" buttons on product cards
  const orderButtons = document.querySelectorAll('.btn-order-trigger');
  orderButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productName = btn.getAttribute('data-product-name');
      if (productSelect && productName) {
        productSelect.value = productName;
        updateSummary();
        if (orderSection) {
          orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Listen to select or quantity change to update summary display
  if (productSelect) {
    productSelect.addEventListener('change', updateSummary);
  }
  if (quantityInput) {
    quantityInput.addEventListener('input', updateSummary);
  }

  function updateSummary() {
    if (!productSelect || !selectedProductSummary) return;
    const prodVal = productSelect.value || 'None selected';
    const qtyVal = quantityInput ? quantityInput.value : '1';
    selectedProductSummary.textContent = prodVal;
    if (selectedQtySummary) {
      selectedQtySummary.textContent = qtyVal;
    }
  }

  // Handle Form Submission
  if (!orderForm) return;

  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Field references
    const fullNameInput = document.getElementById('orderFullName');
    const phoneInput = document.getElementById('orderPhone');
    const deliveryAddressInput = document.getElementById('orderAddress');
    const notesInput = document.getElementById('orderNotes');

    let isValid = true;

    // Reset previous error states
    clearError('orderFullName');
    clearError('orderPhone');
    clearError('orderProduct');
    clearError('orderQuantity');
    clearError('orderAddress');

    // Validate Full Name
    const fullName = fullNameInput ? fullNameInput.value.trim() : '';
    if (!fullName || fullName.length < 3) {
      showError('orderFullName', 'Please enter your full name (at least 3 characters).');
      isValid = false;
    }

    // Validate Phone Number (accepts Nigerian formats: 080..., 090..., +234..., etc.)
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const phoneClean = phone.replace(/[\s\-()]/g, '');
    if (!phone || phoneClean.length < 10) {
      showError('orderPhone', 'Please enter a valid active phone or WhatsApp number.');
      isValid = false;
    }

    // Validate Product Selection
    const product = productSelect ? productSelect.value.trim() : '';
    if (!product) {
      showError('orderProduct', 'Please select a product from the list.');
      isValid = false;
    }

    // Validate Quantity
    const quantity = quantityInput ? quantityInput.value.trim() : '1';
    if (!quantity || parseInt(quantity, 10) <= 0) {
      showError('orderQuantity', 'Please specify a valid quantity (1 or more).');
      isValid = false;
    }

    // Validate Address
    const address = deliveryAddressInput ? deliveryAddressInput.value.trim() : '';
    if (!address || address.length < 5) {
      showError('orderAddress', 'Please provide a complete delivery address / city / state.');
      isValid = false;
    }

    const notes = notesInput ? notesInput.value.trim() : 'None';

    if (!isValid) {
      return;
    }

    // Format WhatsApp message cleanly with emojis & line breaks
    const messageLines = [
      `*NEW SOLAR ORDER INQUIRY - MUBIN VERT*`,
      `---------------------------------`,
      `👤 *Customer Name:* ${fullName}`,
      `📞 *Phone / WhatsApp:* ${phone}`,
      `⚡ *Product Selected:* ${product}`,
      `🔢 *Quantity:* ${quantity}`,
      `📍 *Delivery Address:* ${address}`,
      `📝 *Additional Notes:* ${notes ? notes : 'None'}`
    ];

    const fullMessage = messageLines.join('\n');
    const encodedMessage = encodeURIComponent(fullMessage);
    const whatsappURL = `https://wa.me/2349039607643?text=${encodedMessage}`;

    // Provide visual confirmation feedback before dispatch
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Connecting to WhatsApp...
      `;
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        // Redirect directly to WhatsApp chat
        window.open(whatsappURL, '_blank');
      }, 600);
    } else {
      window.open(whatsappURL, '_blank');
    }
  });

  function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + 'Error');
    if (field) field.classList.add('is-invalid');
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + 'Error');
    if (field) field.classList.remove('is-invalid');
    if (errorEl) errorEl.textContent = '';
  }
}

/* ==========================================
   6. Contact Form Mock Handling (index.html)
   ========================================== */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  const alertBox = document.getElementById('contactFormAlert');

  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();
    const msg = document.getElementById('contactMessage')?.value.trim();

    if (!name || !email || !msg) {
      alert('Please fill out all required fields.');
      return;
    }

    // Direct inquiry to WhatsApp with details or show quick acknowledgment
    const message = `*Website Contact Inquiry - MUBIN VERT*\n👤 *Name:* ${name}\n📧 *Email:* ${email}\n💬 *Message:* ${msg}`;
    const encoded = encodeURIComponent(message);
    const targetUrl = `https://wa.me/2349039607643?text=${encoded}`;

    if (alertBox) {
      alertBox.textContent = `Thank you, ${name}! Redirecting you to chat directly with our solar consultant on WhatsApp...`;
      alertBox.classList.add('success');
      alertBox.style.display = 'block';
    }

    setTimeout(() => {
      window.open(targetUrl, '_blank');
      contactForm.reset();
    }, 900);
  });
}
