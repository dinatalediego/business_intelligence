import { findClosestScenario } from "./lib/routing.js";

const state = {
  scenarios: [],
  activeIndex: 0,
  activeStep: "data",
};

const stepOrder = ["data", "evidence", "decision", "outcome"];
const stepNames = {
  data: "Dato",
  evidence: "Evidencia",
  decision: "Decisión",
  outcome: "Resultado observado",
};

const ideaLenses = {
  absorption: {
    eyebrow: "Velocidad comercial",
    title: "Absorción",
    equation: "salidas observadas ÷ stock al inicio",
    description:
      "En MEDALLIO la absorción conserva numerador, denominador y ventana temporal. Pricing Economics y la Control Tower usan la presión de inventario como señal, sin convertirla por sí sola en una causa.",
    projects: [
      { name: "bd_replica_crm", role: "Mart de absorción 7/30/90 días", status: "evidence" },
      { name: "data_science_systems", role: "Meses de stock para priorizar revisión", status: "evidence" },
      { name: "pricing_economics", role: "Presión de inventario en el Decision Lab", status: "evidence" },
    ],
  },
  pricing: {
    eyebrow: "Economía de decisiones",
    title: "Pricing",
    equation: "dato → señal → hipótesis → resultado",
    description:
      "Pricing aparece como teoría reproducible, señal comercial y decisión gobernada. La elasticidad ilustrativa sigue marcada como supuesto hasta contar con historia suficiente y validación temporal.",
    projects: [
      { name: "pricing_economics", role: "Teoría, elasticidad y estimadores didácticos", status: "evidence" },
      { name: "data_science_systems", role: "Control Tower y regla V1 auditable", status: "evidence" },
      { name: "business_intelligence", role: "Escenario narrativo de pricing", status: "evidence" },
      { name: "bd_replica_crm", role: "La vista Gold sería la fuente productiva", status: "potential" },
    ],
  },
  bi: {
    eyebrow: "Sentido compartido",
    title: "Business Intelligence",
    equation: "pregunta → evidencia → decisión → outcome",
    description:
      "BI es la capa que vuelve decidible una señal. Puede consumir marts confiables, explicar límites y registrar qué se hizo, pero los escenarios de este retrato siguen siendo demostrativos.",
    projects: [
      { name: "business_intelligence", role: "Seis preguntas y visuales demostrativos", status: "evidence" },
      { name: "bd_replica_crm", role: "Marts consumibles por Power BI", status: "evidence" },
      { name: "data_science_systems", role: "Tablero de decisión y outcomes locales", status: "evidence" },
      { name: "dntl_economia", role: "Causalidad y trazabilidad como lente", status: "potential" },
    ],
  },
  activation: {
    eyebrow: "La decisión toca el mundo",
    title: "Activación",
    equation: "decisión → acción → respuesta observable",
    description:
      "La activación empieza cuando una decisión produce una acción registrable. NIDO documenta el puente más concreto del portafolio; LimpiaFast funciona como laboratorio operativo independiente.",
    projects: [
      { name: "bd_replica_crm", role: "Refresh exitoso y metadata del evento", status: "evidence" },
      { name: "dntl_chatbot", role: "Decisión, WhatsApp y outcomes equivalentes", status: "evidence" },
      { name: "expertos_en_lavados", role: "Anuncio, conversación, reserva y recompra", status: "evidence" },
      { name: "business_intelligence", role: "Puede narrar el resultado observado", status: "potential" },
    ],
  },
  governance: {
    eyebrow: "Control del sistema",
    title: "Gobierno",
    equation: "observar → priorizar → intervenir → refrescar",
    description:
      "El gobierno no es otro dashboard temático: mantiene separadas la salud del repositorio, la ejecución de Actions y la urgencia de intervención para conservar trazabilidad.",
    projects: [
      { name: "dntl_engineering_os", role: "Attention Queue y evidencia de GitHub", status: "evidence" },
      { name: "business_intelligence", role: "Puede explicar la cartera por intención", status: "potential" },
      { name: "data_science_systems", role: "Requiere gates de modelo y fuente", status: "potential" },
    ],
  },
};

