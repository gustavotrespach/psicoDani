/*
 * Perguntas frequentes, menu mobile, cabeçalho e animações de entrada.
 *
 * O FAQ usa <details>/<summary>: abre e fecha nativamente, inclusive sem JS,
 * e é acessível por teclado e leitores de tela. Este script garante que
 * apenas uma resposta fique aberta por vez, como no comportamento original,
 * também em navegadores que ainda não suportam o atributo name="faq".
 */
(function () {
    "use strict";

    document.documentElement.classList.add("js");

    // FAQ: uma resposta aberta por vez
    var faqItems = document.querySelectorAll(".faq-item");

    Array.prototype.forEach.call(faqItems, function (item) {
        item.addEventListener("toggle", function () {
            if (!item.open) return;
            Array.prototype.forEach.call(faqItems, function (other) {
                if (other !== item && other.open) other.open = false;
            });
        });
    });

    // Cabeçalho muda de fundo ao rolar
    var header = document.querySelector(".site-header");
    function onScroll() {
        if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Animações de entrada ao rolar
    var revealEls = document.querySelectorAll("[data-reveal]");
    if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
        Array.prototype.forEach.call(revealEls, function (el) { observer.observe(el); });
    } else {
        Array.prototype.forEach.call(revealEls, function (el) { el.classList.add("is-visible"); });
    }

    // Menu mobile
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("menu-principal");
    if (!toggle || !nav) return;

    var label = toggle.querySelector(".sr-only");

    function setOpen(open) {
        toggle.setAttribute("aria-expanded", String(open));
        nav.classList.toggle("is-open", open);
        if (label) label.textContent = open ? "Fechar menu" : "Abrir menu";
    }

    toggle.addEventListener("click", function () {
        setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
        if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && nav.classList.contains("is-open")) {
            setOpen(false);
            toggle.focus();
        }
    });

    document.addEventListener("click", function (event) {
        if (!nav.classList.contains("is-open")) return;
        if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 900 && nav.classList.contains("is-open")) setOpen(false);
    });
})();
