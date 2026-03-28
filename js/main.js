/* ═══════════════════════════════════════════
   GTG PERFUMES - main.js
   All interactive functionality
═══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   1. HAMBURGER / MOBILE MENU
───────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
const mobileOverlay = document.getElementById('mobileOverlay');

function openMenu() {
  mobileMenu.classList.add('open');
  mobileOverlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  mobileMenu.classList.remove('open');
  mobileOverlay.classList.remove('show');
  document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', openMenu);
if (mobileClose) mobileClose.addEventListener('click', closeMenu);
if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);

// Close mobile menu when any link inside is clicked
document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Smooth-scroll polyfill for older browsers + offset for fixed navbar
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const navH = document.getElementById('navbar')?.offsetHeight || 80;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ─────────────────────────────────────────
   2. PRODUCT IMAGE GALLERY SLIDER
───────────────────────────────────────── */
const galleryImages = [
  'assets/images/perfume-purple.png',
  'assets/images/thumb-1.png',
  'assets/images/thumb-2.png',
  'assets/images/thumb-3.png'
];

let currentSlide = 0;
const mainImage = document.getElementById('mainImage');
const dots = document.querySelectorAll('.dot');
const thumbs = document.querySelectorAll('.thumb');

function goToSlide(index) {
  if (!mainImage) return;
  currentSlide = (index + galleryImages.length) % galleryImages.length;
  mainImage.style.opacity = '0';
  setTimeout(() => {
    mainImage.src = galleryImages[currentSlide];
    mainImage.style.opacity = '1';
  }, 180);

  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  // highlight only first row of thumbs (the "real" indices)
  thumbs.forEach(t => {
    const idx = parseInt(t.dataset.index);
    const row = t.closest('.thumb-row');
    const allRows = document.querySelectorAll('.thumb-row');
    if (row === allRows[0]) {
      t.classList.toggle('active', idx === currentSlide);
    }
  });
}

document.getElementById('prevBtn')?.addEventListener('click', () => goToSlide(currentSlide - 1));
document.getElementById('nextBtn')?.addEventListener('click', () => goToSlide(currentSlide + 1));

dots.forEach(dot => {
  dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
});

document.querySelectorAll('.thumb-row')[0]?.querySelectorAll('.thumb').forEach(thumb => {
  thumb.addEventListener('click', () => goToSlide(parseInt(thumb.dataset.index)));
});


/* ─────────────────────────────────────────
   3. SUBSCRIPTION TOGGLE (SINGLE / DOUBLE)
───────────────────────────────────────── */
const singleOption = document.getElementById('singleOption');
const doubleOption = document.getElementById('doubleOption');
const singleContent = document.getElementById('singleContent');
const doubleContent = document.getElementById('doubleContent');

const subRadios = document.querySelectorAll('input[name="subscription"]');

subRadios.forEach(radio => {
  radio.addEventListener('change', function () {
    if (this.value === 'single') {
      singleOption.classList.add('selected');
      doubleOption.classList.remove('selected');
      singleContent.classList.remove('hidden');
      doubleContent.classList.add('hidden');
    } else {
      doubleOption.classList.add('selected');
      singleOption.classList.remove('selected');
      doubleContent.classList.remove('hidden');
      singleContent.classList.add('hidden');
    }
    updateCartLink();
  });
});


/* ─────────────────────────────────────────
   4. FRAGRANCE SELECTION (SINGLE & DOUBLE)
───────────────────────────────────────── */

// Generic fragrance selector: given a set of cards and tabs with a radio name
function setupFragranceGroup(radioName, cardAttr) {
  const radios = document.querySelectorAll(`input[name="${radioName}"]`);
  const cards = document.querySelectorAll(`[${cardAttr}]`);

  // Clicking a card selects the matching radio
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const val = card.getAttribute(cardAttr);
      const radio = document.querySelector(`input[name="${radioName}"][value="${val}"]`);
      if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
    });
  });

  radios.forEach(radio => {
    radio.addEventListener('change', function () {
      const val = this.value;

      // Update pill tabs
      document.querySelectorAll(`input[name="${radioName}"]`).forEach(r => {
        r.closest('.frag-tab')?.classList.toggle('active-tab', r.value === val);
      });

      // Update cards
      cards.forEach(c => {
        const active = c.getAttribute(cardAttr) === val;
        c.classList.toggle('active-frag', active);
      });

      // Sync the "included / monthly" panel image if needed
      syncIncludedImage(radioName, val);
      updateCartLink();
    });
  });
}

function syncIncludedImage(radioName, val) {
  const imageMap = {
    original: 'assets/images/frag-white.png',
    lily:     'assets/images/frag-purple.png',
    rose:     'assets/images/frag-orange.png'
  };
  const src = imageMap[val] || imageMap.original;

  if (radioName === 'fragrance') {
    // Single subscription — update the "Every 30 Days" monthly bottle
    const monthlyImg = document.getElementById('singleMonthlyImg');
    if (monthlyImg) monthlyImg.src = src;
  }
  if (radioName === 'fragrance2a') {
    // Double subscription — update the "Every 30 Days" monthly bottle
    const monthlyImg = document.getElementById('doubleMonthlyImg');
    if (monthlyImg) monthlyImg.src = src;
  }
  // One Time (Free) panel always shows all 3 bottles via included-one.png — no update needed
}

