const STORAGE_KEY = "rnc-a3-registros-v1";
const API_STATE_URL = "/api/quality/rnc-state";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const today = () => new Date().toISOString().slice(0, 10);
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `rnc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const emptyRecord = (sequence = 1) => ({
  id: makeId(),
  codigo: `RNC-${new Date().getFullYear()}-${String(sequence).padStart(4, "0")}`,
  titulo: "Nova RNC",
  status: "Aberta",
  dataAbertura: today(),
  prazo: "",
  setor: "",
  processo: "",
  origem: "Processo interno",
  criticidade: "Média",
  responsavel: "",
  cliente: "",
  lote: "",
  descricao: "",
  requisito: "",
  evidencia: "",
  impacto: "",
  contencao: {
    acao: "",
    responsavel: "",
    data: today(),
    abrangencia: "",
    disposicao: "",
    risco: "Baixo",
    status: "Planejada",
    verificacao: "",
  },
  a3: {
    contexto: "",
    condicaoAtual: "",
    meta: "",
    causaRaiz: "",
    fishbone: {
      metodo: "",
      maoDeObra: "",
      maquina: "",
      material: "",
      medicao: "",
      meioAmbiente: "",
    },
    porques: {
      why1: "",
      why2: "",
      why3: "",
      why4: "",
      why5: "",
    },
  },
  acoes: [
    {
      what: "",
      why: "",
      where: "",
      when: "",
      who: "",
      how: "",
      howMuch: "",
      status: "Aberta",
    },
  ],
  pdca: {
    plan: "",
    do: "",
    check: "",
    act: "",
  },
  fechamento: {
    dataEficacia: "",
    resultado: "Em verificação",
    aprovador: "",
    dataFechamento: "",
    evidenciaEficacia: "",
    padronizacao: "",
    licoes: "",
  },
});

let state = createInitialState();
let saveTimer;
let saveInFlight = Promise.resolve();

function createInitialState() {
  const initial = emptyRecord(1);
  initial.titulo = "RNC sem tÃ­tulo";
  return { activeId: initial.id, rncs: [initial], lastSaved: "" };
}

function loadLocalState() {
  return loadState();
}

async function loadCentralState() {
  const localState = loadLocalState();

  try {
    const response = await fetch(API_STATE_URL, {
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (data?.state?.rncs?.length) {
      state = data.state;
      return;
    }

    state = localState;
    if (localState?.rncs?.length) {
      saveNow("Dados locais migrados para o banco central");
    }
  } catch (error) {
    console.warn("Banco central do RNC indisponivel. Usando copia local.", error);
    state = localState;
    $("#saveIndicator").textContent = "Usando copia local";
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.rncs?.length) return parsed;
    }
  } catch (error) {
    console.warn("Não foi possível carregar os dados salvos.", error);
  }

  const initial = emptyRecord(1);
  initial.titulo = "RNC sem título";
  return { activeId: initial.id, rncs: [initial], lastSaved: "" };
}

function currentRecord() {
  return state.rncs.find((record) => record.id === state.activeId) || state.rncs[0];
}

function setByPath(target, path, value) {
  const parts = path.split(".");
  let cursor = target;
  parts.slice(0, -1).forEach((part) => {
    if (!cursor[part]) cursor[part] = {};
    cursor = cursor[part];
  });
  cursor[parts.at(-1)] = value;
}

function getByPath(target, path) {
  return path.split(".").reduce((cursor, part) => (cursor ? cursor[part] : ""), target) ?? "";
}

function saveNowLocalFallback(message = "Dados salvos") {
  state.lastSaved = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    $("#saveIndicator").textContent = `Salvo às ${formatTime(state.lastSaved)}`;
    if (message) showToast(message);
  } catch (error) {
    console.warn("Não foi possível salvar localmente.", error);
    $("#saveIndicator").textContent = "Salvamento local indisponível";
    if (message) showToast("Navegador não permitiu salvar localmente");
  }
}

function saveNow(message = "Dados salvos") {
  state.lastSaved = new Date().toISOString();
  const snapshot = JSON.parse(JSON.stringify(state));

  saveInFlight = saveInFlight
    .catch(() => {})
    .then(async () => {
      try {
        const response = await fetch(API_STATE_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ state: snapshot }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          const error = new Error(data.error || `HTTP ${response.status}`);
          error.status = response.status;
          throw error;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
        $("#saveIndicator").textContent = `Salvo no banco as ${formatTime(snapshot.lastSaved)}`;
        if (message) showToast(message);
      } catch (error) {
        console.warn("Nao foi possivel salvar no banco central.", error);
        if (error.status === 403) {
          $("#saveIndicator").textContent = "Somente leitura";
          if (message) showToast(error.message || "Usuario sem permissao para salvar");
          return;
        }

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
          $("#saveIndicator").textContent = `Salvo localmente as ${formatTime(snapshot.lastSaved)}`;
          if (message) showToast("Banco central indisponivel; salvo neste navegador");
        } catch (localError) {
          console.warn("Nao foi possivel salvar localmente.", localError);
          $("#saveIndicator").textContent = "Salvamento indisponivel";
          if (message) showToast("Navegador nao permitiu salvar os dados");
        }
      }
    });

  return saveInFlight;
}

function scheduleSave() {
  $("#saveIndicator").textContent = "Salvando...";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveNow("Alterações salvas"), 450);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function formatDate(value) {
  if (!value) return "Não informado";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatTime(value) {
  if (!value) return "agora";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function textOrDash(value) {
  const text = String(value ?? "").trim();
  return text ? escapeHtml(text).replaceAll("\n", "<br>") : "Não informado";
}

function lines(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function bindInputs() {
  $$("[data-bind]").forEach((input) => {
    input.addEventListener("input", handleBoundInput);
    input.addEventListener("change", handleBoundInput);
  });
}

function handleBoundInput(event) {
  const record = currentRecord();
  setByPath(record, event.currentTarget.dataset.bind, event.currentTarget.value);
  renderDerived();
  scheduleSave();
}

function renderAll() {
  const record = currentRecord();
  $$("[data-bind]").forEach((input) => {
    input.value = getByPath(record, input.dataset.bind);
  });

  renderRecordSelect();
  renderDashboard();
  renderActions();
  renderDerived();
}

function renderDerived() {
  const record = currentRecord();
  renderStatus(record);
  renderFishbone(record);
  renderDashboard();
  renderIndicators();
  renderReport(record);
}

function renderRecordSelect() {
  const select = $("#rncSelect");
  select.innerHTML = state.rncs
    .map((record) => `<option value="${record.id}">${escapeHtml(record.codigo)} - ${escapeHtml(record.titulo || "Sem título")}</option>`)
    .join("");
  select.value = currentRecord().id;
}

function renderStatus(record) {
  const pill = $("#statusPill");
  pill.textContent = record.status;
  pill.className = "status-pill";
  if (record.status === "Fechada") pill.classList.add("closed");
  if (record.criticidade === "Alta" || record.criticidade === "Crítica") pill.classList.add("risk");
}

function renderDashboard() {
  const record = currentRecord();
  $("#panelSubtitle").textContent = `${record.codigo} - ${record.titulo || "Sem título"}`;

  const total = state.rncs.length;
  const abertas = state.rncs.filter((item) => item.status !== "Fechada").length;
  const fechadas = state.rncs.filter((item) => item.status === "Fechada").length;
  const atrasadas = state.rncs.filter((item) => item.status !== "Fechada" && item.prazo && item.prazo < today()).length;

  $("#metricGrid").innerHTML = [
    metric("Registros", total, "Total de RNCs"),
    metric("Abertas", abertas, "Pendentes de fechamento"),
    metric("Atrasadas", atrasadas, "Prazo alvo vencido"),
    metric("Fechadas", fechadas, "Concluídas"),
  ].join("");

  $("#rncList").innerHTML = state.rncs
    .map(
      (item) => `
        <button class="rnc-item ${item.id === state.activeId ? "is-active" : ""}" type="button" data-open-record="${item.id}">
          <strong>${escapeHtml(item.codigo)} - ${escapeHtml(item.titulo || "Sem título")}</strong>
          <span>${escapeHtml(item.status)} | ${escapeHtml(item.setor || "Setor não informado")} | Prazo: ${formatDate(item.prazo)}</span>
        </button>
      `,
    )
    .join("");

  $("#nextSteps").innerHTML = buildNextSteps(record)
    .map((step) => `<div class="next-item"><strong>${step.title}</strong><span>${step.detail}</span></div>`)
    .join("");
}

function metric(label, value, detail) {
  return `<div class="metric"><span>${label}</span><strong>${value}</strong><small>${detail}</small></div>`;
}

function daysBetween(start, end) {
  if (!start || !end) return null;
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;
  return Math.max(0, Math.round((endDate - startDate) / 86400000));
}

function percent(value, total) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

function formatAverageDays(value) {
  if (value === null || Number.isNaN(value)) return "-";
  return `${value.toFixed(value >= 10 ? 0 : 1)} d`;
}

function groupByCount(items, getLabel) {
  const grouped = new Map();
  items.forEach((item) => {
    const label = String(getLabel(item) || "Não informado").trim() || "Não informado";
    grouped.set(label, (grouped.get(label) || 0) + 1);
  });
  return [...grouped.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "pt-BR"));
}

function monthLabel(value) {
  if (!value) return "Sem data";
  const [year, month] = value.split("-");
  return month && year ? `${month}/${year}` : "Sem data";
}

function calculateIndicators() {
  const rncs = state.rncs;
  const total = rncs.length;
  const abertas = rncs.filter((item) => item.status !== "Fechada").length;
  const fechadas = rncs.filter((item) => item.status === "Fechada").length;
  const atrasadas = rncs.filter((item) => item.status !== "Fechada" && item.prazo && item.prazo < today()).length;
  const altaCritica = rncs.filter((item) => item.criticidade === "Alta" || item.criticidade === "Crítica").length;
  const eficaciaBase = rncs.filter((item) => item.fechamento?.resultado && item.fechamento.resultado !== "Em verificação");
  const eficazes = eficaciaBase.filter((item) => item.fechamento.resultado === "Eficaz").length;
  const tempos = rncs
    .filter((item) => item.status === "Fechada")
    .map((item) => daysBetween(item.dataAbertura, item.fechamento?.dataFechamento))
    .filter((value) => value !== null);
  const tempoMedio = tempos.length ? tempos.reduce((sum, value) => sum + value, 0) / tempos.length : null;
  const acoes = rncs.flatMap((rnc) => (rnc.acoes || []).map((acao) => ({ ...acao, rnc })));
  const acoesAbertas = acoes.filter((acao) => !["Concluída", "Cancelada"].includes(acao.status)).length;
  const acoesAtrasadas = acoes.filter((acao) => !["Concluída", "Cancelada"].includes(acao.status) && acao.when && acao.when < today()).length;

  return {
    total,
    abertas,
    fechadas,
    atrasadas,
    altaCritica,
    eficaciaBase: eficaciaBase.length,
    eficazes,
    tempoMedio,
    acoes,
    acoesAbertas,
    acoesAtrasadas,
    status: groupByCount(rncs, (item) => item.status),
    criticidade: groupByCount(rncs, (item) => item.criticidade),
    origem: groupByCount(rncs, (item) => item.origem),
    setor: groupByCount(rncs, (item) => item.setor),
    acoesStatus: groupByCount(acoes, (item) => item.status),
    mensal: groupByCount(rncs, (item) => monthLabel(item.dataAbertura)).sort((a, b) => {
      const parse = (label) => (label === "Sem data" ? "0000-00" : `${label.slice(3)}-${label.slice(0, 2)}`);
      return parse(a.label).localeCompare(parse(b.label));
    }),
  };
}

function renderIndicators() {
  const indicators = calculateIndicators();
  const eficacia = percent(indicators.eficazes, indicators.eficaciaBase);

  $("#indicatorMetricGrid").innerHTML = [
    metric("Total", indicators.total, "RNCs cadastradas"),
    metric("Abertas", indicators.abertas, "Em tratamento"),
    metric("Atrasadas", indicators.atrasadas, "Prazo alvo vencido"),
    metric("Fechadas", indicators.fechadas, "Encerradas"),
    metric("Eficácia", eficacia, `${indicators.eficazes}/${indicators.eficaciaBase} verificadas`),
    metric("Tempo médio", formatAverageDays(indicators.tempoMedio), "Abertura ate fechamento"),
  ].join("");

  renderBarChart("#statusChart", indicators.status);
  renderBarChart("#criticalityChart", indicators.criticidade);
  renderBarChart("#originChart", indicators.origem);
  renderBarChart("#sectorChart", indicators.setor);
  renderBarChart("#monthlyChart", indicators.mensal);
  renderBarChart("#actionStatusChart", indicators.acoesStatus);
  renderIndicatorInsights(indicators);
  renderIndicatorTable();
}

function renderBarChart(selector, data) {
  const colors = ["var(--teal)", "var(--blue)", "var(--orange)", "var(--green)", "var(--red)", "var(--indigo)", "var(--cyan)"];
  const max = Math.max(...data.map((item) => item.value), 0);
  $(selector).innerHTML = data.length
    ? data
        .map((item, index) => {
          const width = max ? Math.max(6, (item.value / max) * 100) : 0;
          return `
            <div class="bar-row">
              <span class="bar-label" title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</span>
              <span class="bar-track"><span class="bar-fill" style="width:${width}%; background:${colors[index % colors.length]}"></span></span>
              <span class="bar-value">${item.value}</span>
            </div>
          `;
        })
        .join("")
    : `<div class="empty-chart">Sem dados para exibir</div>`;
}

function renderIndicatorInsights(indicators) {
  const insights = [];
  if (indicators.atrasadas) insights.push({ title: "RNCs atrasadas", detail: `${indicators.atrasadas} registro(s) com prazo alvo vencido.` });
  if (indicators.altaCritica) insights.push({ title: "Criticidade elevada", detail: `${indicators.altaCritica} RNC(s) classificadas como alta ou crítica.` });
  if (indicators.acoesAtrasadas) insights.push({ title: "Ações atrasadas", detail: `${indicators.acoesAtrasadas} ação(ões) 5W2H fora do prazo.` });
  if (indicators.eficaciaBase && indicators.eficazes / indicators.eficaciaBase < 0.8) {
    insights.push({ title: "Eficácia abaixo de 80%", detail: "Revisar causa raiz, contramedidas e verificação PDCA." });
  }
  if (!insights.length) insights.push({ title: "Sem alerta crítico", detail: "Nenhum desvio relevante encontrado nos registros atuais." });

  $("#indicatorInsights").innerHTML = insights
    .map((item) => `<div class="next-item"><strong>${item.title}</strong><span>${item.detail}</span></div>`)
    .join("");
}

function renderIndicatorTable() {
  const sorted = [...state.rncs].sort((a, b) => {
    if (a.status === "Fechada" && b.status !== "Fechada") return 1;
    if (a.status !== "Fechada" && b.status === "Fechada") return -1;
    return String(b.dataAbertura || "").localeCompare(String(a.dataAbertura || ""));
  });

  $("#indicatorTable").innerHTML = sorted
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.codigo)}<br><small>${escapeHtml(item.titulo || "Sem título")}</small></td>
          <td>${escapeHtml(item.status)}</td>
          <td>${escapeHtml(item.criticidade)}</td>
          <td>${escapeHtml(item.setor || "Não informado")}</td>
          <td>${formatDate(item.prazo)}</td>
        </tr>
      `,
    )
    .join("");
}

