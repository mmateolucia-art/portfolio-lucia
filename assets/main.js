(function(){
  const burger = document.getElementById('burgerBtn');
  const menu = document.getElementById('mobileNav');
  if(!burger || !menu) return;

  function closeMenu(){
    menu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu(){
    const isOpen = menu.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  }

  burger.addEventListener('click', toggleMenu);

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if(!menu.classList.contains('open')) return;
    if(!e.target.closest('.nav-inner')) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') closeMenu();
  });
})();

(function(){
  const revealEls = document.querySelectorAll('.reveal');
  if(!revealEls.length) return;

  if(!('IntersectionObserver' in window)){
    revealEls.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  revealEls.forEach(el => observer.observe(el));
})();

(function(){
  const heroVisual = document.querySelector('.hero-v2-visual');
  if(!heroVisual) return;

  const targets = Array.from(heroVisual.querySelectorAll('[data-depth]'));
  if(!targets.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const wideEnough = window.matchMedia('(min-width: 861px)').matches;
  if(reduceMotion || !canHover || !wideEnough) return;

  const hero = document.querySelector('.hero-v2');
  let rafId = null;
  let px = 0, py = 0;

  function apply(){
    rafId = null;
    targets.forEach(el => {
      const depth = parseFloat(el.dataset.depth) || 0;
      el.style.transform = 'translate3d(' + (px * depth).toFixed(2) + 'px, ' + (py * depth).toFixed(2) + 'px, 0)';
    });
  }

  function onMove(e){
    const rect = heroVisual.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    px = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
    py = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
    if(rafId === null) rafId = requestAnimationFrame(apply);
  }

  function onLeave(){
    px = 0; py = 0;
    if(rafId === null) rafId = requestAnimationFrame(apply);
  }

  hero.addEventListener('mousemove', onMove);
  hero.addEventListener('mouseleave', onLeave);
})();

(function(){
  const images = Array.from(document.querySelectorAll('.lightbox-img'));
  const lightbox = document.getElementById('lightbox');
  if(!images.length || !lightbox) return;

  const imgEl = lightbox.querySelector('.lightbox-image');
  const counterEl = lightbox.querySelector('.lightbox-counter');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  const inertTargets = Array.from(document.body.children).filter(el => el !== lightbox);

  let currentIndex = 0;
  let lastFocused = null;

  function show(index){
    currentIndex = (index + images.length) % images.length;
    const img = images[currentIndex];
    imgEl.src = img.currentSrc || img.src;
    imgEl.alt = img.alt || '';
    counterEl.textContent = (currentIndex + 1) + ' / ' + images.length;
  }

  function onKeydown(e){
    if(e.key === 'Escape') close();
    else if(e.key === 'ArrowRight') show(currentIndex + 1);
    else if(e.key === 'ArrowLeft') show(currentIndex - 1);
  }

  function open(index, triggerEl){
    lastFocused = triggerEl;
    show(index);
    inertTargets.forEach(el => { el.inert = true; });
    document.body.classList.add('lb-lock');
    lightbox.classList.add('is-open');
    requestAnimationFrame(() => lightbox.classList.add('is-visible'));
    lightbox.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function close(){
    lightbox.classList.remove('is-visible');
    document.removeEventListener('keydown', onKeydown);
    inertTargets.forEach(el => { el.inert = false; });
    document.body.classList.remove('lb-lock');
    setTimeout(() => lightbox.classList.remove('is-open'), 250);
    if(lastFocused) lastFocused.focus();
  }

  images.forEach((img, i) => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'Ampliar imagen ' + (i + 1) + ' de ' + images.length);
    img.addEventListener('click', () => open(i, img));
    img.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(i, img); }
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(currentIndex - 1));
  nextBtn.addEventListener('click', () => show(currentIndex + 1));
  lightbox.addEventListener('click', (e) => {
    if(!e.target.closest('.lightbox-image, .lightbox-btn')) close();
  });
})();
