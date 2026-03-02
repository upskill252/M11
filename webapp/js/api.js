// API layer (fetch + async/await). Sem bibliotecas externas.

(function () {
  async function request(path, { method = "GET", body, headers } = {}) {
    const base = window.API_CONFIG.getBase();
    const url = `${base}${path}`;

    // --- NEW: Get token from localStorage ---
    const token = localStorage.getItem('token');

    const opts = {
      method,
      headers: {
        "Content-Type": "application/json",
        // --- NEW: Add Authorization header if token exists ---
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...(headers || {})
      }
    };

    if (body !== undefined) opts.body = JSON.stringify(body);

    let res;
    try {
      res = await fetch(url, opts);
    } catch (err) {
      const e = new Error("Não foi possível ligar à API. Verifica o URL e se o servidor está a correr.");
      e.cause = err;
      throw e;
    }

    // --- NEW: Redirect if Unauthorized ---
    if (res.status === 401 || res.status === 403) {
      console.warn("Sessão expirada ou acesso negado. Redirecionando para login...");
      localStorage.removeItem('token');
      // Só redireciona se não estivermos já na página de login
      if (!window.location.pathname.includes("login.html")) {
        window.location.href = "login.html";
      }
    }

    let data = null;
    const isJson = (res.headers.get("content-type") || "").includes("application/json");
    if (isJson) {
      try { data = await res.json(); } catch { data = null; }
    } else {
      try { data = await res.text(); } catch { data = null; }
    }

    if (!res.ok) {
      const msg = (data && (data.message || data.error)) ? `${data.error || "Erro"}: ${data.message || ""}` : `HTTP ${res.status}`;
      const e = new Error(msg);
      e.status = res.status;
      e.payload = data;
      throw e;
    }

    return data;
  }

  function toQuery(params = {}) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      sp.set(k, String(v));
    });
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
  }

  // --- NEW: Auth specific requests ---
  async function login(username, password) {
    return request("/api/auth/login", { 
      method: "POST", 
      body: { username, password } 
    });
  }

  async function register(username, password) {
    return request("/api/auth/register", { 
      method: "POST", 
      body: { username, password } 
    });
  }

  // Tickets
  async function listTickets(params) {
    return request(`/api/tickets${toQuery(params)}`);
  }

  async function getTicket(id) {
    return request(`/api/tickets/${encodeURIComponent(id)}`);
  }

  async function createTicket(payload) {
    return request(`/api/tickets`, { method: "POST", body: payload });
  }

  async function updateTicket(id, payload) {
    return request(`/api/tickets/${encodeURIComponent(id)}`, { method: "PUT", body: payload });
  }

  async function removeTicket(id) {
    return request(`/api/tickets/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  // Stats
  async function getSummary() {
    return request(`/api/stats/summary`);
  }

  // Added login and register to the window.API object
  window.API = { 
    request, 
    login, 
    register, 
    listTickets, 
    getTicket, 
    createTicket, 
    updateTicket, 
    removeTicket, 
    getSummary 
  };
})();