function buildNextSteps(record) {
  const steps = [];
  if (!record.descricao.trim()) steps.push({ title: "Abertura", detail: "Registrar descrição, requisito e evidência." });
  if (!record.contencao.acao.trim()) steps.push({ title: "Contenção", detail: "Definir ação imediata para bloquear o risco." });
  if (!record.a3.causaRaiz.trim()) steps.push({ title: "A3", detail: "Concluir causa raiz provável." });
  if (!record.acoes.some((action) => action.what.trim())) steps.push({ title: "5W2H", detail: "Adicionar pelo menos uma contramedida." });
  if (!record.pdca.check.trim()) steps.push({ title: "PDCA", detail: "Registrar verificação de eficácia." });
  if (!record.fechamento.dataFechamento.trim()) steps.push({ title: "Fechamento", detail: "Preencher aprovação e data de fechamento." });
  if (!steps.length) steps.push({ title: "Relatório", detail: "RNC pronta para imprimir ou salvar em PDF." });
  return steps;
}

function renderFishbone(record) {
  const categories = [
    ["Método", record.a3.fishbone.metodo, "top"],
    ["Mão de obra", record.a3.fishbone.maoDeObra, "top"],
    ["Máquina", record.a3.fishbone.maquina, "top"],
    ["Material", record.a3.fishbone.material, "bottom"],
    ["Medição", record.a3.fishbone.medicao, "bottom"],
    ["Meio ambiente", record.a3.fishbone.meioAmbiente, "bottom"],
  ];

  $("#fishbonePreview").innerHTML = `
    ${categories
      .map(
        ([label, value, position]) => `
          <div class="fish-category ${position}">
            <strong>${label}</strong>
            <ul>${renderCauseItems(value)}</ul>
          </div>
        `,
      )
      .join("")}
    <div class="fish-effect">${escapeHtml(record.titulo || "Efeito")}</div>
  `;
}

