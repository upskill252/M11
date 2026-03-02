// stats.html: múltiplas chamadas GET + cards + listas

(function () {
  const totalEl = document.getElementById("statTotal");
  const byStatusEl = document.getElementById("byStatus");
  const byPriorityEl = document.getElementById("byPriority");
  const recentList = document.getElementById("recentList");
  const recentNote = document.getElementById("recentNote");
  const state = document.getElementById("statsState");
  const reloadBtn = document.getElementById("reloadStatsBtn");

  function setState(msg) {
    state.textContent = msg || "";
  }

  function renderKV(container, obj) {
    container.innerHTML = "";
    if (!obj || typeof obj !== "object") {
      container.appendChild(UI.el("div", { class: "muted", text: "—" }));
      return;
    }

    // Ordenação específica pedida:
    // - Status: Open, Work in progress, Closed
    // - Prioridade: Sem prioridade, Baixa, Média, Alta, Crítica
    const orderByContainer = (() => {
      if (container === byStatusEl) return ["Open", "Work in progress", "Closed"];
      if (container === byPriorityEl) return ["Sem prioridade", "Baixa", "Média", "Alta", "Crítica"];
      return null;
    })();

    const norm = (s) => String(s).trim().toLowerCase();
    const orderIndex = (k) => {
      if (!orderByContainer) return Number.POSITIVE_INFINITY;
      const idx = orderByContainer.findIndex((x) => norm(x) === norm(k));
      return idx === -1 ? Number.POSITIVE_INFINITY : idx;
    };

    Object.entries(obj)
      .sort((a, b) => {
        const ia = orderIndex(a[0]);
        const ib = orderIndex(b[0]);
        if (ia !== ib) return ia - ib;
        return String(a[0]).localeCompare(String(b[0]));
      })
      .forEach(([k, v]) => {
        container.appendChild(UI.el("div", { class: "kv" }, [
          UI.el("span", { text: k }),
          UI.el("strong", { text: String(v) })
        ]));
      });
  }

  function inLastDays(dateIso, days) {
    if (!dateIso) return false;
    const d = new Date(dateIso);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    const ms = days * 24 * 60 * 60 * 1000;
    return (now - d) <= ms;
  }

  async function loadStats() {
    setState("A carregar estatísticas...");
    totalEl.textContent = "—";
    byStatusEl.innerHTML = "";
    byPriorityEl.innerHTML = "";
    recentList.innerHTML = "";
    recentNote.textContent = "—";

    try {
      // GET #1: summary
      const summary = await API.getSummary();
      totalEl.textContent = String(summary?.total ?? "—");
      renderKV(byStatusEl, summary?.byStatus);
      renderKV(byPriorityEl, summary?.byPriority);

      // GET #2: tickets recentes (para lista + cálculo últimos 7 dias)
      const recentRes = await API.listTickets({ sortBy: "created_at", sortOrder: "DESC", limit: 50, offset: 0 });
      const tickets = recentRes?.data || [];
      const last7 = tickets.filter((t) => inLastDays(t.created_at, 7));

      if (last7.length === 0) {
        recentList.appendChild(UI.el("li", { class: "muted", text: "Sem tickets criados nos últimos 7 dias." }));
      } else {
        last7.slice(0, 8).forEach((t) => {
          recentList.appendChild(
            UI.el("li", {}, [`#${t.id} — ${t.title || "Sem título"} (`, UI.formatDate(t.created_at), `)`])
          );
        });
      }
      recentNote.textContent = `A mostrar ${Math.min(last7.length, 8)} de ${last7.length} tickets (amostra: 50 mais recentes).`;

      setState(`Atualizado: ${new Date().toLocaleString("pt-PT")}`);
    } catch (err) {
      setState("");
      UI.toast({ title: "Erro", message: err.message, variant: "bad" });
      state.textContent = "Não foi possível carregar estatísticas. Confere a API Base URL e o servidor.";
    }
  }

  reloadBtn.addEventListener("click", loadStats);

  loadStats();
})();