const elements = {
  tabs: document.querySelector("#question-tabs"),
  panel: document.querySelector(".story-panel"),
  image: document.querySelector("#story-image"),
  scene: document.querySelector("#story-scene"),
  quote: document.querySelector("#story-quote"),
  label: document.querySelector("#story-label"),
  question: document.querySelector("#story-question"),
  context: document.querySelector("#story-context"),
  detailLabel: document.querySelector("#detail-label"),
  detailTitle: document.querySelector("#detail-title"),
  detailCopy: document.querySelector("#detail-copy"),
  note: document.querySelector("#evidence-note"),
  visual: document.querySelector("#evidence-visual"),
  counter: document.querySelector("#story-counter"),
  previous: document.querySelector("#previous-story"),
  next: document.querySelector("#next-story"),
  form: document.querySelector("#question-form"),
  input: document.querySelector("#business-question"),
  response: document.querySelector("#question-response"),
  ideaTabs: document.querySelector("#idea-tabs"),
  ideaEyebrow: document.querySelector("#idea-eyebrow"),
  ideaTitle: document.querySelector("#idea-title"),
  ideaEquation: document.querySelector("#idea-equation"),
  ideaProjects: document.querySelector("#idea-projects"),
  ideaDescription: document.querySelector("#idea-description"),
};

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );

const points = (values, width = 300, height = 112, domain = values) => {
  const max = Math.max(...domain);
  const min = Math.min(...domain);
  const range = max - min || 1;
  return values.map((value, index) => {
    const x = 18 + (index * (width - 36)) / Math.max(values.length - 1, 1);
    const y = 12 + (height - 28) * (1 - (value - min) / range);
    return { x, y, value };
  });
};

function lineChart(chart, accent) {
  const domain = chart.compare ? [...chart.values, ...chart.compare] : chart.values;
  const series = points(chart.values, 300, 112, domain);
  const comparison = chart.compare ? points(chart.compare, 300, 112, domain) : [];
  const labels = series
    .map(
      (point, index) =>
        `<text class="chart-label" x="${point.x}" y="146" text-anchor="middle">${escapeHtml(chart.labels[index])}</text>`,
    )
    .join("");
  const dots = series
    .map(
      (point) =>
        `<circle cx="${point.x}" cy="${point.y}" r="3.5" fill="${accent}"><title>${point.value}${chart.suffix}</title></circle>`,
    )
    .join("");
  const comparisonPath = comparison.length
    ? `<polyline points="${comparison.map((point) => `${point.x},${point.y}`).join(" ")}" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1.5" stroke-dasharray="4 4" />`
    : "";
  return `
    <svg viewBox="0 0 300 165" role="img" aria-label="Tendencia por intervalos">
      <line x1="18" y1="122" x2="282" y2="122" stroke="rgba(255,255,255,.12)" />
      ${comparisonPath}
      <polyline points="${series.map((point) => `${point.x},${point.y}`).join(" ")}" fill="none" stroke="${accent}" stroke-width="2.5" />
      ${dots}
      ${labels}
    </svg>`;
}

function barsChart(chart, accent) {
  const max = Math.max(...chart.values, ...(chart.compare || []));
  const slot = 300 / chart.values.length;
  const barWidth = chart.compare ? slot * 0.26 : slot * 0.46;
  const bars = chart.values
    .map((value, index) => {
      const height = (value / max) * 105;
      const x = index * slot + slot / 2 - (chart.compare ? 2 : 0);
      const compareValue = chart.compare?.[index];
      const compareHeight = compareValue ? (compareValue / max) * 105 : 0;
      return `
        ${compareValue !== undefined ? `<rect x="${x - barWidth - 2}" y="${126 - compareHeight}" width="${barWidth}" height="${compareHeight}" fill="rgba(255,255,255,.2)"><title>Antes: ${compareValue}${chart.suffix}</title></rect>` : ""}
        <rect x="${x + 2}" y="${126 - height}" width="${barWidth}" height="${height}" fill="${accent}"><title>Después: ${value}${chart.suffix}</title></rect>
        <text class="chart-label" x="${x}" y="148" text-anchor="middle">${escapeHtml(chart.labels[index])}</text>
      `;
    })
    .join("");
  return `<svg viewBox="0 0 300 165" role="img" aria-label="Comparación por categoría"><line x1="0" y1="126" x2="300" y2="126" stroke="rgba(255,255,255,.12)" />${bars}</svg>`;
}

