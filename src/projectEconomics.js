const amountFields = [
  'investmentRequired',
  'publicFunding',
  'privateFunding',
  'annualRevenue',
  'annualOperatingCosts',
  'jobs',
  'beneficiaries',
  'localProcurementPct',
  'horizonYears',
];

export function validateProject(project) {
  if (!project || typeof project !== 'object') throw new Error('Projet invalide.');
  if (!project.name?.trim() || !project.sector?.trim() || !project.location?.trim()) {
    throw new Error('Renseignez le nom du projet, son secteur et son territoire.');
  }
  for (const key of amountFields) {
    const value = Number(project[key]);
    if (!Number.isFinite(value) || value < 0) throw new Error(`Valeur invalide ou négative : ${key}.`);
  }
  for (const key of ['actualAnnualRevenue', 'actualAnnualOperatingCosts', 'actualJobs']) {
    if (project[key] != null && (!Number.isFinite(Number(project[key])) || Number(project[key]) < 0)) {
      throw new Error(`Résultat déclaré invalide ou négatif : ${key}.`);
    }
  }
  if (project.status && !['idea', 'seeking-funding', 'active', 'completed'].includes(project.status)) {
    throw new Error('Statut de projet invalide.');
  }
  const hasReportedResults = project.actualAnnualRevenue != null || project.actualAnnualOperatingCosts != null || project.actualJobs != null;
  if (hasReportedResults && (!project.actualDataSource?.trim() || project.actualAnnualRevenue == null || project.actualAnnualOperatingCosts == null || project.actualJobs == null)) {
    throw new Error('Les résultats déclarés exigent revenus, charges, emplois et source.');
  }
  if (Number(project.localProcurementPct) > 100) throw new Error('Les achats locaux ne peuvent pas dépasser 100 %.');
  if (Number(project.horizonYears) < 1 || Number(project.horizonYears) > 30) throw new Error('L’horizon doit être compris entre 1 et 30 ans.');
  return Object.fromEntries([
    ...Object.entries(project).filter(([key]) => !amountFields.includes(key)),
    ...amountFields.map((key) => [key, Number(project[key])]),
  ]);
}

export function calculateProjectMetrics(project) {
  const validated = validateProject(project);
  const fundingGap = Math.max(0, validated.investmentRequired - validated.publicFunding - validated.privateFunding);
  const surplus = validated.annualRevenue - validated.annualOperatingCosts;
  const projectedCumulativeOperatingSurplus = surplus * validated.horizonYears;
  const projectedNetAfterInitialInvestment = projectedCumulativeOperatingSurplus - validated.investmentRequired;
  const measuredOperatingSurplus = validated.actualAnnualRevenue == null || validated.actualAnnualOperatingCosts == null
    ? null
    : Number(validated.actualAnnualRevenue) - Number(validated.actualAnnualOperatingCosts);

  return {
    fundingGap,
    fundingCoveragePct: validated.investmentRequired === 0
      ? 100
      : Math.min(100, ((validated.publicFunding + validated.privateFunding) / validated.investmentRequired) * 100),
    projectedAnnualOperatingSurplus: surplus,
    projectedCumulativeOperatingSurplus,
    projectedNetAfterInitialInvestment,
    privateCapitalPerPublicUnit: validated.publicFunding > 0 ? validated.privateFunding / validated.publicFunding : null,
    jobsPerMillionInvested: validated.investmentRequired > 0 ? validated.jobs / (validated.investmentRequired / 1_000_000) : null,
    measuredOperatingSurplus,
  };
}