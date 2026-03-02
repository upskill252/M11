// UI helpers (toast + loading + pequenas utilidades)

(function () {
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
      else node.setAttribute(k, v);
    });
    children.forEach((c) => node.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return node;
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("pt-PT", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function toast({ title, message, variant = "ok", timeout = 3200 }) {
    const host = document.getElementById("toastHost");
    if (!host) return;

    const t = el("div", { class: `toast ${variant}`, role: "status" }, [
      el("div", { class: "t-title" }, [
        el("strong", { text: title }),
        el("button", { class: "btn btn-ghost", type: "button", "aria-label": "Fechar" }, ["✕"])
      ]),
      el("p", { text: message || "" })
    ]);

    const closeBtn = t.querySelector("button");
    const remove = () => t.remove();
    closeBtn.addEventListener("click", remove);

    host.appendChild(t);
    window.setTimeout(remove, timeout);
  }

  function setBusy(button, isBusy, busyText = "A processar...") {
    if (!button) return;
    if (isBusy) {
      button.dataset.prevText = button.textContent;
      button.textContent = busyText;
      button.disabled = true;
    } else {
      button.textContent = button.dataset.prevText || button.textContent;
      button.disabled = false;
    }
  }

  window.UI = { el, toast, setBusy, formatDate };
})();