function scatterChart(chart, accent) {
  const series = points(chart.values, 300, 120);
  const dots = series
    .map((point, index) => {
      const y = 126 - point.value * 1.35;
      const radius = 4 + (index % 3) * 1.5;
      return `<circle cx="${point.x}" cy="${y}" r="${radius}" fill="${accent}" fill-opacity=".78"><title>Unidad ${chart.labels[index]}</title></circle>`;
    })
    .join("");
  return `
    <svg viewBox="0 0 300 165" role="img" aria-label="Dispersión de precio y absorción">
      <line x1="18" y1="126" x2="284" y2="126" stroke="rgba(255,255,255,.12)" />
      <line x1="18" y1="126" x2="18" y2="20" stroke="rgba(255,255,255,.12)" />
      <line x1="26" y1="119" x2="278" y2="29" stroke="${accent}" stroke-opacity=".5" stroke-width="1.5" stroke-dasharray="5 5" />
      ${dots}
      <text class="chart-label" x="150" y="150" text-anchor="middle">Precio relativo →</text>
    </svg>`;
}

function waterfallChart(chart, accent) {
  const max = Math.max(...chart.values.map(Math.abs));
  const slot = 300 / chart.values.length;
  const bars = chart.values
    .map((value, index) => {
      const height = (Math.abs(value) / max) * 82;
      const x = index * slot + 18;
      const y = value >= 0 ? 108 - height : 108;
      const fill = value >= 0 ? accent : "#ff8e8e";
      return `
        <rect x="${x}" y="${y}" width="${slot - 28}" height="${height}" fill="${fill}"><title>${chart.labels[index]}: ${value}${chart.suffix}</title></rect>
        <text class="chart-value" x="${x + (slot - 28) / 2}" y="${value >= 0 ? y - 6 : y + height + 13}" text-anchor="middle">${value > 0 ? "+" : ""}${value}</text>
        <text class="chart-label" x="${x + (slot - 28) / 2}" y="148" text-anchor="middle">${escapeHtml(chart.labels[index])}</text>
      `;
    })
    .join("");
  return `<svg viewBox="0 0 300 165" role="img" aria-label="Contribución al cambio"><line x1="8" y1="108" x2="292" y2="108" stroke="rgba(255,255,255,.12)" />${bars}</svg>`;
}

function matrixChart(chart, accent) {
  const cells = chart.values
    .map((value, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const opacity = 0.16 + (value / 92) * 0.78;
      return `
        <rect x="${56 + column * 64}" y="${8 + row * 42}" width="58" height="36" fill="${accent}" fill-opacity="${opacity.toFixed(2)}" />
        <text class="chart-value" x="${85 + column * 64}" y="${31 + row * 42}" text-anchor="middle">${value}%</text>
      `;
    })
    .join("");
  const labels = chart.labels
    .map((label, index) => `<text class="chart-label" x="${85 + index * 64}" y="151" text-anchor="middle">${label}</text>`)
    .join("");
  return `<svg viewBox="0 0 300 165" role="img" aria-label="Matriz de señales combinadas">${cells}${labels}</svg>`;
}

function visualFor(scenario) {
  const chart = scenario.chart;
  const accent = scenario.accent;
  if (chart.type === "bars") return barsChart(chart, accent);
  if (chart.type === "scatter") return scatterChart(chart, accent);
  if (chart.type === "waterfall") return waterfallChart(chart, accent);
  if (chart.type === "matrix") return matrixChart(chart, accent);
  return lineChart(chart, accent);
}

function renderTabs() {
  elements.tabs.innerHTML = state.scenarios
    .map(
      (scenario, index) => `
        <button
          type="button"
          role="tab"
          id="tab-${scenario.id}"
          aria-controls="story-question"
          aria-selected="${index === state.activeIndex}"
          data-index="${index}"
        >${escapeHtml(scenario.tab)}</button>`,
    )
    .join("");

  elements.tabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-index]");
    if (!tab) return;
    setScenario(Number(tab.dataset.index), true);
  });

  elements.tabs.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    setScenario((state.activeIndex + direction + state.scenarios.length) % state.scenarios.length, true);
  });
}

function renderStep() {
  const scenario = state.scenarios[state.activeIndex];
  const detail = scenario.steps[state.activeStep];
  const activeStepIndex = stepOrder.indexOf(state.activeStep);

  document.documentElement.style.setProperty("--accent", scenario.accent);
  document.querySelectorAll(".path-step").forEach((step, index) => {
    step.classList.toggle("is-active", step.dataset.step === state.activeStep);
    step.classList.toggle("is-complete", index < activeStepIndex);
  });

  elements.detailLabel.textContent = stepNames[state.activeStep];
  elements.detailTitle.textContent = detail.title;
  elements.detailCopy.textContent = detail.copy;
  elements.note.textContent = detail.note;
  elements.visual.innerHTML = visualFor(scenario);
}

