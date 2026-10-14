(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
  var sections = links
    .map(function (a) {
      return document.querySelector(a.getAttribute("href"));
    })
    .filter(Boolean);

  function setActive() {
    var current = sections[0];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= 96) current = sections[i];
    }
    links.forEach(function (a) {
      a.classList.toggle("active", current && a.getAttribute("href") === "#" + current.id);
    });
  }

  document.addEventListener("scroll", setActive, { passive: true });
  setActive();

  var toggle = document.querySelector(".toc-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("toc-open");
    });
  }

  links.forEach(function (a) {
    a.addEventListener("click", function () {
      document.body.classList.remove("toc-open");
    });
  });

  var widgetGroup = document.querySelector(".guides-widget");
  if (widgetGroup) {
    if (widgetGroup.querySelector(".guides-widget-inner a.active")) {
      widgetGroup.open = true;
      widgetGroup.classList.add("is-active");
    }
  }
})();
