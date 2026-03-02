(function () {
  // Página estática — deixamos apenas uma notificação pequena se a API estiver inacessível (opcional)
  // Não é obrigatório, mas ajuda a demonstrar código assíncrono em mais do que uma página.
  const preview = document.getElementById("apiBasePreview");

  async function ping() {
    try {
      await API.request("/", { method: "GET" });
    } catch (err) {
      // Silencioso: é uma página informativa.
      if (preview) preview.title = "API parece indisponível (normal se não estiver a correr).";
    }
  }

  ping();
})();
