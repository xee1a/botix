// Botix.pl: drobne interakcje. Bez cookies, bez analityki, bez zewnętrznych skryptów.
(function () {
  // Rok w stopce
  var rok = document.getElementById("rok");
  if (rok) rok.textContent = new Date().getFullYear();

  // Menu mobilne
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("menu");
  if (toggle && nav) {
    var close = function () { toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("open"); };
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("open", !open);
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { close(); toggle.focus(); }
    });
  }

  // Program kursu: robot jedzie od przystanku do przystanku, gdy sekcja jest widoczna
  var journey = document.querySelector("[data-journey]");
  if (journey) {
    var stops = journey.querySelectorAll(".stop");
    var last = stops.length - 1;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var pos = 0, timer = null, moveTimer = null;

    var show = function (p) {
      pos = p;
      journey.style.setProperty("--pos", p);
      stops.forEach(function (s, i) {
        s.classList.toggle("lit", i <= p);
        s.classList.toggle("current", i === p);
      });
      journey.classList.add("moving");
      clearTimeout(moveTimer);
      moveTimer = setTimeout(function () { journey.classList.remove("moving"); }, 1100);
    };
    var tick = function () {
      // na mecie robot chwilę stoi, potem wraca na start
      if (pos === last) { show(0); timer = setTimeout(tick, 1900); return; }
      show(pos + 1);
      timer = setTimeout(tick, pos === last ? 4200 : 1900);
    };

    if (reduce || !("IntersectionObserver" in window)) {
      show(last);
      journey.classList.remove("moving");
    } else {
      show(0);
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          clearTimeout(timer);
          if (e.isIntersecting) timer = setTimeout(tick, 900);
        });
      }, { threshold: 0.15 }).observe(journey);
    }
  }

  // Formularz: walidacja + przygotowanie wiadomości e-mail (mailto). Dane nie trafiają na żaden serwer.
  var form = document.getElementById("zapis-form");
  if (!form) return;
  var err = document.getElementById("form-error");
  var ADRES = "kontakt@botix.pl";

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var pola = [
      [form.szkola, "Podaj nazwę szkoły lub placówki."],
      [form.imie, "Podaj swoje imię."],
      [form.email, "Podaj poprawny adres e-mail."],
      [form.oferta, "Wybierz, co Was interesuje."],
      [form.klasy, "Podaj klasy lub wiek uczniów."]
    ];
    var bledy = [];
    pola.forEach(function (p) {
      var el = p[0];
      el.removeAttribute("aria-invalid");
      var ok = el.value.trim() && (el.type !== "email" || el.checkValidity());
      if (!ok) { bledy.push(p[1]); el.setAttribute("aria-invalid", "true"); }
    });
    if (!form.zgoda.checked) { bledy.push("Zaznacz, że zapoznałeś/aś się z polityką prywatności."); }

    if (bledy.length) {
      err.textContent = bledy.join(" ");
      err.hidden = false;
      (form.querySelector('[aria-invalid="true"]') || form.zgoda).focus();
      return;
    }
    err.hidden = true;

    var temat = "Zajęcia z robotyki Botix: " + form.szkola.value.trim();
    var NL = "\n";
    var tresc =
      "Dzień dobry," + NL + NL + "chcielibyśmy zapytać o zajęcia z robotyki w naszej szkole." + NL + NL +
      "Szkoła / placówka: " + form.szkola.value.trim() + NL +
      "Osoba kontaktowa: " + form.imie.value.trim() + NL +
      "E-mail do odpowiedzi: " + form.email.value.trim() + NL +
      "Interesuje nas: " + form.oferta.value + NL +
      "Klasy / wiek uczniów: " + form.klasy.value.trim() + NL +
      (form.wiadomosc.value.trim() ? NL + "Wiadomość:" + NL + form.wiadomosc.value.trim() + NL : "") +
      NL + "Zapoznałem/am się z polityką prywatności Botix.pl." + NL;

    window.location.href = "mailto:" + ADRES + "?subject=" + encodeURIComponent(temat) + "&body=" + encodeURIComponent(tresc);
  });
})();