function renderCauseItems(value) {
  const items = lines(value);
  if (!items.length) return "<li>Sem causa registrada</li>";
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderActions() {
  const record = currentRecord();
  $("#actionsBody").innerHTML = record.acoes
    .map(
      (action, index) => `
        <tr>
          <td><input data-action-field="what" data-action-index="${index}" value="${escapeHtml(action.what)}" /></td>
          <td><input data-action-field="why" data-action-index="${index}" value="${escapeHtml(action.why)}" /></td>
          <td><input data-action-field="where" data-action-index="${index}" value="${escapeHtml(action.where)}" /></td>
          <td><input data-action-field="when" data-action-index="${index}" type="date" value="${escapeHtml(action.when)}" /></td>
          <td><input data-action-field="who" data-action-index="${index}" value="${escapeHtml(action.who)}" /></td>
          <td><input data-action-field="how" data-action-index="${index}" value="${escapeHtml(action.how)}" /></td>
          <td><input data-action-field="howMuch" data-action-index="${index}" value="${escapeHtml(action.howMuch)}" /></td>
          <td>
            <select data-action-field="status" data-action-index="${index}">
              ${["Aberta", "Em execução", "Concluída", "Atrasada", "Cancelada"]
                .map((status) => `<option ${status === action.status ? "selected" : ""}>${status}</option>`)
                .join("")}
            </select>
          </td>
          <td>
            <button class="icon-button" type="button" data-remove-action="${index}" title="Remover ação">
              <svg><use href="#icon-trash"></use></svg>
            </button>
          </td>
        </tr>
      `,
    )
    .join("");
}

function renderReport(record) {
  $("#reportSheet").innerHTML = `
    <header class="report-header">
      <div>
        <h2>Relatório de Não Conformidade</h2>
        <p>${escapeHtml(record.codigo)} - ${escapeHtml(record.titulo || "Sem título")}</p>
      </div>
      <div class="report-meta">
        <span><strong>Status:</strong> ${escapeHtml(record.status)}</span>
        <span><strong>Criticidade:</strong> ${escapeHtml(record.criticidade)}</span>
        <span><strong>Abertura:</strong> ${formatDate(record.dataAbertura)}</span>
        <span><strong>Prazo:</strong> ${formatDate(record.prazo)}</span>
      </div>
    </header>

    ${reportSection("1. Abertura", [
      box("Setor", record.setor),
      box("Processo", record.processo),
      box("Origem", record.origem),
      box("Responsável", record.responsavel),
      box("Cliente ou área impactada", record.cliente),
      box("Lote, pedido ou referência", record.lote),
      box("Descrição", record.descricao, true),
      box("Requisito não atendido", record.requisito),
      box("Evidência objetiva", record.evidencia),
      box("Impacto potencial", record.impacto, true),
    ])}

    ${reportSection("2. Ação de contenção", [
      box("Ação imediata", record.contencao.acao, true),
      box("Responsável", record.contencao.responsavel),
      box("Data", formatDate(record.contencao.data)),
      box("Abrangência", record.contencao.abrangencia),
      box("Disposição", record.contencao.disposicao),
      box("Risco remanescente", record.contencao.risco),
      box("Situação", record.contencao.status),
      box("Verificação", record.contencao.verificacao, true),
    ])}

    ${reportSection("3. A3 e análise de causa", [
      box("Contexto", record.a3.contexto),
      box("Condição atual", record.a3.condicaoAtual),
      box("Meta", record.a3.meta),
      box("Causa raiz provável", record.a3.causaRaiz),
      box("5 porquês", renderWhys(record), true, true),
      box("Espinha de peixe", renderReportFishbone(record), true, true),
    ])}

    <section class="report-section">
      <h3>4. Plano 5W2H</h3>
      ${renderReportActions(record)}
    </section>

    ${reportSection("5. Ciclo PDCA", [
      box("Plan", record.pdca.plan),
      box("Do", record.pdca.do),
      box("Check", record.pdca.check),
      box("Act", record.pdca.act),
    ])}

    ${reportSection("6. Fechamento", [
      box("Data de verificação de eficácia", formatDate(record.fechamento.dataEficacia)),
      box("Resultado", record.fechamento.resultado),
      box("Aprovador", record.fechamento.aprovador),
      box("Data de fechamento", formatDate(record.fechamento.dataFechamento)),
      box("Evidência de eficácia", record.fechamento.evidenciaEficacia, true),
      box("Padronização realizada", record.fechamento.padronizacao),
      box("Lições aprendidas", record.fechamento.licoes),
    ])}

    ${renderReportIndicators()}
  `;
}

function reportSection(title, boxes) {
  return `<section class="report-section"><h3>${title}</h3><div class="report-grid">${boxes.join("")}</div></section>`;
}

function box(label, value, full = false, valueIsHtml = false) {
  return `
    <div class="report-box ${full ? "full" : ""}">
      <strong>${label}</strong>
      ${valueIsHtml ? value || "Não informado" : textOrDash(value)}
    </div>
  `;
}

function renderWhys(record) {
  const whys = Object.values(record.a3.porques).filter((value) => value.trim());
  if (!whys.length) return "Não informado";
  return `<ol>${whys.map((why) => `<li>${textOrDash(why)}</li>`).join("")}</ol>`;
}

function renderFishboneSummary(record) {
  const labels = [
    ["Método", record.a3.fishbone.metodo],
    ["Mão de obra", record.a3.fishbone.maoDeObra],
    ["Máquina", record.a3.fishbone.maquina],
    ["Material", record.a3.fishbone.material],
    ["Medição", record.a3.fishbone.medicao],
    ["Meio ambiente", record.a3.fishbone.meioAmbiente],
  ];
  return labels
    .map(([label, value]) => `<p><strong>${label}:</strong> ${textOrDash(value)}</p>`)
    .join("");
}

function renderReportFishbone(record) {
  const labels = [
    ["Método", record.a3.fishbone.metodo],
    ["Mão de obra", record.a3.fishbone.maoDeObra],
    ["Máquina", record.a3.fishbone.maquina],
    ["Material", record.a3.fishbone.material],
    ["Medição", record.a3.fishbone.medicao],
    ["Meio ambiente", record.a3.fishbone.meioAmbiente],
  ];

  return `
    <div class="report-fishbone">
      ${labels
        .map(
          ([label, value]) => `
            <div class="report-cause">
              <strong>${label}</strong>
              <span>${textOrDash(value)}</span>
            </div>
          `,
        )
        .join("")}
      <div class="report-effect">
        <strong>Efeito</strong>
        <span>${textOrDash(record.titulo)}</span>
      </div>
    </div>
  `;
}

function renderReportActions(record) {
  const actions = record.acoes.filter((action) => Object.values(action).some((value) => String(value).trim()));
  if (!actions.length) return `<div class="report-box">Não informado</div>`;
  return `
    <table class="report-table">
      <thead>
        <tr>
          <th>O quê</th><th>Por quê</th><th>Onde</th><th>Quando</th><th>Quem</th><th>Como</th><th>Quanto</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${actions
          .map(
            (action) => `
              <tr>
                <td>${textOrDash(action.what)}</td>
                <td>${textOrDash(action.why)}</td>
                <td>${textOrDash(action.where)}</td>
                <td>${formatDate(action.when)}</td>
                <td>${textOrDash(action.who)}</td>
                <td>${textOrDash(action.how)}</td>
                <td>${textOrDash(action.howMuch)}</td>
                <td>${textOrDash(action.status)}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderReportIndicators() {
  const indicators = calculateIndicators();
  return reportSection("7. Indicadores consolidados", [
    box("Total de RNCs", indicators.total),
    box("RNCs abertas", indicators.abertas),
    box("RNCs atrasadas", indicators.atrasadas),
    box("RNCs fechadas", indicators.fechadas),
    box("Taxa de eficácia", percent(indicators.eficazes, indicators.eficaciaBase)),
    box("Tempo médio de fechamento", formatAverageDays(indicators.tempoMedio)),
    box("Ações 5W2H abertas", indicators.acoesAbertas),
    box("Ações 5W2H atrasadas", indicators.acoesAtrasadas),
  ]);
}

function addAction() {
  currentRecord().acoes.push({
    what: "",
    why: "",
    where: "",
    when: "",
    who: "",
    how: "",
    howMuch: "",
    status: "Aberta",
  });
  renderActions();
  renderIndicators();
  renderReport(currentRecord());
  scheduleSave();
}

function removeAction(index) {
  const record = currentRecord();
  record.acoes.splice(index, 1);
  if (!record.acoes.length) addAction();
  renderActions();
  renderIndicators();
  renderReport(record);
  scheduleSave();
}

function newRecord() {
  const record = emptyRecord(state.rncs.length + 1);
  state.rncs.unshift(record);
  state.activeId = record.id;
  renderAll();
  saveNow("Nova RNC criada");
}

function switchSection(section) {
  $$(".nav-tab").forEach((button) => button.classList.toggle("is-active", button.dataset.section === section));
  $$(".content-section").forEach((panel) => panel.classList.toggle("is-visible", panel.id === `section-${section}`));
}

function exportData() {
  saveNow("");
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rnc-a3-${today()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Arquivo JSON exportado");
}

async function importData(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.rncs) || !data.rncs.length) throw new Error("Formato inválido.");
    state = data;
    if (!state.activeId || !state.rncs.some((record) => record.id === state.activeId)) {
      state.activeId = state.rncs[0].id;
    }
    renderAll();
    saveNow("Dados importados");
  } catch (error) {
    showToast("Não foi possível importar o arquivo");
    console.error(error);
  }
}