setupFragranceGroup('fragrance', 'data-frag');
setupFragranceGroup('fragrance2a', 'data-frag2a');
setupFragranceGroup('fragrance2b', 'data-frag2b');


/* ─────────────────────────────────────────
   5. "WHAT'S INCLUDED" — now static two-panel layout
      No tab switching needed; both panels always visible
───────────────────────────────────────── */
// (No tab logic needed — both "Every 30 Days" and "One Time (Free)"
//  are shown simultaneously as two side-by-side boxes, matching Figma)


/* ─────────────────────────────────────────
   6. ADD TO CART LINK - 9 VARIATIONS
      Single: 3 fragrances × 1 type
      Double: 3 × 3 fragrance combos × 1 type
───────────────────────────────────────── */
const cartLinks = {
  // single subscription - 3 fragrance options
  single_original: 'https://checkout.example.com/single-original',
  single_lily:     'https://checkout.example.com/single-lily',
  single_rose:     'https://checkout.example.com/single-rose',
  // double subscription - 9 fragrance combo options (frag1_frag2)
  double_original_original: 'https://checkout.example.com/double-original-original',
  double_original_lily:     'https://checkout.example.com/double-original-lily',
  double_original_rose:     'https://checkout.example.com/double-original-rose',
  double_lily_original:     'https://checkout.example.com/double-lily-original',
  double_lily_lily:         'https://checkout.example.com/double-lily-lily',
  double_lily_rose:         'https://checkout.example.com/double-lily-rose',
  double_rose_original:     'https://checkout.example.com/double-rose-original',
  double_rose_lily:         'https://checkout.example.com/double-rose-lily',
  double_rose_rose:         'https://checkout.example.com/double-rose-rose',
};

function updateCartLink() {
  const btn = document.getElementById('addToCartBtn');
  if (!btn) return;

  const subType = document.querySelector('input[name="subscription"]:checked')?.value || 'single';
  const frag1   = document.querySelector('input[name="fragrance"]:checked')?.value || 'original';
  const frag2a  = document.querySelector('input[name="fragrance2a"]:checked')?.value || 'original';
  const frag2b  = document.querySelector('input[name="fragrance2b"]:checked')?.value || 'original';

  let key;
  if (subType === 'single') {
    key = `single_${frag1}`;
  } else {
    key = `double_${frag2a}_${frag2b}`;
  }

  btn.href = cartLinks[key] || '#';
  console.log('Cart link updated:', key, '→', btn.href);
}

// Init cart link on page load
updateCartLink();

// Attach change listeners for all relevant radios
document.querySelectorAll('input[name="fragrance"], input[name="fragrance2a"], input[name="fragrance2b"]')
  .forEach(r => r.addEventListener('change', updateCartLink));


/* ─────────────────────────────────────────
   7. ACCORDION (Our Collection)
───────────────────────────────────────── */
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', function () {
    const item = this.closest('.accordion-item');
    const icon = this.querySelector('.acc-icon');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.accordion-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.acc-icon').textContent = '+';
    });

    // Open clicked if it was closed
    if (!isOpen) {
      item.classList.add('open');
      icon.textContent = '−';
    }
  });
});

// Set initial open item icon
document.querySelector('.accordion-item.open .acc-icon')?.textContent === '−' ||
  (document.querySelector('.accordion-item.open .acc-icon') &&
   (document.querySelector('.accordion-item.open .acc-icon').textContent = '−'));


/* ─────────────────────────────────────────
   8. STATS COUNT-UP ANIMATION
───────────────────────────────────────── */
function animateCountUp(el, target, duration = 1800) {
  const start = performance.now();
  el.textContent = '0%';

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current + '%';
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Use IntersectionObserver so it triggers when section scrolls into view
const statsSection = document.getElementById('statsSection');
if (statsSection) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.stat-number').forEach(el => {
          const target = parseInt(el.dataset.target);
          animateCountUp(el, target);
        });
        observer.unobserve(statsSection); // run once
      }
    });
  }, { threshold: 0.35 });
  observer.observe(statsSection);
}


/* ─────────────────────────────────────────
   9. NAVBAR - scroll shadow
───────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (!navbar) return;
  if (window.scrollY > 10) {
    navbar.style.background = 'rgba(255,255,255,0.97)';
    navbar.style.boxShadow = '0 2px 16px rgba(0,0,0,0.07)';
    navbar.style.position = 'fixed';
  } else {
    navbar.style.background = 'transparent';
    navbar.style.boxShadow = 'none';
    navbar.style.position = 'absolute';
  }
});


/* ─────────────────────────────────────────
   10. LAZY LOADING IMAGES (bonus)
───────────────────────────────────────── */
if ('IntersectionObserver' in window) {
  const lazyImgs = document.querySelectorAll('img[data-src]');
  const imgObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imgObserver.unobserve(img);
      }
    });
  });
  lazyImgs.forEach(img => imgObserver.observe(img));
}
