/**
 * Dejobe — Premium Animations v3
 * Splash intro, cursor system, data streams, text scramble,
 * magnetic buttons, 3D tilt, parallax, scroll progress, ripples
 */

document.addEventListener("DOMContentLoaded", () => {

  /* ═══ Splash Intro Sequence ═════════════════════════════ */
  const splash = document.getElementById("splash");
  if (splash) {
    document.body.style.overflow = "hidden";

    // Spawn particles at 1.2s
    setTimeout(() => {
      const container = document.getElementById("splashParticles");
      for (let i = 0; i < 30; i++) {
        const p = document.createElement("div");
        p.className = "splash-particle";
        const angle = (Math.PI * 2 * i) / 30;
        const dist = 100 + Math.random() * 200;
        p.style.setProperty("--px", Math.cos(angle) * dist + "px");
        p.style.setProperty("--py", Math.sin(angle) * dist + "px");
        p.style.animationDelay = (Math.random() * 0.3) + "s";
        p.style.width = (2 + Math.random() * 4) + "px";
        p.style.height = p.style.width;
        container.appendChild(p);
      }
    }, 1200);

    // Shrink logo → fly to navbar logo position at 2.5s
    setTimeout(() => {
      const navLogo = document.querySelector(".logo img");
      const splashLogo = document.getElementById("splashLogo");
      if (navLogo && splashLogo) {
        // Stop CSS animation so we can control transform
        splashLogo.style.animation = "none";

        const target = navLogo.getBoundingClientRect();
        const vpCx = window.innerWidth / 2;
        const vpCy = window.innerHeight / 2;
        // Logo is centered in splash, so its center = viewport center
        const dx = (target.left + target.width / 2) - vpCx;
        const dy = (target.top + target.height / 2) - vpCy;
        const scale = target.width / splashLogo.offsetWidth;

        splashLogo.style.transition = "transform 0.8s cubic-bezier(.6,0,.4,1), opacity 0.8s ease";
        // Force reflow
        splashLogo.offsetHeight;
        splashLogo.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
        splashLogo.style.opacity = "0";
      }
      // Fade rings & text
      splash.classList.add("shrink");
    }, 2500);

    // Remove splash at 3.3s
    setTimeout(() => {
      splash.classList.add("done");
      document.body.style.overflow = "";
      setTimeout(() => splash.remove(), 600);
    }, 3300);
  }

  /* ═══ Cursor System — dot + ring + glow with lerp ════════ */
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  const glow = document.getElementById("cursorGlow");

  if (dot && window.innerWidth > 900) {
    let mx = 0, my = 0;
    let dx = 0, dy = 0;
    let rx = 0, ry = 0;
    let gx = 0, gy = 0;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });

    const interactives = "a,button,.btn-glow,.stab,.feat-card,.mockup,.step-card,.nav-btn,.dl-card";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(interactives)) {
        dot.classList.add("hovering");
        ring.classList.add("hovering");
      }
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(interactives)) {
        dot.classList.remove("hovering");
        ring.classList.remove("hovering");
      }
    });

    function animateCursor() {
      dx += (mx - dx) * 0.8;
      dy += (my - dy) * 0.8;
      dot.style.left = dx + "px";
      dot.style.top = dy + "px";

      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";

      gx += (mx - gx) * 0.06;
      gy += (my - gy) * 0.06;
      glow.style.left = gx + "px";
      glow.style.top = gy + "px";

      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  } else {
    [dot, ring, glow].forEach(el => { if (el) el.style.display = "none"; });
  }

  /* ═══ Scroll Progress Bar ═══════════════════════════════ */
  const progressBar = document.createElement("div");
  progressBar.id = "scrollProgress";
  document.body.appendChild(progressBar);

  /* ═══ Full-Page Canvas — Data Stream + Mouse Repel ═══════ */
  const canvas = document.getElementById("heroCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let W, H, streams = [], mouseX = -1000, mouseY = -1000;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    class Stream {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.ox = this.x;
        this.y = -20 - Math.random() * H;
        this.speed = 0.4 + Math.random() * 1.5;
        this.len = 30 + Math.random() * 100;
        this.alpha = 0.02 + Math.random() * 0.07;
        this.w = 0.5 + Math.random() * 1;
      }
      draw() {
        this.y += this.speed;
        if (this.y > H + this.len) this.reset();

        // Mouse repel
        const ddx = this.ox - mouseX;
        const ddy = this.y - mouseY;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < 150) {
          this.x = this.ox + (ddx / dist) * (150 - dist) * 0.3;
        } else {
          this.x += (this.ox - this.x) * 0.05;
        }

        const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y - this.len);
        grad.addColorStop(0, `rgba(34,211,238,${this.alpha})`);
        grad.addColorStop(0.6, `rgba(34,211,238,${this.alpha * 0.3})`);
        grad.addColorStop(1, "transparent");
        ctx.strokeStyle = grad;
        ctx.lineWidth = this.w;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y - this.len);
        ctx.stroke();

        // Bright head
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,211,238,${this.alpha * 3})`;
        ctx.fill();
      }
    }

    function init() {
      resize();
      streams = Array.from({ length: 60 }, () => new Stream());
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.7, H * 0.3, W * 0.5);
      g.addColorStop(0, "rgba(34,211,238,0.04)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      streams.forEach(s => s.draw());
      requestAnimationFrame(loop);
    }

    init();
    loop();
    window.addEventListener("resize", resize, { passive: true });
  }

  /* ═══ Text Scramble on Hover ════════════════════════════ */
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
  function scramble(el) {
    const original = el.dataset.text || el.textContent;
    el.dataset.text = original;
    let iteration = 0;
    const iv = setInterval(() => {
      el.textContent = original.split("").map((c, i) => {
        if (i < iteration) return original[i];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join("");
      if (iteration >= original.length) clearInterval(iv);
      iteration += 1 / 2;
    }, 30);
  }
  document.querySelectorAll(".feat-card h3").forEach(h => {
    h.addEventListener("mouseenter", () => scramble(h));
  });

  /* ═══ Magnetic Buttons ══════════════════════════════════ */
  document.querySelectorAll(".btn-glow, .nav-btn").forEach(btn => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });

  /* ═══ Click Ripple ══════════════════════════════════════ */
  document.querySelectorAll(".btn-glow, .stab, .nav-btn").forEach(btn => {
    btn.addEventListener("click", function(e) {
      const ripple = document.createElement("span");
      const r = this.getBoundingClientRect();
      const sz = Math.max(r.width, r.height) * 2;
      ripple.style.cssText = `
        position:absolute;width:${sz}px;height:${sz}px;
        left:${e.clientX - r.left - sz / 2}px;
        top:${e.clientY - r.top - sz / 2}px;
        background:rgba(255,255,255,.2);border-radius:50%;
        transform:scale(0);animation:rippleOut .6s ease-out forwards;
        pointer-events:none;z-index:10;
      `;
      this.style.position = "relative";
      this.style.overflow = "hidden";
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  /* ═══ Feature Card — Expand to Center on Hover ═══════════ */
  const overlay = document.createElement("div");
  overlay.id = "cardOverlay";
  document.body.appendChild(overlay);

  let expandedCard = null;
  let expandTimeout = null;

  document.querySelectorAll("[data-tilt]").forEach(card => {
    // Store spotlight
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
    });

    card.addEventListener("mouseenter", () => {
      // Delay to avoid accidental trigger
      expandTimeout = setTimeout(() => {
        if (expandedCard) return;
        expandedCard = card;

        const rect = card.getBoundingClientRect();
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const cardCx = rect.left + rect.width / 2;
        const cardCy = rect.top + rect.height / 2;
        const dx = cx - cardCx;
        const dy = cy - cardCy;

        // Show overlay
        overlay.classList.add("active");

        // Expand card
        card.classList.add("feat-expanded");
        card.style.transform = `translate(${dx}px, ${dy}px) scale(1.6)`;
        card.style.zIndex = "1000";
      }, 400);
    });

    let closeTimeout = null;

    card.addEventListener("mouseleave", () => {
      clearTimeout(expandTimeout);
      if (expandedCard === card) {
        // Stay expanded for 2 seconds
        closeTimeout = setTimeout(() => {
          card.classList.remove("feat-expanded");
          card.style.transform = "";
          card.style.zIndex = "";
          overlay.classList.remove("active");
          expandedCard = null;
        }, 1000);
      }
    });

    card.addEventListener("mouseenter", () => {
      // Cancel close if user comes back
      clearTimeout(closeTimeout);
    });
  });

  // Close on overlay click
  overlay.addEventListener("click", () => {
    if (expandedCard) {
      expandedCard.classList.remove("feat-expanded");
      expandedCard.style.transform = "";
      expandedCard.style.zIndex = "";
      overlay.classList.remove("active");
      expandedCard = null;
    }
  });

  /* ═══ Scroll-driven Effects ═════════════════════════════ */
  let scrollTicking = false;
  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = (y / docH) * 100;

      // Progress bar
      progressBar.style.width = pct + "%";

      // Navbar
      if (y > 300 && y > lastY + 3) nav.style.transform = "translateY(-100%)";
      else nav.style.transform = "translateY(0)";
      nav.style.background = y > 60 ? "rgba(6,10,20,.95)" : "rgba(6,10,20,.8)";
      lastY = y;

      // Parallax hero text
      const heroLeft = document.querySelector(".hero-left");
      if (heroLeft && y < window.innerHeight) {
        heroLeft.style.transform = `translateY(${y * 0.15}px)`;
        heroLeft.style.opacity = 1 - y / (window.innerHeight * 0.8);
      }

      // Parallax mockup
      const mockup = document.querySelector(".mockup");
      if (mockup && y < window.innerHeight) {
        mockup.style.transform =
          `perspective(1200px) rotateY(${-3 + y * 0.005}deg) rotateX(${2 - y * 0.003}deg) translateY(${y * 0.08}px)`;
      }

      scrollTicking = false;
    });
  }, { passive: true });

  /* ═══ Navbar ref ════════════════════════════════════════ */
  const nav = document.getElementById("navbar");
  let lastY = 0;

  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");
  if (burger) burger.addEventListener("click", () => navLinks.classList.toggle("open"));

  /* ═══ Scroll Reveal with Stagger ════════════════════════ */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        // Stagger children
        const parent = e.target;
        const cards = parent.querySelectorAll("[data-reveal]");
        if (cards.length) {
          cards.forEach((c, i) => setTimeout(() => c.classList.add("shown"), i * 100));
        }
        parent.classList.add("shown");
        revealObs.unobserve(parent);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

  document.querySelectorAll("[data-reveal]").forEach(el => revealObs.observe(el));

  /* ═══ Counters with Easing ══════════════════════════════ */
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  const cObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target.querySelector(".speed-num");
      const target = parseInt(e.target.dataset.count);
      const suffix = e.target.dataset.suffix || "";
      const duration = 2000;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.round(easeOutQuart(progress) * target);
        el.textContent = value.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      cObs.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll(".speed-item").forEach(s => cObs.observe(s));

  /* ═══ Screenshot Tabs — Auto-Slide Carousel ═════════════ */
  const tabs = document.querySelectorAll(".stab");
  const sImg = document.getElementById("showcaseImg");
  let currentTab = 0;
  let autoSlideTimer = null;

  function switchTab(idx) {
    if (idx === currentTab) return;
    const dir = idx > currentTab ? 1 : -1;
    tabs.forEach(x => x.classList.remove("active"));
    tabs[idx].classList.add("active");

    // Slide out
    sImg.style.transform = `translateX(${-dir * 40}px)`;
    sImg.style.opacity = "0";
    setTimeout(() => {
      sImg.src = tabs[idx].dataset.src;
      sImg.style.transform = `translateX(${dir * 40}px)`;
      // Slide in
      requestAnimationFrame(() => {
        sImg.style.transform = "translateX(0)";
        sImg.style.opacity = "1";
      });
    }, 280);
    currentTab = idx;
  }

  // Manual click
  tabs.forEach((t, idx) => {
    t.addEventListener("click", () => {
      switchTab(idx);
      resetAutoSlide(); // Restart timer after manual click
    });
  });

  // Auto-slide every 4 seconds
  function startAutoSlide() {
    autoSlideTimer = setInterval(() => {
      const next = (currentTab + 1) % tabs.length;
      switchTab(next);
    }, 4000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  // Pause on hover
  const showcaseSection = document.querySelector(".showcase");
  if (showcaseSection) {
    showcaseSection.addEventListener("mouseenter", () => clearInterval(autoSlideTimer));
    showcaseSection.addEventListener("mouseleave", () => startAutoSlide());
  }

  startAutoSlide();

  /* ═══ Timeline — Progressive Reveal ═════════════════════ */
  const tlLine = document.querySelector(".tl-line-fill");
  const tlDots = document.querySelectorAll(".tl-dot");
  const tlContents = document.querySelectorAll(".tl-content");
  if (tlLine) {
    const tlObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          tlLine.classList.add("active");
          tlDots.forEach((d, i) => {
            setTimeout(() => {
              d.classList.add("lit");
              // Slide in content
              if (tlContents[i]) {
                tlContents[i].style.transform = "translateX(0)";
                tlContents[i].style.opacity = "1";
              }
            }, 500 + i * 500);
          });
          tlObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    tlObs.observe(document.querySelector(".timeline"));

    // Initially hide step contents
    tlContents.forEach(c => {
      c.style.transform = "translateX(20px)";
      c.style.opacity = "0";
      c.style.transition = "all 0.6s cubic-bezier(.16,1,.3,1)";
    });
  }

  /* ═══ Morph Text — Hero accent cycles ═══════════════════ */
  const accentEl = document.querySelector(".accent-glow");
  if (accentEl) {
    window._morphWords = ["8× Faster", "Ultra Fast", "Full Speed", "Lightning"];
    let wordIdx = 0;

    setInterval(() => {
      wordIdx = (wordIdx + 1) % window._morphWords.length;
      const next = window._morphWords[wordIdx];

      // Fade out
      accentEl.style.opacity = "0";
      accentEl.style.transform = "translateY(-8px)";

      setTimeout(() => {
        accentEl.textContent = next;
        accentEl.style.transform = "translateY(8px)";
        // Fade in
        requestAnimationFrame(() => {
          accentEl.style.opacity = "1";
          accentEl.style.transform = "translateY(0)";
        });
      }, 300);
    }, 3000);

    accentEl.style.transition = "opacity 0.3s, transform 0.3s cubic-bezier(.16,1,.3,1)";
  }

  /* ═══ Smooth Anchors ════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute("href"));
      if (t) window.scrollTo({ top: t.offsetTop - 60, behavior: "smooth" });
    });
  });

  /* ═══ Fire & Meteor System — Full Page ═══════════════════ */
  const fireCanvas = document.getElementById("fireCanvas");
  const pageFireCanvas = document.getElementById("pageFireCanvas");
  const dlCard = document.querySelector(".dl-card");
  const dlBtn = document.getElementById("dlBtn");

  if (pageFireCanvas && dlCard && dlBtn) {
    const pfCtx = pageFireCanvas.getContext("2d");
    const fCtx = fireCanvas ? fireCanvas.getContext("2d") : null;
    let embers = [];
    let pageMeteors = [];
    let fireActive = false;
    let fireIntensity = 0;
    let fireRAF = null;

    function resizePageFire() {
      pageFireCanvas.width = window.innerWidth;
      pageFireCanvas.height = window.innerHeight;
      if (fireCanvas) {
        fireCanvas.width = dlCard.offsetWidth;
        fireCanvas.height = dlCard.offsetHeight;
      }
    }
    resizePageFire();
    window.addEventListener("resize", resizePageFire);

    class PageMeteor {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = -20 - Math.random() * 100;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = 4 + Math.random() * 8;
        this.length = 30 + Math.random() * 60;
        this.life = 1;
        this.decay = 0.003 + Math.random() * 0.006;
        this.size = 1.5 + Math.random() * 2.5;
        this.hue = 8 + Math.random() * 30;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
      }
      draw(ctx, intensity) {
        const a = this.life * intensity;
        if (a < 0.01) return;
        const tailX = this.x - this.vx * (this.length / this.vy);
        const tailY = this.y - this.length;
        const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        grad.addColorStop(0, `hsla(${this.hue}, 100%, 70%, ${a})`);
        grad.addColorStop(0.4, `hsla(${this.hue}, 100%, 50%, ${a * 0.5})`);
        grad.addColorStop(1, `hsla(${this.hue}, 100%, 30%, 0)`);
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = this.size * a;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2 * a, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(35, 100%, 85%, ${a * 0.9})`;
        ctx.shadowColor = `hsla(${this.hue}, 100%, 60%, ${a * 0.8})`;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
        if (Math.random() < 0.3) {
          ctx.beginPath();
          ctx.arc(this.x + (Math.random() - 0.5) * 8, this.y - Math.random() * 15, 1 * a, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(40, 100%, 70%, ${a * 0.6})`;
          ctx.fill();
        }
      }
    }

    class Ember {
      constructor(w, h) { this.reset(w, h, true); }
      reset(w, h, initial) {
        this.x = Math.random() * w;
        this.y = initial ? Math.random() * h : h + 5;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = -(1 + Math.random() * 3);
        this.size = 1.5 + Math.random() * 3;
        this.life = 1;
        this.decay = 0.006 + Math.random() * 0.014;
        this.hue = 12 + Math.random() * 28;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        this.vx += (Math.random() - 0.5) * 0.15;
        this.life -= this.decay;
      }
      draw(ctx, intensity) {
        const a = this.life * intensity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * a, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, ${50 + this.life * 20}%, ${a})`;
        ctx.shadowColor = `hsla(${this.hue}, 100%, 60%, ${a * 0.4})`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function fireLoop() {
      const pw = pageFireCanvas.width;
      const ph = pageFireCanvas.height;

      if (fireActive) {
        fireIntensity = Math.min(1, fireIntensity + 0.025);
      } else {
        fireIntensity = Math.max(0, fireIntensity - 0.015);
      }

      if (fireIntensity <= 0) {
        pfCtx.clearRect(0, 0, pw, ph);
        if (fCtx) fCtx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);
        pageFireCanvas.style.opacity = "0";
        dlCard.classList.remove("fire-active");
        fireRAF = null;
        return;
      }

      pageFireCanvas.style.opacity = "1";
      pfCtx.clearRect(0, 0, pw, ph);

      // Top glow
      const topG = pfCtx.createLinearGradient(0, 0, 0, ph * 0.3);
      topG.addColorStop(0, `rgba(255, 30, 0, ${0.06 * fireIntensity})`);
      topG.addColorStop(1, "transparent");
      pfCtx.fillStyle = topG;
      pfCtx.fillRect(0, 0, pw, ph * 0.3);

      // Bottom glow
      const btmG = pfCtx.createLinearGradient(0, ph, 0, ph * 0.6);
      btmG.addColorStop(0, `rgba(255, 50, 0, ${0.08 * fireIntensity})`);
      btmG.addColorStop(1, "transparent");
      pfCtx.fillStyle = btmG;
      pfCtx.fillRect(0, ph * 0.6, pw, ph * 0.4);

      // Side vignettes
      const sL = pfCtx.createLinearGradient(0, 0, pw * 0.15, 0);
      sL.addColorStop(0, `rgba(255, 40, 0, ${0.05 * fireIntensity})`);
      sL.addColorStop(1, "transparent");
      pfCtx.fillStyle = sL;
      pfCtx.fillRect(0, 0, pw * 0.15, ph);
      const sR = pfCtx.createLinearGradient(pw, 0, pw * 0.85, 0);
      sR.addColorStop(0, `rgba(255, 40, 0, ${0.05 * fireIntensity})`);
      sR.addColorStop(1, "transparent");
      pfCtx.fillStyle = sR;
      pfCtx.fillRect(pw * 0.85, 0, pw * 0.15, ph);

      // Spawn & draw page meteors
      if (fireActive && Math.random() < 0.12 && pageMeteors.length < 15) {
        pageMeteors.push(new PageMeteor());
      }
      pageMeteors = pageMeteors.filter(m => {
        m.update();
        if (m.life <= 0 || m.y > ph + 50) return false;
        m.draw(pfCtx, fireIntensity);
        return true;
      });

      // Card embers
      if (fCtx) {
        const cw = fireCanvas.width, ch = fireCanvas.height;
        fCtx.clearRect(0, 0, cw, ch);
        const cG = fCtx.createLinearGradient(0, ch, 0, ch * 0.3);
        cG.addColorStop(0, `rgba(255, 60, 0, ${0.15 * fireIntensity})`);
        cG.addColorStop(0.5, `rgba(255, 100, 20, ${0.05 * fireIntensity})`);
        cG.addColorStop(1, "transparent");
        fCtx.fillStyle = cG;
        fCtx.fillRect(0, 0, cw, ch);
        if (fireActive && embers.length < 60) embers.push(new Ember(cw, ch));
        embers = embers.filter(e => {
          e.update();
          if (e.life <= 0) return false;
          e.draw(fCtx, fireIntensity);
          return true;
        });
      }

      fireRAF = requestAnimationFrame(fireLoop);
    }

    document.addEventListener("mousemove", (e) => {
      const rect = dlBtn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist < 220 && !fireActive) {
        fireActive = true;
        dlCard.classList.add("fire-active");
        if (!fireRAF) fireLoop();
      } else if (dist >= 280 && fireActive) {
        fireActive = false;
      }
    });

    dlBtn.addEventListener("touchstart", () => {
      fireActive = true;
      dlCard.classList.add("fire-active");
      if (!fireRAF) fireLoop();
      setTimeout(() => { fireActive = false; }, 3000);
    }, { passive: true });
  }

});
