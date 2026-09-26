const state = {
  globalIndex: 78.4,
  growthRate: 6.8,
  trustRate: 91,
  inflationRate: 2.4,
  employmentRate: 94,
  utilityScore: 87,
  communityCapital: 1.4,
  resilienceIndex: 84,
  inclusionRate: 96,
  production: 82,
  distribution: 88,
  stability: 76,
  innovation: 93,
  policy: {
    basicAccess: true,
    greenInfra: true,
    cooperativeCredit: true,
    publicData: false,
  },
};

const el = {
  globalIndex: document.getElementById("globalIndex"),
  globalTrend: document.getElementById("globalTrend"),
  growthRate: document.getElementById("growthRate"),
  trustRate: document.getElementById("trustRate"),
  inflationRate: document.getElementById("inflationRate"),
  employmentRate: document.getElementById("employmentRate"),
  utilityScore: document.getElementById("utilityScore"),
  communityCapital: document.getElementById("communityCapital"),
  resilienceIndex: document.getElementById("resilienceIndex"),
  inclusionRate: document.getElementById("inclusionRate"),
  productionBar: document.getElementById("productionBar"),
  distributionBar: document.getElementById("distributionBar"),
  stabilityBar: document.getElementById("stabilityBar"),
  innovationBar: document.getElementById("innovationBar"),
  productionValue: document.getElementById("productionValue"),
  distributionValue: document.getElementById("distributionValue"),
  stabilityValue: document.getElementById("stabilityValue"),
  innovationValue: document.getElementById("innovationValue"),
  simulateBtn: document.getElementById("simulateBtn"),
};

const policyMap = {
  basicAccess: { growth: 3.3, trust: 7, distribution: 6, innovation: 2 },
  greenInfra: { growth: 2.4, stability: 6, resilience: 5, inflation: -0.5 },
  cooperativeCredit: { growth: 2.8, distribution: 8, employment: 4, communityCapital: 0.25 },
  publicData: { innovation: 7, efficiency: 3, inclusion: 4 },
};

function updateBars() {
  const bars = [
    [el.productionBar, el.productionValue, state.production],
    [el.distributionBar, el.distributionValue, state.distribution],
    [el.stabilityBar, el.stabilityValue, state.stability],
    [el.innovationBar, el.innovationValue, state.innovation],
  ];

  bars.forEach(([bar, valueEl, value]) => {
    bar.style.width = `${value}%`;
    valueEl.textContent = `${value}%`;
  });
}

function formatCapital(value) {
  return `$${value.toFixed(1)}T`;
}

function render() {
  el.globalIndex.textContent = state.globalIndex.toFixed(1);
  el.globalTrend.textContent = `+${(state.globalIndex - 70).toFixed(1)}% this quarter`;
  el.growthRate.textContent = `${state.growthRate.toFixed(1)}%`;
  el.trustRate.textContent = `${state.trustRate}`;
  el.inflationRate.textContent = `${state.inflationRate.toFixed(1)}%`;
  el.employmentRate.textContent = `${state.employmentRate}%`;
  el.utilityScore.textContent = `${state.utilityScore}`;
  el.communityCapital.textContent = formatCapital(state.communityCapital);
  el.resilienceIndex.textContent = `${state.resilienceIndex}`;
  el.inclusionRate.textContent = `${state.inclusionRate}%`;

  updateBars();
}

function calculateState() {
  let growth = 6.8;
  let trust = 91;
  let inflation = 2.4;
  let employment = 94;
  let utility = 87;
  let resilience = 84;
  let inclusion = 96;
  let communityCapital = 1.4;
  let production = 82;
  let distribution = 88;
  let stability = 76;
  let innovation = 93;

  Object.entries(state.policy).forEach(([key, enabled]) => {
    if (!enabled) return;
    const effects = policyMap[key] || {};

    growth += effects.growth || 0;
    trust += effects.trust || 0;
    inflation += effects.inflation || 0;
    employment += effects.employment || 0;
    utility += effects.utility || 0;
    resilience += effects.resilience || 0;
    inclusion += effects.inclusion || 0;
    communityCapital += effects.communityCapital || 0;
    production += effects.production || 0;
    distribution += effects.distribution || 0;
    stability += effects.stability || 0;
    innovation += effects.innovation || 0;
  });

  state.growthRate = growth;
  state.trustRate = Math.min(100, trust);
  state.inflationRate = Math.max(1.1, inflation);
  state.employmentRate = Math.min(99, employment);
  state.utilityScore = Math.min(100, utility);
  state.resilienceIndex = Math.min(100, resilience);
  state.inclusionRate = Math.min(100, inclusion);
  state.communityCapital = Math.min(3.5, communityCapital);
  state.production = Math.min(100, production);
  state.distribution = Math.min(100, distribution);
  state.stability = Math.min(100, stability);
  state.innovation = Math.min(100, innovation);
  state.globalIndex = Number(((state.production + state.distribution + state.stability + state.innovation) / 4).toFixed(1));
}

const toggles = document.querySelectorAll(".policy-toggle");

toggles.forEach((toggle) => {
  toggle.addEventListener("change", function () {
    state.policy[this.dataset.policy] = this.checked;
    calculateState();
    render();
  });
});

el.simulateBtn.addEventListener("click", () => {
  const pulse = () => {
    state.globalIndex = Number((state.globalIndex + (Math.random() * 3 - 1.2)).toFixed(1));
    state.growthRate = Number((state.growthRate + (Math.random() * 1.6 - 0.6)).toFixed(1));
    state.trustRate = Math.min(100, Math.max(70, state.trustRate + Math.round(Math.random() * 6 - 2)));
    state.inflationRate = Number((state.inflationRate + (Math.random() * 0.9 - 0.4)).toFixed(1));
    state.employmentRate = Math.min(99, Math.max(70, state.employmentRate + Math.round(Math.random() * 5 - 2)));
    state.utilityScore = Math.min(100, Math.max(70, state.utilityScore + Math.round(Math.random() * 6 - 2)));
    state.communityCapital = Number((state.communityCapital + (Math.random() * 0.25 - 0.08)).toFixed(1));
    state.resilienceIndex = Math.min(100, Math.max(70, state.resilienceIndex + Math.round(Math.random() * 8 - 2)));
    state.inclusionRate = Math.min(100, Math.max(70, state.inclusionRate + Math.round(Math.random() * 6 - 2)));

    state.production = Math.min(100, Math.max(55, state.production + Math.round(Math.random() * 8 - 3)));
    state.distribution = Math.min(100, Math.max(55, state.distribution + Math.round(Math.random() * 8 - 3)));
    state.stability = Math.min(100, Math.max(55, state.stability + Math.round(Math.random() * 8 - 3)));
    state.innovation = Math.min(100, Math.max(55, state.innovation + Math.round(Math.random() * 8 - 3)));
    state.globalIndex = Number(((state.production + state.distribution + state.stability + state.innovation) / 4).toFixed(1));
    render();
  };

  for (let i = 0; i < 6; i += 1) {
    setTimeout(pulse, i * 140);
  }
});

render();
