/* ===== Novus Automation — interactions & animations ===== */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Nav ---- */
  const nav = document.querySelector(".nav");
  const burger = document.querySelector(".nav-burger");
  const links = document.querySelector(".nav-links");
  const onNav = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  onNav();
  if (burger) burger.addEventListener("click", () => links.classList.toggle("open"));
  if (links) links.addEventListener("click", (e) => { if (e.target.tagName === "A") links.classList.remove("open"); });

  /* ---- Hero parallax: AUTOMATION floats up on scroll ---- */
  const word = document.getElementById("heroWord");
  const head = document.getElementById("heroHead");
  let ticking = false;
  function parallax() {
    const y = window.scrollY;
    if (word) word.style.transform = `translateX(-50%) translateY(${-y * 0.35}px)`;
    if (head) head.style.transform = `translateX(-50%) translateY(${-y * 0.35}px)`;
    ticking = false;
  }
  window.addEventListener("scroll", () => { onNav(); if (!ticking) { requestAnimationFrame(parallax); ticking = true; } }, { passive: true });
  parallax();

  /* ---- Tick dial ---- */
  const ticks = document.querySelector(".dial-ticks");
  if (ticks) {
    let s = "";
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2, c = 100;
      s += `<line x1="${(c+Math.cos(a)*96).toFixed(1)}" y1="${(c+Math.sin(a)*96).toFixed(1)}" x2="${(c+Math.cos(a)*80).toFixed(1)}" y2="${(c+Math.sin(a)*80).toFixed(1)}" stroke="rgba(255,255,255,.75)" stroke-width="2" stroke-linecap="round"/>`;
    }
    ticks.innerHTML = s;
  }

  /* ---- Count-up ---- */
  function countUp(el) {
    const target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || "", dur = 1500, start = performance.now();
    const isDial = el.classList.contains("dial-num");
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const val = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (isDial) el.firstChild.nodeValue = val; else el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  /* ---- Reveal on scroll ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".reveal-up,.reveal-left,.reveal-right,.reveal-blur").forEach((el) => io.observe(el));

  /* ---- Counters trigger ---- */
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      if (el.classList.contains("dial-num")) { countUp(el); el.closest(".dial").classList.add("spin"); }
      else countUp(el);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => {
    if (el.classList.contains("dial")) {
      const num = el.querySelector(".dial-num");
      num.dataset.count = el.dataset.count; num.dataset.suffix = el.dataset.suffix || "";
      cio.observe(num);
    } else cio.observe(el);
  });

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.parentElement, open = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
      if (!open) item.classList.add("open");
    });
  });

  /* ---- Contact form: emails submissions to novus.reachus@gmail.com ---- */
  const form = document.getElementById("contactForm");
  if (form) {
    const TO = "novus.reachus@gmail.com";
    const val = (n) => (form.elements[n] && form.elements[n].value || "").trim();
    const showSuccess = () => { form.classList.add("sent"); form.scrollIntoView({ behavior: "smooth", block: "center" }); };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const endpoint = form.getAttribute("action") || "";

      // Fallback until a Formspree ID is set: open the visitor's mail client, pre-addressed to you
      if (!endpoint || endpoint.includes("YOUR_FORM_ID")) {
        const body = [
          `Name: ${val("name")}`,
          `Email: ${val("email")}`,
          `Agency: ${val("agency")}`,
          `Interested in: ${val("plan")}`,
          "", val("message"),
        ].join("\n");
        window.location.href = `mailto:${TO}?subject=${encodeURIComponent("New enquiry — Novus Automation website")}&body=${encodeURIComponent(body)}`;
        showSuccess();
        return;
      }

      // Real submission: POST to Formspree, which emails you directly
      const btn = form.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      try {
        const res = await fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (res.ok) showSuccess();
        else alert(`Sorry, something went wrong. Please email us directly at ${TO}.`);
      } catch {
        alert(`Network error. Please email us directly at ${TO}.`);
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = "Send message"; }
      }
    });
  }

  /* ---- Testimonials: duplicate tracks for seamless vertical marquee ---- */
  if (!reduce) {
    document.querySelectorAll(".testi-track").forEach((track) => {
      const clone = track.cloneNode(true);
      // hide clones from assistive tech / crawlers so quotes aren't read twice
      clone.querySelectorAll(":scope > *").forEach((n) => n.setAttribute("aria-hidden", "true"));
      while (clone.firstChild) track.appendChild(clone.firstChild);
    });
  }
})();
