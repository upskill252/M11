// Configuração simples (sem bibliotecas externas)
// O utilizador pode alterar o base URL no index.html.
// O valor fica guardado em localStorage.

(function () {
  const KEY = "m10_api_base";
  const DEFAULT_BASE = "http://localhost:3000";

  function normalizeBase(url) {
    if (!url) return DEFAULT_BASE;
    let base = url.trim();
    base = base.replace(/\/+$/, ""); // remove trailing slash
    return base || DEFAULT_BASE;
  }

  window.API_CONFIG = {
    KEY,
    DEFAULT_BASE,
    getBase() {
      return normalizeBase(localStorage.getItem(KEY) || DEFAULT_BASE);
    },
    setBase(next) {
      localStorage.setItem(KEY, normalizeBase(next));
      return window.API_CONFIG.getBase();
    }
  };
})();
