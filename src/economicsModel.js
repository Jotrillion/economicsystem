export const DEFAULT_CALIBRATION = {
  metadata: {
    source: 'Données de démonstration à remplacer',
    year: 2025,
    currency: 'EUR',
  },
  macro: {
    gdp: 1000,
    taxRevenue: 450,
    publicSpending: 480,
    publicDebt: 1100,
    unemploymentRate: 6,
    inflationRate: 2.5,
    interestRate: 3.5,
    baselineGrowth: 1.5,
    taxRateChangePp: 0,
    horizonYears: 5,
    publicInvestmentPctGdp: 4.5,
  },
  budget: {
    availableProgramBudgetPctGdp: 2.25,
  },
  sectors: [
    { id: 'energy', name: 'Énergie', sharePct: 16, employmentSharePct: 4, baseGrowthPct: 1.0 },
    { id: 'food', name: 'Alimentation', sharePct: 8, employmentSharePct: 10, baseGrowthPct: 1.2 },
    { id: 'housing', name: 'Logement', sharePct: 12, employmentSharePct: 6, baseGrowthPct: 1.4 },
    { id: 'education', name: 'Éducation', sharePct: 6, employmentSharePct: 12, baseGrowthPct: 1.0 },
    { id: 'health', name: 'Santé', sharePct: 10, employmentSharePct: 15, baseGrowthPct: 1.3 },
    { id: 'industry', name: 'Industrie', sharePct: 20, employmentSharePct: 18, baseGrowthPct: 1.6 },
    { id: 'services', name: 'Services', sharePct: 28, employmentSharePct: 35, baseGrowthPct: 1.8 },
  ],
  policies: {
    basicAccess: { costPctGdp: 0.85, investmentPctGdp: 0.2, employmentImpactPp: 0.08, sectorEffects: { education: 0.45, health: 0.45, services: 0.12 } },
    greenInfra: { costPctGdp: 0.9, investmentPctGdp: 0.72, employmentImpactPp: 0.12, sectorEffects: { energy: 1.1, housing: 0.1, industry: 0.18 } },
    cooperativeCredit: { costPctGdp: 0.35, investmentPctGdp: 0.1, employmentImpactPp: 0.15, sectorEffects: { food: 0.16, housing: 0.12, industry: 0.32 } },
    publicData: { costPctGdp: 0.2, investmentPctGdp: 0.08, employmentImpactPp: 0.03, sectorEffects: { industry: 0.1, services: 0.3 } },
  },
};

export const STRESS_SCENARIOS = {
  none: { label: 'Aucun choc', inflationPp: 0, unemploymentPp: 0, interestPp: 0, sectorGrowthPp: {} },
  energy: { label: 'Choc énergétique', inflationPp: 2.2, unemploymentPp: 0.4, interestPp: 0.5, sectorGrowthPp: { energy: -12, food: -1.2, industry: -1 } },
  recession: { label: 'Récession mondiale', inflationPp: -0.5, unemploymentPp: 2.5, interestPp: 0, sectorGrowthPp: { energy: -2.5, food: -2, housing: -4, education: -1, health: -0.5, industry: -5, services: -3.5 } },
  rates: { label: 'Hausse des taux', inflationPp: 0.2, unemploymentPp: 0.5, interestPp: 2.5, sectorGrowthPp: { housing: -2.5, industry: -1.2, services: -0.8 } },
};

