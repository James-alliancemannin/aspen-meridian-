/* =========================
   Aspen Meridian — Main JS
   ========================= */

(function(){
  const C = window.ASPEN_CONFIG || {};

  // Inject config-driven text
  const brandEls = document.querySelectorAll("[data-brand]");
  brandEls.forEach(el => el.textContent = C.BRAND_NAME || "ASPEN MERIDIAN");

  const topTag = document.querySelector("[data-top-tagline]");
  if(topTag) topTag.textContent = (C.TAGLINE_TOP || "").replace("##EST_YEAR##", C.EST_YEAR || "2000");

  const phoneEls = document.querySelectorAll("[data-phone]");
  phoneEls.forEach(el => el.textContent = C.PHONE_DISPLAY || "07624 48 80 97");

  const phoneLink = document.querySelector("[data-phone-link]");
  if(phoneLink) phoneLink.setAttribute("href", `tel:${C.PHONE_TEL || "+447624488097"}`);

  const emailEls = document.querySelectorAll("[data-email]");
  emailEls.forEach(el => el.textContent = C.EMAIL_DISPLAY || "enquiries@example.com");

  // Active nav link
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav a").forEach(a=>{
    const href = (a.getAttribute("href")||"").toLowerCase();
    if(href === path) a.classList.add("active");
  });

  // Modal helpers
  const openModal = (id)=>{
    const b = document.getElementById(id);
    if(!b) return;
    b.style.display = "flex";
    document.body.style.overflow = "hidden";
  };
  const closeModal = (id)=>{
    const b = document.getElementById(id);
    if(!b) return;
    b.style.display = "none";
    document.body.style.overflow = "";
  };

  document.querySelectorAll("[data-open-modal]").forEach(btn=>{
    btn.addEventListener("click", ()=> openModal(btn.getAttribute("data-open-modal")));
  });
  document.querySelectorAll("[data-close-modal]").forEach(btn=>{
    btn.addEventListener("click", ()=> closeModal(btn.getAttribute("data-close-modal")));
  });

  // Close on backdrop click
  document.querySelectorAll(".modal-backdrop").forEach(backdrop=>{
    backdrop.addEventListener("click", (e)=>{
      if(e.target === backdrop) backdrop.style.display = "none";
      document.body.style.overflow = "";
    });
  });

  // Cookies
  const setCookie = (name, value, days)=>{
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
  };
  const getCookie = (name)=>{
    const parts = document.cookie.split(";").map(s=>s.trim());
    for(const p of parts){
      if(p.startsWith(name + "=")) return decodeURIComponent(p.substring(name.length+1));
    }
    return null;
  };

  // First visit: Legal modal
  if(C.SHOW_LEGAL_MODAL_ON_FIRST_VISIT){
    const ck = C.LEGAL_COOKIE_NAME || "am_legal_notice_viewed";
    const seen = getCookie(ck);
    if(!seen){
      setTimeout(()=> openModal("legalModal"), 850);
    }
    const acceptBtn = document.getElementById("legalAcceptBtn");
    if(acceptBtn){
      acceptBtn.addEventListener("click", ()=>{
        setCookie(ck, "true", C.LEGAL_COOKIE_DAYS || 365);
        closeModal("legalModal");
        toast("Legal notices acknowledged.");
      });
    }
  }

  // Popup contact form wiring
  const form = document.getElementById("popupContactForm");
  if(form){
    // Inject endpoint
    const endpoint = C.FORM_ENDPOINT || "";
    if(endpoint && endpoint.includes("##") === false){
      form.setAttribute("action", endpoint);
    } else {
      // Leave blank; on submit we show a warning toast
      form.removeAttribute("action");
    }

    form.addEventListener("submit", (e)=>{
      const cb = form.querySelector("input[name='authority_confirm']");
      if(!cb || !cb.checked){
        e.preventDefault();
        toast("Please confirm you are legally authorised to submit the information.");
        return;
      }
      const act = form.getAttribute("action");
      if(!act){
        e.preventDefault();
        toast("Form endpoint not set. Replace ##FORM_ENDPOINT## in assets/config.js.");
      }
    });
  }

  // Exit-intent: gently open the contact modal once (desktop only)
  let exitShown = false;
  document.addEventListener("mouseout", (e)=>{
    if(exitShown) return;
    if(window.innerWidth < 900) return;
    if(e.clientY <= 0){
      exitShown = true;
      openModal("contactModal");
    }
  });

  // Toast
  const toastEl = document.getElementById("toast");
  function toast(msg){
    if(!toastEl) return;
    toastEl.textContent = msg;
    toastEl.style.display = "block";
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(()=> toastEl.style.display = "none", 3400);
  }
})();
