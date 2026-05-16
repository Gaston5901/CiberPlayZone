const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

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
}

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
      name: 'Nombre Apellido',
      role: 'Gerente',
      img: 'assets/member-placeholder.svg',
      short: 'Coordina el equipo y asegura una experiencia top.',
      desc: 'Supervisa la operación del ciber: organiza turnos, define prioridades, maneja proveedores y cuida que el ambiente sea competitivo pero sano.',
      focus: 'Gestión general, atención al cliente, control de normas y coordinación de eventos.',
      work: 'Escucha feedback, ajusta procesos y mantiene al equipo alineado con los valores.',
    },
    {
      id: 'soporte',
      name: 'Nombre Apellido',
      role: 'Soporte técnico',
      img: 'assets/member-placeholder.svg',
      short: 'Mantiene los equipos listos para jugar sin lag.',
      desc: 'Se encarga del mantenimiento preventivo y correctivo de PCs y consolas, instalación de juegos, periféricos y red. La idea: que todo ande estable y rápido.',
      focus: 'Mantenimiento de equipos, periféricos, red, actualizaciones y rendimiento.',
      work: 'Control de temperaturas, limpieza, drivers, backups de configuración y chequeos.',
    },
    {
      id: 'eventos',
      name: 'Nombre Apellido',
      role: 'Coordinación de torneos',
      img: 'assets/member-placeholder.svg',
      short: 'Arma brackets, reglas y premios para la comunidad.',
      desc: 'Planifica torneos semanales y ranking mensual: define formatos, controla inscripciones, comunica reglas y ayuda a moderar para que no haya trampas.',
      focus: 'Organización de torneos, ranking mensual, moderación y comunicación con jugadores.',
      work: 'Publica fechas, registra resultados y coordina premios con el gerente.',
    },
    {
      id: 'barra',
      name: 'Nombre Apellido',
      role: 'Snacks & atención',
      img: 'assets/member-placeholder.svg',
      short: 'Hace que la experiencia sea completa: comida, bebida y orden.',
      desc: 'Gestiona stock de snacks y bebidas, mantiene orden y limpieza, y ayuda con la atención para que los turnos se respeten.',
      focus: 'Stock y ventas, orden y limpieza, apoyo en atención y turnos.',
      work: 'Revisa reposición, registra ventas y mantiene el espacio prolijo.',
    },
  ];

  grid.innerHTML = members
    .map(
      (m) => `
      <article class="memberCard" data-member-card data-member-id="${m.id}">
        <img class="memberCard__img" src="${m.img}" alt="" />
        <div class="memberCard__body">
          <div class="memberCard__name">${escapeHtml(m.name)}</div>
          <div class="memberCard__role">${escapeHtml(m.role)}</div>
          <p class="memberCard__text">${escapeHtml(m.short)}</p>
          <div class="memberCard__actions">
            <button class="btn btn--ghost" type="button" data-member-more>Ver más</button>
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

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-member-more]');
    if (!btn) return;
    const card = e.target.closest('[data-member-card]');
    const id = card?.getAttribute('data-member-id');
    const member = members.find((m) => m.id === id);
    openFor(member);
  });

  closeButtons.forEach((b) => b.addEventListener('click', () => setModalOpen(false)));
  backdrop?.addEventListener('click', () => setModalOpen(false));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) setModalOpen(false);
  });

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

initNav();
initCarousel();
initMembers();
initReveal();