function renderScenario() {
  const scenario = state.scenarios[state.activeIndex];
  elements.panel.classList.add("is-changing");
  window.setTimeout(() => elements.panel.classList.remove("is-changing"), 220);

  elements.image.src = scenario.image;
  elements.image.alt = scenario.imageAlt;
  elements.scene.textContent = scenario.scene;
  elements.quote.textContent = `“${scenario.quote}”`;
  elements.label.textContent = scenario.label;
  elements.question.textContent = scenario.question;
  elements.context.textContent = scenario.context;
  elements.counter.textContent = `${String(state.activeIndex + 1).padStart(2, "0")} / ${String(state.scenarios.length).padStart(2, "0")}`;

  elements.tabs.querySelectorAll("[role='tab']").forEach((tab, index) => {
    const active = index === state.activeIndex;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  renderStep();
}

function setScenario(index, moveFocus = false) {
  state.activeIndex = index;
  state.activeStep = "data";
  renderScenario();
  if (moveFocus) {
    const activeTab = elements.tabs.querySelector(`[data-index="${index}"]`);
    activeTab?.focus({ preventScroll: true });
    activeTab?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }
}

function bindInteractions() {
  document.querySelectorAll(".path-step button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeStep = button.closest(".path-step").dataset.step;
      renderStep();
    });
  });

  elements.previous.addEventListener("click", () => {
    setScenario((state.activeIndex - 1 + state.scenarios.length) % state.scenarios.length);
  });

  elements.next.addEventListener("click", () => {
    setScenario((state.activeIndex + 1) % state.scenarios.length);
  });

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = elements.input.value.trim();
    if (!question) return;
    const match = findClosestScenario(question, state.scenarios);
    const matchIndex = state.scenarios.findIndex((scenario) => scenario.id === match.id);
    elements.response.innerHTML = `
      <span>Lente sugerida · ${escapeHtml(match.tab)}</span>
      <h3>${escapeHtml(match.question)}</h3>
      <p>Primer dato a observar: <strong>${escapeHtml(match.firstSignal)}</strong>. Esta clasificación es local y orientativa; no afirma una causa.</p>
    `;
    elements.response.hidden = false;
    setScenario(matchIndex);
  });

  elements.ideaTabs?.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-idea]");
    if (!tab) return;
    renderIdea(tab.dataset.idea);
  });

  elements.ideaTabs?.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const tabs = [...elements.ideaTabs.querySelectorAll("[data-idea]")];
    const current = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = tabs[(current + direction + tabs.length) % tabs.length];
    renderIdea(next.dataset.idea);
    next.focus();
  });
}

function renderIdea(ideaId = "absorption") {
  const idea = ideaLenses[ideaId];
  if (!idea || !elements.ideaProjects) return;

  elements.ideaEyebrow.textContent = idea.eyebrow;
  elements.ideaTitle.textContent = idea.title;
  elements.ideaEquation.textContent = idea.equation;
  elements.ideaDescription.textContent = idea.description;
  elements.ideaProjects.innerHTML = idea.projects
    .map(
      (project) => `
        <article class="idea-project is-${project.status}">
          <span>${project.status === "evidence" ? "Documentado" : "Pendiente"}</span>
          <h5>${escapeHtml(project.name)}</h5>
          <p>${escapeHtml(project.role)}</p>
        </article>`,
    )
    .join("");

  elements.ideaTabs.querySelectorAll("[data-idea]").forEach((tab) => {
    const active = tab.dataset.idea === ideaId;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
}

async function init() {
  try {
    const response = await fetch("/data/scenarios.json");
    if (!response.ok) throw new Error(`No se pudo cargar el contenido (${response.status})`);
    state.scenarios = await response.json();
    renderTabs();
    bindInteractions();
    renderScenario();
    renderIdea();
  } catch (error) {
    elements.panel.innerHTML = `
      <div class="story-content">
        <p class="section-index">Contenido no disponible</p>
        <h3>No pudimos abrir los relatos de decisión.</h3>
        <p class="story-context">${escapeHtml(error.message)}. Vuelve a cargar la página.</p>
      </div>`;
  }
}

init();
