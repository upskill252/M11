# M10 — Gestor de Tickets (Frontend)

Este ZIP contém o **frontend** do projeto do Módulo 10, feito em **HTML/CSS/JavaScript (sem bibliotecas externas)** e preparado para consumir a **API do Módulo 8**.

## Estrutura
- `index.html` — página principal (CRUD completo)
- `stats.html` — dashboard/estatísticas (múltiplos GET)
- `about.html` — informação sobre o projeto (uso de listas)
- `css/styles.css` — estilos consistentes e responsivos
- `js/` — JavaScript modular (config + UI + API + páginas)

## Como executar
1. **Liga a API do M8** (main-server).
2. Abre `index.html` no browser (Chrome).
3. No topo da página principal, confirma/define o **API Base URL** (por exemplo `http://localhost:3000`).
4. Testa:
   - GET ao carregar
   - POST ao criar
   - PUT ao editar
   - DELETE ao apagar (com confirmação)

## Notas
- Responsivo para iPhone 14 Pro Max (430×932) e desktop.
- Feedback ao utilizador: estados de loading, toasts, mensagens.
