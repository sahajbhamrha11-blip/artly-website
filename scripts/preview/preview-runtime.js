(function () {
  var views = document.querySelectorAll(".view");
  var navLinks = document.querySelectorAll('nav[aria-label="Main"] a');
  var menu = document.getElementById("mobile-menu");
  var burger = document.querySelector('[aria-controls="mobile-menu"]');

  function setMenu(open) {
    if (!menu || !burger) return;
    menu.classList.toggle("[clip-path:inset(0_0_0_0)]", open);
    menu.classList.toggle("[clip-path:inset(0_0_100%_0)]", !open);
    menu.classList.toggle("pointer-events-none", !open);
    burger.setAttribute("aria-expanded", String(open));
    var bars = burger.querySelectorAll("span span");
    if (bars[0]) { bars[0].classList.toggle("top-0", !open); bars[0].classList.toggle("top-1.5", open); bars[0].classList.toggle("rotate-45", open); }
    if (bars[1]) { bars[1].classList.toggle("top-3", !open); bars[1].classList.toggle("top-1.5", open); bars[1].classList.toggle("-rotate-45", open); }
    menu.querySelectorAll("nav a").forEach(function (a, i) {
      a.classList.toggle("opacity-0", !open); a.classList.toggle("translate-y-6", !open);
      a.classList.toggle("opacity-100", open); a.classList.toggle("translate-y-0", open);
      a.style.transitionDelay = open ? 150 + i * 70 + "ms" : "0ms";
    });
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (burger) burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });

  // Product catalogue filtering
  var catView = document.querySelector('[data-view="products"]');
  var activeCat = "";
  function applyFilter() {
    if (!catView) return;
    var q = (catView.querySelector("#product-search") || {}).value || "";
    q = q.trim().toLowerCase();
    var shown = 0;
    catView.querySelectorAll("article").forEach(function (card) {
      var wrap = card.parentElement;
      var label = (card.querySelector("span") || {}).textContent || "";
      var okCat = !activeCat || label.trim().toLowerCase() === activeCat;
      var okQ = !q || card.textContent.toLowerCase().indexOf(q) !== -1;
      var show = okCat && okQ;
      wrap.style.display = show ? "" : "none";
      if (show) shown++;
    });
    var count = catView.querySelector('p[aria-live="polite"]');
    if (count) count.textContent = shown + (shown === 1 ? " product" : " products");
    catView.querySelectorAll('[role="tab"]').forEach(function (t) {
      var name = t.textContent.replace(/\(\d+\)/, "").trim().toLowerCase();
      var on = (name === "all" && !activeCat) || name === activeCat;
      t.setAttribute("aria-selected", String(on));
      t.classList.toggle("bg-charcoal", on); t.classList.toggle("text-paper", on);
      t.classList.toggle("text-charcoal", !on); t.classList.toggle("hover:bg-sand", !on);
    });
  }
  if (catView) {
    catView.querySelectorAll('[role="tab"]').forEach(function (t) {
      t.addEventListener("click", function () {
        var name = t.textContent.replace(/\(\d+\)/, "").trim().toLowerCase();
        activeCat = name === "all" ? "" : name;
        applyFilter();
      });
    });
    var s = catView.querySelector("#product-search");
    if (s) s.addEventListener("input", applyFilter);
    var f = catView.querySelector('form[role="search"]');
    if (f) f.addEventListener("submit", function (e) { e.preventDefault(); applyFilter(); });
  }

  // Forms are disabled in the preview
  document.querySelectorAll('form[aria-label="Enquiry form"]').forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector(".preview-toast")) return;
      var p = document.createElement("p");
      p.className = "preview-toast sm:col-span-2";
      p.textContent = "This is a design preview — enquiries are switched off here. On the live website this form saves the enquiry and notifies ARTLY.";
      form.appendChild(p);
    });
  });

  function route() {
    var h = (location.hash || "#home").slice(1);
    var target = h, cat = "";
    if (h.indexOf("products-") === 0) { target = "products"; cat = h.slice(9).replace(/-/g, " "); }
    var view = document.querySelector('[data-view="' + target + '"]');
    if (!view) {
      var el = document.getElementById(h);
      if (el) { el.scrollIntoView({ behavior: "smooth" }); return; }
      target = "home"; view = document.querySelector('[data-view="home"]');
    }
    views.forEach(function (v) { v.hidden = v !== view; });
    if (target === "products") { activeCat = cat; applyFilter(); }
    var section = target.indexOf("product") === 0 ? "products" : target;
    navLinks.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + section;
      a.classList.toggle("text-red", on);
      a.classList.toggle("text-charcoal", !on);
    });
    setMenu(false);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
})();
