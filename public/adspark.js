(function () {
  function renderSlot(slot) {
    var width = Number(slot.dataset.width);
    var height = Number(slot.dataset.height);
    var ads;

    try {
      ads = JSON.parse(decodeURIComponent(slot.dataset.config || "[]"));
    } catch {
      return;
    }

    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1 || !Array.isArray(ads)) return;
    var active = ads.filter(function (ad) {
      if (!ad || typeof ad.imageUrl !== "string" || typeof ad.destinationUrl !== "string") return false;
      try {
        var destination = new URL(ad.destinationUrl);
        return (destination.protocol === "http:" || destination.protocol === "https:") &&
          /^data:image\\/(gif|jpeg|png);base64,/i.test(ad.imageUrl);
      } catch {
        return false;
      }
    });
    if (!active.length) return;

    var fixed = active.filter(function (ad) { return ad.rotation === "fixed"; });
    var sticky = active.filter(function (ad) { return ad.rotation === "sticky"; });
    var selected = null;

    if (fixed.length) {
      selected = fixed[0];
    } else if (sticky.length) {
      var cookieName = "adspark_" + width + "_" + height;
      var cookie = document.cookie.split("; ").find(function (part) {
        return part.indexOf(cookieName + "=") === 0;
      });
      if (cookie) {
        var saved = decodeURIComponent(cookie.slice(cookieName.length + 1)).split("|");
        selected = sticky.find(function (ad) { return ad.id === saved[0]; }) || null;
        if (Number(saved[1]) <= Date.now()) selected = null;
      }
      if (!selected) {
        selected = sticky[Math.floor(Math.random() * sticky.length)];
        var hours = Math.max(1, Math.min(720, Number(selected.cookieHours) || 24));
        var expiresAt = Date.now() + hours * 60 * 60 * 1000;
        document.cookie = cookieName + "=" + encodeURIComponent(selected.id + "|" + expiresAt) +
          "; Max-Age=" + hours * 60 * 60 + "; Path=/; SameSite=Lax";
      }
    } else {
      var rotating = active.filter(function (ad) { return ad.rotation === "refresh"; });
      var pool = rotating.length ? rotating : active;
      selected = pool[Math.floor(Math.random() * pool.length)];
    }

    if (!selected) return;
    var link = document.createElement("a");
    link.href = selected.destinationUrl;
    link.target = "_blank";
    link.rel = "sponsored noopener noreferrer";
    link.setAttribute("aria-label", selected.altText || "Sponsored advertisement");
    link.style.display = "block";
    link.style.width = "100%";

    var image = document.createElement("img");
    image.src = selected.imageUrl;
    image.alt = selected.altText || "";
    image.width = width;
    image.height = height;
    image.loading = "lazy";
    image.decoding = "async";
    image.style.display = "block";
    image.style.width = "100%";
    image.style.height = height + "px";\n    image.style.objectFit = "contain";
    image.style.maxWidth = "100%";

    link.appendChild(image);
    slot.style.display = "block";
    slot.style.width = width + "px";
    slot.style.maxWidth = "100%";
    slot.replaceChildren(link);
  }

  function init() {
    document.querySelectorAll("[data-adspark-slot]").forEach(renderSlot);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
