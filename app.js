const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Controlar el loader gamer
function initLoader() {
  const loader = qs('[data-loader]');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('loader--hidden');
    }, 4000);
  });
}

function initNav() {
  const toggle = qs('[data-nav-toggle]');
  const links = qs('[data-nav-links]');
  const nav = qs('.nav');

  if (!toggle || !links || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle('nav--open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
  });

  links.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    setOpen(false);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 920px)').matches) setOpen(false);
  });
  // Set CSS scroll offset based on nav height so anchors aren't hidden
  const setScrollOffset = () => {
    const h = nav ? Math.ceil(nav.getBoundingClientRect().height) : 72;
    // reduce extra gap slightly so headings don't appear too far below the nav
    document.documentElement.style.setProperty('--scroll-offset', `${h + 6}px`);
  };
  setScrollOffset();
  window.addEventListener('resize', setScrollOffset);

  // --- Active link handling (highlights current section in the menu) ---
  const navLinks = qsa('a[href^="#"]', links);

  const clearActive = () => {
    navLinks.forEach((a) => {
      a.removeAttribute('aria-current');
      a.classList.remove('nav__link--active');
    });
  };

  const setActiveById = (id) => {
    if (!id) return;
    clearActive();
    const match = navLinks.find((a) => a.getAttribute('href') === `#${id}`);
    if (match) {
      match.setAttribute('aria-current', 'true');
      match.classList.add('nav__link--active');
    }
  };

  if ('IntersectionObserver' in window) {
    const sections = qsa('section[id], header[id], .hero[id]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveById(entry.target.id);
        });
      },
      { root: null, rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
  }

  // When clicking a nav link, set active immediately and close menu
  navLinks.forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const id = href.slice(1);
      setActiveById(id);
      // close mobile menu (existing behavior) and let scroll occur
      setOpen(false);
    });
  });
}

// Añade una animación breve cuando navegás a un anchor (click o cambio de hash)
function initAnchorAnimation() {
  const highlight = (id) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('anchor-focus');
    // force reflow
    void el.offsetWidth;
    el.classList.add('anchor-focus');
    window.setTimeout(() => el.classList.remove('anchor-focus'), 700);
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const id = href.slice(1);
    // let browser scroll first, then highlight
    window.setTimeout(() => highlight(id), 120);
  });

  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    window.setTimeout(() => highlight(id), 50);
  });

  // on load with hash
  if (location.hash) {
    const id = location.hash.slice(1);
    window.setTimeout(() => highlight(id), 120);
  }
}

initAnchorAnimation();

function initCarousel() {
  const root = qs('[data-carousel]');
  if (!root) return;

  const track = qs('[data-carousel-track]', root);
  const prev = qs('[data-carousel-prev]', root);
  const next = qs('[data-carousel-next]', root);
  const dots = qs('[data-carousel-dots]', root);

  if (!track || !prev || !next || !dots) return;

  const slides = qsa('.slide', track);
  if (slides.length === 0) return;

  let dotButtons = [];
  let pages = slides.length;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const getGapPx = () => {
    const cs = window.getComputedStyle(track);
    const value = cs.columnGap || cs.gap || '0px';
    const num = Number.parseFloat(value);
    return Number.isFinite(num) ? num : 0;
  };

  const getSlidesPerView = () => {
    const trackWidth = track.getBoundingClientRect().width;
    const slideWidth = slides[0]?.getBoundingClientRect().width || trackWidth;
    const gap = getGapPx();
    const perView = Math.floor((trackWidth + gap) / (slideWidth + gap));
    return Math.max(1, perView);
  };

  const getPages = () => {
    const perView = getSlidesPerView();
    return Math.max(1, slides.length - perView + 1);
  };

  const scrollToPage = (pageIndex) => {
    const index = clamp(pageIndex, 0, pages - 1);
    slides[index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };

  const createDot = (pageIndex) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dotBtn';
    btn.setAttribute('aria-label', `Ir a la página ${pageIndex + 1}`);
    btn.addEventListener('click', () => scrollToPage(pageIndex));
    return btn;
  };

  const getActiveIndex = () => {
    const trackRect = track.getBoundingClientRect();
    const distances = slides.map((s) => {
      const r = s.getBoundingClientRect();
      return Math.abs(r.left - trackRect.left);
    });
    let best = 0;
    for (let i = 1; i < distances.length; i++) {
      if (distances[i] < distances[best]) best = i;
    }
    return best;
  };

  const getActivePage = () => clamp(getActiveIndex(), 0, pages - 1);

  const rebuildDots = () => {
    pages = getPages();

    dots.innerHTML = '';
    dotButtons = Array.from({ length: pages }, (_, i) => {
      const b = createDot(i);
      dots.appendChild(b);
      return b;
    });

    dots.toggleAttribute('hidden', pages <= 1);
    setActiveDot();
  };

  const setActiveDot = () => {
    const active = getActivePage();
    dotButtons.forEach((b, i) => b.setAttribute('aria-current', i === active ? 'true' : 'false'));
  };

  const scrollByOne = (dir) => {
    const active = getActivePage();
    scrollToPage(active + dir);
  };

  prev.addEventListener('click', () => scrollByOne(-1));
  next.addEventListener('click', () => scrollByOne(1));

  track.addEventListener('scroll', () => {
    window.clearTimeout(track.__dotTimer);
    track.__dotTimer = window.setTimeout(setActiveDot, 60);
  });

  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByOne(-1);
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByOne(1);
    }
  });

  rebuildDots();

  window.addEventListener('resize', () => {
    window.clearTimeout(track.__resizeTimer);
    track.__resizeTimer = window.setTimeout(rebuildDots, 120);
  });
}

