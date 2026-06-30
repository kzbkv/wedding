/* ==========================================================================
   ARMANBEK & AMINA — WEDDING INVITATION
   script.js — gate, music, particles, countdown, reveal, RSVP
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* WEDDING DATE CONFIG                                                  */
  /* ------------------------------------------------------------------ */
  // 13 September 2026, 17:00, Almaty local time
  var WEDDING_DATE = new Date('2026-09-13T17:00:00+06:00').getTime();

  /* ------------------------------------------------------------------ */
  /* DOM REFERENCES                                                       */
  /* ------------------------------------------------------------------ */
  var gate = document.getElementById('gate');
  var openBtn = document.getElementById('open-btn');
  var site = document.getElementById('site');
  var music = document.getElementById('bg-music');
  var soundToggle = document.getElementById('sound-toggle');
  var mapLink = document.getElementById('map-link');

  /* ------------------------------------------------------------------ */
  /* 2GIS LINK                                                             */
  /* Ссылка на заведение уже прописана прямо в index.html (href у        */
  /* #map-link), здесь её переопределять больше не нужно.                */
  /* ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------ */
  /* GATE: open the invitation                                            */
  /* ------------------------------------------------------------------ */
  function openInvitation() {
    if (!gate || !site) return;

    gate.classList.add('gate--hidden');
    site.removeAttribute('aria-hidden');

    // allow the fade-in transition to play
    requestAnimationFrame(function () {
      site.classList.add('site--visible');
    });

    // try to start background music (file is a placeholder for now)
    if (music) {
      music.volume = 0.55;
      music.play().then(function () {
        if (soundToggle) soundToggle.classList.add('is-playing');
      }).catch(function () {
        // Autoplay may be blocked by the browser — that's fine,
        // the listener can use the sound toggle manually.
      });
    }

    // lock scroll on the gate, then release it for the site
    document.body.style.overflow = '';

    // remove gate from the accessibility tree / tab order after transition
    window.setTimeout(function () {
      gate.style.display = 'none';
    }, 1200);
  }

  if (openBtn) {
    openBtn.addEventListener('click', openInvitation);
  }

  // lock initial scroll so the gate is the only thing visible
  document.body.style.overflow = 'hidden';

  /* ------------------------------------------------------------------ */
  /* SOUND TOGGLE                                                         */
  /* ------------------------------------------------------------------ */
  if (soundToggle && music) {
    soundToggle.addEventListener('click', function () {
      if (music.paused) {
        music.play().catch(function () {});
        soundToggle.classList.add('is-playing');
      } else {
        music.pause();
        soundToggle.classList.remove('is-playing');
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* COUNTDOWN TIMER                                                      */
  /* ------------------------------------------------------------------ */
  var cdDays = document.getElementById('cd-days');
  var cdHours = document.getElementById('cd-hours');
  var cdMinutes = document.getElementById('cd-minutes');
  var cdSeconds = document.getElementById('cd-seconds');

  function pad(num) {
    return String(num).padStart(2, '0');
  }

  function updateCountdown() {
    var now = Date.now();
    var diff = WEDDING_DATE - now;

    if (diff <= 0) {
      if (cdDays) cdDays.textContent = '00';
      if (cdHours) cdHours.textContent = '00';
      if (cdMinutes) cdMinutes.textContent = '00';
      if (cdSeconds) cdSeconds.textContent = '00';
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (cdDays) cdDays.textContent = pad(days);
    if (cdHours) cdHours.textContent = pad(hours);
    if (cdMinutes) cdMinutes.textContent = pad(minutes);
    if (cdSeconds) cdSeconds.textContent = pad(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ------------------------------------------------------------------ */
  /* SCROLL REVEAL                                                        */
  /* ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // fallback: just show everything
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------ */
  /* RSVP FORM                                                            */
  /* ------------------------------------------------------------------ */
  var rsvpForm = document.getElementById('rsvp-form');
  var rsvpThanks = document.getElementById('rsvp-thanks');

  // Placeholder submit handler — ready to be wired up to Google Sheets
  // via a Google Apps Script Web App endpoint, or any other backend.
  // To connect: replace the body of this function with a fetch() call
  // to your endpoint, sending { name, guests, status }.
  function submitRSVP(data) {
    return new Promise(function (resolve) {
      // Example for future Google Sheets integration:
      //
      // fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // }).then(resolve);

      console.log('RSVP submitted (placeholder):', data);
      window.setTimeout(resolve, 300);
    });
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (event) {
      event.preventDefault();

      var formData = new FormData(rsvpForm);
      var data = {
        name: (formData.get('name') || '').toString().trim(),
        guests: Number(formData.get('guests')) || 1,
        status: formData.get('status')
      };

      if (!data.name) {
        var nameInput = document.getElementById('guest-name');
        if (nameInput) nameInput.focus();
        return;
      }

      var submitBtn = rsvpForm.querySelector('.rsvp-form__submit');
      if (submitBtn) submitBtn.setAttribute('disabled', 'true');

      submitRSVP(data).then(function () {
        rsvpForm.hidden = true;
        if (rsvpThanks) rsvpThanks.hidden = false;
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* AMBIENT GOLD PARTICLES (canvas)                                      */
  /* ------------------------------------------------------------------ */
  var canvas = document.getElementById('particles-canvas');

  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var width, height;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      width = canvas.width = window.innerWidth * devicePixelRatio;
      height = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }

    function createParticles() {
      var count = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 28000));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: (Math.random() * 1.6 + 0.6) * devicePixelRatio,
          speedY: (Math.random() * 0.18 + 0.05) * devicePixelRatio,
          speedX: (Math.random() - 0.5) * 0.08 * devicePixelRatio,
          alpha: Math.random() * 0.35 + 0.12,
          drift: Math.random() * Math.PI * 2
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#c9a24b';

      particles.forEach(function (p) {
        p.drift += 0.004;
        p.y -= p.speedY;
        p.x += p.speedX + Math.sin(p.drift) * 0.12;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      if (!reducedMotion) {
        requestAnimationFrame(draw);
      }
    }

    resize();
    createParticles();

    if (!reducedMotion) {
      draw();
    } else {
      draw(); // single static frame
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        resize();
        createParticles();
        if (reducedMotion) draw();
      }, 200);
    });
  }

})();