function printReport() {
  switchSection("relatorio");
  renderReport(currentRecord());
  setTimeout(() => window.print(), 100);
}

function bindEvents() {
  bindInputs();

  $$(".nav-tab").forEach((button) => {
    button.addEventListener("click", () => switchSection(button.dataset.section));
  });

  $("#rncSelect").addEventListener("change", (event) => {
    state.activeId = event.currentTarget.value;
    renderAll();
    saveNow("");
  });

  $("#rncList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-record]");
    if (!button) return;
    state.activeId = button.dataset.openRecord;
    renderAll();
    saveNow("");
  });

  $("#actionsBody").addEventListener("input", (event) => {
    const field = event.target.dataset.actionField;
    if (!field) return;
    const index = Number(event.target.dataset.actionIndex);
    currentRecord().acoes[index][field] = event.target.value;
    renderIndicators();
    renderReport(currentRecord());
    scheduleSave();
  });

  $("#actionsBody").addEventListener("change", (event) => {
    const field = event.target.dataset.actionField;
    if (!field) return;
    const index = Number(event.target.dataset.actionIndex);
    currentRecord().acoes[index][field] = event.target.value;
    renderIndicators();
    renderReport(currentRecord());
    scheduleSave();
  });

  $("#actionsBody").addEventListener("click", (event) => {
    const remove = event.target.closest("[data-remove-action]");
    if (!remove) return;
    removeAction(Number(remove.dataset.removeAction));
  });

  $("#addActionBtn").addEventListener("click", addAction);
  $("#newRncBtn").addEventListener("click", newRecord);
  $("#saveBtn").addEventListener("click", () => saveNow("Dados salvos"));
  $("#exportBtn").addEventListener("click", exportData);
  $("#importFile").addEventListener("change", (event) => importData(event.currentTarget.files[0]));
  $("#printBtn").addEventListener("click", printReport);
  $("#printReportBtn").addEventListener("click", printReport);
}

async function bootstrap() {
  bindEvents();
  await loadCentralState();
  renderAll();
  saveNow("");
}

bootstrap();