function initMembers() {
  const grid = qs('[data-members-grid]');
  if (!grid) return;

  const members = [
    {  
      id: 'gerente',
      name: 'Emanuel Fernández',
      role: 'Gerente — Finanzas & Proveedores',
      img: 'assets/miembros/manuF.png',
      short: 'Coordina el negocio, finanzas y proveedores; no gestiona turnos.',
      desc: 'Lidera la parte administrativa: controla finanzas, pagos a los clientes y relaciones con proveedores. No se encarga del registro de turnos ni la operación diaria sobre las mesas.',
      focus: 'Finanzas, compras y relaciones con proveedores.',
      work: 'Gestiona facturación, pagos y acuerdos con proveedores; define prioridades estratégicas para el local.',
    },
    {
      id: 'soporte',
      name: 'Gastón Ituarte',
      role: 'Soporte técnico / Programador web',
      img: 'assets/miembros/gasty.png',
      short: 'Mantiene los equipos y desarrolla mejoras en la web del ciber.',
      desc: 'Responsable del mantenimiento de PCs y consolas, y del desarrollo y mantenimiento de la página: arregla scripts, implementa features y mantiene integraciones con WhatsApp y formularios.',
      focus: 'Soporte de hardware, redes y desarrollo web (front-end/pequeñas integraciones).',
      work: 'Actualiza la web, corrige bugs, optimiza rendimiento y asegura que las integraciones funcionen correctamente.',
    },
    {
      id: 'eventos',
      name: 'Paolo Zelarayan',
      role: 'Coordinación de torneos',
      img: 'assets/miembros/paoloZ.png',
      short: 'Arma brackets, reglas y premios para la comunidad.',
      desc: 'Planifica torneos semanales y ranking mensual: define formatos, controla inscripciones, comunica reglas y ayuda a moderar para que no haya trampas.',
      focus: 'Organización de torneos, ranking mensual, moderación y comunicación con jugadores.',
      work: 'Publica fechas, registra resultados y coordina premios con el gerente.',
    },
    {
      id: 'eventos2',
      name: 'Enzo Fernandez',
      role: 'Coordinación de torneos',
      img: 'assets/miembros/enzoF.png',
      short: 'Apoya en la logística y comunicación de eventos.',
      desc: 'Colabora en la planificación de eventos, gestiona inscripciones y comunica resultados; ayuda en la moderación durante torneos.',
      focus: 'Logística de eventos, comunicación y soporte en torneos.',
      work: 'Asiste en la inscripción, coordinación de bracket y comunicación con participantes.',
    },
    {
      id: 'barra',
      name: 'Milagros Moreno',
      role: 'Snacks & atención',
      img: 'assets/miembros/mili.png',
      short: 'Hace que la experiencia sea completa: comida, bebida y orden.',
      desc: 'Gestiona stock de snacks y bebidas, mantiene orden y limpieza, y ayuda con la atención para que los turnos se respeten.',
      focus: 'Stock y ventas, orden y limpieza, apoyo en atención y turnos.',
      work: 'Revisa reposición, registra ventas y mantiene el espacio prolijo.',
    },
    {
      id: 'limpieza',
      name: 'Emanuel Corbalan',
      role: 'Limpieza & Mantenimiento',
      img: 'assets/miembros/corbalan.png',
      short: 'Encargado de limpieza del local, baños y mantenimiento de máquinas.',
      desc: 'Se ocupa de la limpieza diaria del local, mantenimiento básico de equipos y la higiene de baños y zonas comunes para asegurar un espacio cómodo.',
      focus: 'Limpieza, mantenimiento preventivo y revisión de máquinas.',
      work: 'Realiza limpieza profunda, revisa el estado de las máquinas y reporta incidencias al soporte.',
    },
  ];

  grid.innerHTML = members
    .map(
      (m) => `
      <article class="memberCard" data-member-card data-member-id="${m.id}" tabindex="0" role="button" aria-label="Ver más: ${escapeHtml(m.name)}">
        <img class="memberCard__img" src="${m.img}" alt="" />
        <div class="memberCard__body">
          <div class="memberCard__name">${escapeHtml(m.name)}</div>
          <div class="memberCard__role">${escapeHtml(m.role)}</div>
          <p class="memberCard__text">${escapeHtml(m.short)}</p>
          <div class="memberCard__actions">
            <button class="btn btn--ghost" type="button" data-member-more aria-label="Abrir detalles de ${escapeHtml(m.name)}">Ver más</button>
          </div>
        </div>
      </article>
    `
    )
    .join('');

  const modal = qs('[data-modal]');
  const backdrop = qs('[data-modal-backdrop]');
  const closeButtons = qsa('[data-modal-close]');

  const img = qs('[data-modal-img]');
  const title = qs('[data-modal-title]');
  const role = qs('[data-modal-role]');
  const desc = qs('[data-modal-desc]');
  const focus = qs('[data-modal-focus]');
  const work = qs('[data-modal-work]');

  let lastActive = null;

  const setModalOpen = (open) => {
    if (!modal) return;

    if (open) {
      lastActive = document.activeElement;
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const close = qs('[data-modal-close]');
      close?.focus();
    } else {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastActive && typeof lastActive.focus === 'function') lastActive.focus();
    }
  };

  const openFor = (member) => {
    if (!modal || !member) return;
    img.src = member.img;
    img.alt = '';
    title.textContent = member.name;
    role.textContent = member.role;
    desc.textContent = member.desc;
    focus.textContent = member.focus;
    work.textContent = member.work;
    setModalOpen(true);
  };

  // Click on internal "Ver más" button
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-member-more]');
    if (!btn) return;
    const card = e.target.closest('[data-member-card]');
    const id = card?.getAttribute('data-member-id');
    const member = members.find((m) => m.id === id);
    openFor(member);
  });

  // Make entire card clickable/tappable: delegate clicks on the card itself
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('[data-member-card]');
    if (!card) return;
    // if the click came from the inner button, ignore (already handled)
    if (e.target.closest('[data-member-more]')) return;
    const id = card.getAttribute('data-member-id');
    const member = members.find((m) => m.id === id);
    openFor(member);
  });

  // Allow keyboard activation when card is focused
  grid.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-member-card]');
    if (!card) return;
    e.preventDefault();
    const id = card.getAttribute('data-member-id');
    const member = members.find((m) => m.id === id);
    openFor(member);
  });

  // Close handlers: buttons, backdrop, Escape key
  closeButtons.forEach((b) => b.addEventListener('click', () => setModalOpen(false)));

  // Delegated handler (robust if DOM changes)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('[data-modal-close]');
    if (btn) setModalOpen(false);
  });

  backdrop?.addEventListener('click', () => setModalOpen(false));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) setModalOpen(false);
  });

  // Focus trap inside modal
  modal?.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = getFocusable(modal);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getFocusable(root) {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];
  return qsa(selectors.join(','), root).filter((el) => {
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const mark = (el, delayMs = 0) => {
    if (!el || el.classList.contains('reveal')) return;
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', `${delayMs}ms`);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
  );

  const sectionContainers = qsa('main .section .container');
  sectionContainers.forEach((container) => {
    const blocks = Array.from(container.children).filter(Boolean);
    blocks.forEach((el, i) => {
      const delay = Math.min(i * 90, 240);
      mark(el, delay);
      observer.observe(el);
    });

    const nested = qsa('.timelineItem, .feature, .panel, .memberCard, .about, .card, .quote', container);
    nested.forEach((el, i) => {
      const delay = Math.min(i * 70, 280);
      mark(el, delay);
      observer.observe(el);
    });
  });

  const footerInner = qs('.footer__inner');
  if (footerInner) {
    const items = Array.from(footerInner.children).filter(Boolean);
    items.forEach((el, i) => {
      const delay = Math.min(i * 90, 240);
      mark(el, delay);
      observer.observe(el);
    });
  }
}

initLoader();
initNav();
initCarousel();
initMembers();
initReveal();