const POLICY_KEYS = Object.keys(DEFAULT_CALIBRATION.policies);
const round = (value, digits = 2) => Number(value.toFixed(digits));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function validateCalibration(input) {
  if (!input || typeof input !== 'object') throw new Error('Le fichier doit contenir un objet JSON.');
  const { metadata, macro, sectors, budget, policies } = input;
  if (!metadata?.source?.trim()) throw new Error('Indiquez une source de données dans metadata.source.');
  if (!macro || !Array.isArray(sectors) || !budget || !policies) throw new Error('Structure attendue : metadata, macro, budget, sectors et policies.');

  const requiredMacro = ['gdp', 'taxRevenue', 'publicSpending', 'publicDebt', 'unemploymentRate', 'inflationRate', 'interestRate', 'baselineGrowth', 'taxRateChangePp', 'horizonYears', 'publicInvestmentPctGdp'];
  for (const key of requiredMacro) {
    if (!Number.isFinite(Number(macro[key]))) throw new Error(`Valeur macro invalide : ${key}.`);
  }
  if (Number(macro.gdp) <= 0 || Number(macro.horizonYears) < 1 || Number(macro.horizonYears) > 30) throw new Error('Le PIB doit être positif et l’horizon compris entre 1 et 30 ans.');
  if (sectors.length < 2 || sectors.some((sector) => !sector.id || !sector.name || !Number.isFinite(Number(sector.sharePct)) || !Number.isFinite(Number(sector.baseGrowthPct)))) {
    throw new Error('Chaque secteur doit avoir un identifiant, un nom, une part de PIB et une croissance de base.');
  }
  const shareTotal = sectors.reduce((sum, sector) => sum + Number(sector.sharePct), 0);
  if (Math.abs(shareTotal - 100) > 0.5) throw new Error(`Les parts sectorielles doivent totaliser 100 % (actuellement ${round(shareTotal, 1)} %).`);
  for (const key of POLICY_KEYS) {
    const policy = policies[key];
    if (!policy || !Number.isFinite(Number(policy.costPctGdp)) || !Number.isFinite(Number(policy.investmentPctGdp)) || !policy.sectorEffects) {
      throw new Error(`Paramètres de politique manquants ou invalides : ${key}.`);
    }
  }
  if (!Number.isFinite(Number(budget.availableProgramBudgetPctGdp)) || Number(budget.availableProgramBudgetPctGdp) < 0) {
    throw new Error('L’enveloppe budgétaire disponible doit être un nombre positif ou nul.');
  }

  return {
    metadata: { source: metadata.source.trim(), year: Number(metadata.year) || new Date().getFullYear(), currency: metadata.currency || 'EUR' },
    macro: Object.fromEntries(requiredMacro.map((key) => [key, Number(macro[key])])),
    budget: { availableProgramBudgetPctGdp: Number(budget.availableProgramBudgetPctGdp) },
    sectors: sectors.map((sector) => ({
      id: String(sector.id), name: String(sector.name), sharePct: Number(sector.sharePct),
      employmentSharePct: Number(sector.employmentSharePct || 0), baseGrowthPct: Number(sector.baseGrowthPct),
    })),
    policies: Object.fromEntries(POLICY_KEYS.map((key) => [key, {
      costPctGdp: Number(policies[key].costPctGdp),
      investmentPctGdp: Number(policies[key].investmentPctGdp),
      employmentImpactPp: Number(policies[key].employmentImpactPp || 0),
      sectorEffects: Object.fromEntries(Object.entries(policies[key].sectorEffects).map(([sector, effect]) => [sector, Number(effect)])),
    }])),
  };
}

