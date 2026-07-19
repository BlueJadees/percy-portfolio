/* ============================================================
   Animaciones e interacción — compartido por todas las páginas
   (index + páginas de proyecto). Cada bloque se auto-desactiva
   si sus elementos no existen en la página actual.
   ============================================================ */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Barra de progreso de scroll + sombra del header --- */
  var bar = document.getElementById('scroll-progress');
  var head = document.querySelector('header');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    if (head) head.classList.toggle('scrolled', h.scrollTop > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Scrollspy: resalta en el nav la sección visible (solo index) --- */
  var links = document.querySelectorAll('.nav-links a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var linkFor = {};
    links.forEach(function (a) { linkFor[a.getAttribute('href').slice(1)] = a; });

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && linkFor[en.target.id]) {
          links.forEach(function (a) { a.classList.remove('active'); });
          linkFor[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* --- Reveal on scroll con stagger --- */
  if (!reduced && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll(
      /* index */
      '.section-label, .section-title, .contact-intro, .cards > *, ' +
      '.skill-group, .hud, .gh-heatmap-wrap, .contact-bar, ' +
      /* páginas de proyecto */
      '.project-body .container > p, .project-body h2, .feature-grid > *, ' +
      '.shot-placeholder, .project-shot, .tech-list, .hosted-list, .roadmap'
    );
    targets.forEach(function (el) { el.classList.add('reveal'); });

    // stagger entre hijos del mismo grid
    document.querySelectorAll('.cards, .feature-grid, .shot-grid').forEach(function (grid) {
      Array.prototype.forEach.call(grid.children, function (c, i) {
        c.style.setProperty('--rd', (i * 90) + 'ms');
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* --- Spotlight que sigue el mouse en cards y features --- */
  document.querySelectorAll('.card, .feature').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* --- Typewriter del rol en el hero (solo index) --- */
  var typed = document.getElementById('typedRole');
  if (typed && !reduced) {
    var ROLES = [
      'Backend Senior Developer',
      'Indie Game Dev',
      'Líder TI · Full Stack',
      'Santiago, Chile'
    ];
    var ri = 0;
    var ci = ROLES[0].length;
    var deleting = true;

    var tick = function () {
      var word = ROLES[ri];
      if (deleting) {
        ci--;
        typed.textContent = word.slice(0, ci);
        if (ci === 0) {
          deleting = false;
          ri = (ri + 1) % ROLES.length;
          setTimeout(tick, 350);
        } else {
          setTimeout(tick, 32);
        }
      } else {
        ci++;
        typed.textContent = word.slice(0, ci);
        if (ci === word.length) {
          deleting = true;
          setTimeout(tick, 2300);
        } else {
          setTimeout(tick, 58 + Math.random() * 40);
        }
      }
    };
    setTimeout(tick, 2600);
  }

  /* --- Terminal del hero: se escribe sola (solo index) --- */
  var term = document.getElementById('heroTerm');
  if (term) {
    var SCRIPT = [
      { cmd: 'whoami', out: ['percy.muñoz — backend senior dev · indie game dev'] },
      { cmd: 'cat stack.txt', out: ['python · flask · django · sql-server', 'docker · linux · cloudflare · godot 4'] },
      { cmd: 'systemctl status homelab', out: ['● homelab.service — active (running)', '  este sitio se sirve desde mi casa'] }
    ];

    var endLine = function () {
      var p = document.createElement('p');
      p.className = 'terminal-line';
      p.innerHTML = '<span class="prompt">$</span> <span class="cursor">▮</span>';
      term.appendChild(p);
    };

    if (reduced) {
      var html = '';
      SCRIPT.forEach(function (s) {
        html += '<p class="terminal-line"><span class="prompt">$</span> ' + s.cmd + '</p>';
        s.out.forEach(function (o) {
          html += '<p class="terminal-line terminal-out">' + o + '</p>';
        });
      });
      term.innerHTML = html;
      endLine();
    } else {
      var si = 0;

      var nextCmd = function () {
        if (si >= SCRIPT.length) { endLine(); return; }
        var s = SCRIPT[si++];
        var line = document.createElement('p');
        line.className = 'terminal-line';
        line.innerHTML = '<span class="prompt">$</span> <span class="cmd"></span>';
        term.appendChild(line);
        var target = line.querySelector('.cmd');
        var k = 0;

        var typeChar = function () {
          if (k <= s.cmd.length) {
            target.textContent = s.cmd.slice(0, k);
            k++;
            setTimeout(typeChar, 34 + Math.random() * 45);
          } else {
            var oi = 0;
            var printOut = function () {
              if (oi < s.out.length) {
                var p = document.createElement('p');
                p.className = 'terminal-line terminal-out';
                p.textContent = s.out[oi++];
                term.appendChild(p);
                setTimeout(printOut, 150);
              } else {
                setTimeout(nextCmd, 550);
              }
            };
            setTimeout(printOut, 200);
          }
        };
        typeChar();
      };
      setTimeout(nextCmd, 700);
    }
  }
})();
