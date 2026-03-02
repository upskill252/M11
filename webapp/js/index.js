// Página principal: CRUD de tickets (GET/POST/PUT/DELETE) + DOM + validações

(function () {
  const grid = document.getElementById("ticketsGrid");
  const state = document.getElementById("listState");
  const totalEl = document.getElementById("totalCount");

  const form = document.getElementById("ticketForm");
  const formTitle = document.getElementById("formTitle");
  const formHint = document.getElementById("formHint");
  const formMsg = document.getElementById("formMsg");
  const submitBtn = document.getElementById("submitBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");

  const apiBaseInput = document.getElementById("apiBaseInput");
  const saveApiBaseBtn = document.getElementById("saveApiBaseBtn");

  const refreshBtn = document.getElementById("refreshBtn");
  const filterStatus = document.getElementById("filterStatus");
  const filterPriority = document.getElementById("filterPriority");
  const filterSearch = document.getElementById("filterSearch");
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  // Field refs
  const ticketId = document.getElementById("ticketId");
  const title = document.getElementById("title");
  const description = document.getElementById("description");
  const status = document.getElementById("status");
  const priority = document.getElementById("priority");
  const category = document.getElementById("category");
  const impact = document.getElementById("impact");
  const urgency = document.getElementById("urgency");

  function setState(msg) {
    state.textContent = msg || "";
  }

  function setFormMsg(msg, variant) {
    formMsg.textContent = msg || "";
    formMsg.style.color = variant === "bad" ? "var(--bad)" : variant === "ok" ? "var(--ok)" : "var(--muted)";
  }

  function resetForm() {
    ticketId.value = "";
    form.reset();
    // reset defaults
    status.value = "Open";
    priority.value = "3";
    category.value = "incident";
    impact.value = "3";
    urgency.value = "3";

    formTitle.textContent = "Criar ticket";
    formHint.textContent = "Preenche os campos obrigatórios e submete.";
    submitBtn.textContent = "Criar";
    cancelEditBtn.hidden = true;
    setFormMsg("");
  }

  function validateForm() {
    const errs = [];
    const t = title.value.trim();
    if (!t) errs.push("O título é obrigatório.");
    if (t && t.length < 3) errs.push("O título deve ter pelo menos 3 caracteres.");
    if (t.length > 255) errs.push("O título deve ter no máximo 255 caracteres.");
    if (description.value && description.value.length > 5000) errs.push("A descrição é demasiado longa.");

    return errs;
  }

  function badgeForStatus(s) {
    const val = (s || "").toLowerCase();
    if (val.includes("closed")) return "badge bad";
    if (val.includes("progress")) return "badge warn";
    return "badge ok";
  }

  function badgeForPriority(p) {
    const val = String(p || "").trim();
    // 1-2 high; 3 medium; 4-5 low
    if (val === "1") return "badge bad";
    if (val === "2") return "badge warn";
    return "badge";
  }

  function renderTickets(tickets) {
    grid.innerHTML = "";

    if (!tickets || tickets.length === 0) {
      grid.appendChild(UI.el("div", { class: "muted", text: "Sem tickets para mostrar." }));
      return;
    }

    tickets.forEach((t) => {
      const card = UI.el("article", { class: "ticket-card" });

      const top = UI.el("div", { class: "ticket-top" }, [
        UI.el("h3", { class: "ticket-title", text: `${t.title || "Sem título"} ` }),
        UI.el("div", { class: "badges" }, [
          UI.el("span", { class: badgeForStatus(t.status), text: t.status || "—" }),
          UI.el("span", { class: badgeForPriority(t.priority), text: `P${t.priority ?? "—"}` }),
        ])
      ]);

      const meta = UI.el("div", { class: "ticket-meta" }, [
        UI.el("div", { text: `#${t.id ?? "—"}` }),
        UI.el("div", { text: `Cat: ${t.category || "—"}` }),
        UI.el("div", { text: `Criado: ${UI.formatDate(t.created_at)}` }),
        UI.el("div", { text: `Atual.: ${UI.formatDate(t.updated_at)}` })
      ]);

      const desc = UI.el("p", { class: "muted small", text: t.description ? t.description.slice(0, 120) : "Sem descrição." });

      const actions = UI.el("div", { class: "ticket-actions" }, [
        UI.el("button", { class: "btn btn-secondary", type: "button", text: "Editar", onClick: () => startEdit(t) }),
        UI.el("button", { class: "btn btn-ghost", type: "button", text: "Apagar", onClick: () => confirmDelete(t) })
      ]);

      card.append(top, meta, desc, actions);
      grid.appendChild(card);
    });
  }

  function getFilters() {
    return {
      status: filterStatus.value,
      priority: filterPriority.value,
      search: filterSearch.value.trim()
    };
  }

  async function loadTickets() {
    setState("A carregar tickets...");
    totalEl.textContent = "—";
    grid.innerHTML = "";

    try {
      const res = await API.listTickets({ ...getFilters(), limit: 100, offset: 0, sortBy: "created_at", sortOrder: "DESC" });
      const tickets = res?.data || [];
      const total = res?.pagination?.total ?? tickets.length;

      renderTickets(tickets);
      totalEl.textContent = String(total);
      setState(`Última atualização: ${new Date().toLocaleTimeString("pt-PT")}`);
    } catch (err) {
      setState("");
      UI.toast({ title: "Erro", message: err.message, variant: "bad" });
      grid.appendChild(UI.el("div", { class: "muted", text: "Não foi possível carregar tickets. Confere a API Base URL." }));
    }
  }

  function startEdit(t) {
    ticketId.value = t.id ?? "";
    title.value = t.title || "";
    description.value = t.description || "";
    status.value = t.status || "Open";
    priority.value = String(t.priority ?? "3");
    category.value = t.category || "incident";
    impact.value = t.impact ?? "";
    urgency.value = t.urgency ?? "";

    formTitle.textContent = `Editar ticket #${t.id}`;
    formHint.textContent = "Altera os campos e submete para atualizar.";
    submitBtn.textContent = "Guardar";
    cancelEditBtn.hidden = false;
    setFormMsg("");

    title.focus({ preventScroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function confirmDelete(t) {
    const ok = window.confirm(`Tens a certeza que queres apagar o ticket #${t.id}?`);
    if (!ok) return;

    try {
      UI.toast({ title: "A remover...", message: `Ticket #${t.id}`, variant: "warn", timeout: 1400 });
      await API.removeTicket(t.id);
      UI.toast({ title: "Removido", message: `Ticket #${t.id} foi apagado.`, variant: "ok" });
      await loadTickets();
    } catch (err) {
      UI.toast({ title: "Erro ao apagar", message: err.message, variant: "bad" });
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setFormMsg("");

    const errs = validateForm();
    if (errs.length) {
      setFormMsg(errs[0], "bad");
      UI.toast({ title: "Validação", message: errs[0], variant: "warn" });
      return;
    }

    const payload = {
      title: title.value.trim(),
      description: description.value.trim() || undefined,
      status: status.value,
      priority: priority.value,
      category: category.value,
      impact: impact.value || undefined,
      urgency: urgency.value || undefined
    };

    const id = ticketId.value;

    UI.setBusy(submitBtn, true, id ? "A guardar..." : "A criar...");

    try {
      if (id) {
        await API.updateTicket(id, payload);
        UI.toast({ title: "Atualizado", message: `Ticket #${id} atualizado com sucesso.`, variant: "ok" });
      } else {
        const created = await API.createTicket(payload);
        UI.toast({ title: "Criado", message: `Ticket #${created?.id ?? ""} criado com sucesso.`, variant: "ok" });
      }
      resetForm();
      await loadTickets();
    } catch (err) {
      UI.toast({ title: "Erro", message: err.message, variant: "bad" });
      setFormMsg(err.message, "bad");
    } finally {
      UI.setBusy(submitBtn, false);
    }
  }

  // API base URL controls
  function syncApiUI() {
    const base = API_CONFIG.getBase();
    apiBaseInput.value = base;
    const prev = document.getElementById("apiBasePreview");
    if (prev) prev.textContent = base;
  }

  saveApiBaseBtn.addEventListener("click", () => {
    const next = apiBaseInput.value;
    const saved = API_CONFIG.setBase(next);
    syncApiUI();
    UI.toast({ title: "Guardado", message: `API Base URL: ${saved}`, variant: "ok" });
    loadTickets();
  });

  // Filters
  refreshBtn.addEventListener("click", loadTickets);
  applyFiltersBtn.addEventListener("click", loadTickets);
  clearFiltersBtn.addEventListener("click", () => {
    filterStatus.value = "";
    filterPriority.value = "";
    filterSearch.value = "";
    loadTickets();
  });

  filterSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loadTickets();
  });

  cancelEditBtn.addEventListener("click", resetForm);
  form.addEventListener("submit", onSubmit);

  // Init
  syncApiUI();
  resetForm();
  loadTickets();
})();