function project(calibration, enabledPolicies, stressKey, impactMultiplier) {
  const { macro, sectors, budget, policies } = calibration;
  const stress = STRESS_SCENARIOS[stressKey] ?? STRESS_SCENARIOS.none;
  const activePolicyKeys = POLICY_KEYS.filter((key) => enabledPolicies[key]);
  const requestedCostPctGdp = activePolicyKeys.reduce((total, key) => total + policies[key].costPctGdp, 0);
  const implementationScale = requestedCostPctGdp === 0 ? 1 : Math.min(1, budget.availableProgramBudgetPctGdp / requestedCostPctGdp);
  const approvedCostPctGdp = requestedCostPctGdp * implementationScale;
  const approvedInvestmentPctGdp = activePolicyKeys.reduce((total, key) => total + policies[key].investmentPctGdp, 0) * implementationScale;
  const sectorResults = sectors.map((sector) => {
    const policyEffect = activePolicyKeys.reduce((total, key) => total + (policies[key].sectorEffects[sector.id] || 0), 0);
    const growthPct = sector.baseGrowthPct + (policyEffect * implementationScale * impactMultiplier) + (stress.sectorGrowthPp[sector.id] || 0);
    return { ...sector, growthPct: round(growthPct), outputContributionPct: round(growthPct * sector.sharePct / 100) };
  });
  const annualGrowthPct = sectorResults.reduce((total, sector) => total + sector.outputContributionPct, 0);
  const taxRate = clamp((macro.taxRevenue / macro.gdp) + macro.taxRateChangePp / 100, 0, 0.8);
  const primarySpendingRatio = macro.publicSpending / macro.gdp;
  let gdp = macro.gdp;
  let debt = macro.publicDebt;
  let taxRevenue = macro.taxRevenue;
  let interestPayments = debt * (macro.interestRate + stress.interestPp) / 100;
  let annualDeficit = macro.publicSpending + (macro.gdp * approvedCostPctGdp / 100) + interestPayments - macro.taxRevenue;
  const yearly = [];
  const unemploymentRate = clamp(
    macro.unemploymentRate - (annualGrowthPct - macro.baselineGrowth) * 0.3 - activePolicyKeys.reduce((sum, key) => sum + policies[key].employmentImpactPp, 0) * implementationScale * impactMultiplier + stress.unemploymentPp,
    0,
    100,
  );
  const inflationRate = Math.max(0, macro.inflationRate + stress.inflationPp + approvedCostPctGdp * 0.12);

  for (let year = 1; year <= macro.horizonYears; year += 1) {
    gdp *= 1 + annualGrowthPct / 100;
    taxRevenue = gdp * taxRate;
    const spending = gdp * (primarySpendingRatio + approvedCostPctGdp / 100);
    interestPayments = debt * (macro.interestRate + stress.interestPp) / 100;
    annualDeficit = spending + interestPayments - taxRevenue;
    debt += annualDeficit;
    yearly.push({ year: macro.year + year, gdp: round(gdp), debt: round(debt), taxRevenue: round(taxRevenue), deficit: round(annualDeficit) });
  }

  return {
    growthPct: round(annualGrowthPct),
    inflationRatePct: round(inflationRate),
    unemploymentRatePct: round(unemploymentRate),
    employmentRatePct: round(100 - unemploymentRate),
    gdp: round(gdp),
    taxRevenue: round(taxRevenue),
    taxRevenueChange: round(taxRevenue - macro.taxRevenue),
    publicSpending: round(gdp * (primarySpendingRatio + approvedCostPctGdp / 100)),
    annualDeficit: round(annualDeficit),
    publicDebt: round(debt),
    debtToGdpPct: round(debt / gdp * 100),
    publicInvestment: round(gdp * (macro.publicInvestmentPctGdp / 100 + approvedInvestmentPctGdp / 100)),
    requestedCostPctGdp: round(requestedCostPctGdp),
    approvedCostPctGdp: round(approvedCostPctGdp),
    availableBudgetPctGdp: round(budget.availableProgramBudgetPctGdp),
    implementationScale: round(implementationScale, 3),
    budgetStatus: implementationScale < 1 ? 'rationed' : 'within-cap',
    sectorResults,
    yearly,
    assumptions: {
      impactMultiplier,
      stress: stress.label,
      taxRatePct: round(taxRate * 100),
      interestRatePct: round(macro.interestRate + stress.interestPp),
    },
  };
}

export function runEconomicModel(calibration, enabledPolicies, stressKey = 'none') {
  const validated = validateCalibration(calibration);
  const base = project(validated, enabledPolicies, stressKey, 1);
  const sensitivity = [0.5, 1, 1.5].map((multiplier) => {
    const result = project(validated, enabledPolicies, stressKey, multiplier);
    return { multiplier, growthPct: result.growthPct, debtToGdpPct: result.debtToGdpPct, unemploymentRatePct: result.unemploymentRatePct };
  });
  return { ...base, sensitivity, calibration: validated.metadata };
}