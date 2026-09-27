import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateProjectMetrics, validateProject } from '../src/projectEconomics.js';

const project = {
  name: 'Coopérative solaire',
  sector: 'Énergie',
  location: 'Dakar',
  investmentRequired: 1_000_000,
  publicFunding: 200_000,
  privateFunding: 500_000,
  annualRevenue: 400_000,
  annualOperatingCosts: 250_000,
  jobs: 12,
  beneficiaries: 800,
  localProcurementPct: 60,
  horizonYears: 5,
};

test('project metrics distinguish projected surplus from a funding gap', () => {
  const metrics = calculateProjectMetrics(project);

  assert.equal(metrics.fundingGap, 300_000);
  assert.equal(metrics.projectedAnnualOperatingSurplus, 150_000);
  assert.equal(metrics.projectedCumulativeOperatingSurplus, 750_000);
  assert.equal(metrics.projectedNetAfterInitialInvestment, -250_000);
  assert.equal(metrics.measuredOperatingSurplus, null);
});

test('reported outcomes are calculated separately from estimates', () => {
  const metrics = calculateProjectMetrics({
    ...project,
    actualAnnualRevenue: 430_000,
    actualAnnualOperatingCosts: 270_000,
    actualJobs: 13,
    actualDataSource: 'Comptes annuels vérifiés',
  });

  assert.equal(metrics.projectedAnnualOperatingSurplus, 150_000);
  assert.equal(metrics.measuredOperatingSurplus, 160_000);
});

test('project validation rejects impossible procurement percentages', () => {
  assert.throws(() => validateProject({ ...project, localProcurementPct: 120 }), /ne peuvent pas dépasser 100/);
});

test('reported outcomes require a source and non-negative observed values', () => {
  assert.throws(() => validateProject({
    ...project,
    actualAnnualRevenue: 400_000,
    actualAnnualOperatingCosts: 250_000,
    actualJobs: 12,
  }), /exigent revenus, charges, emplois et source/);
  assert.throws(() => validateProject({ ...project, status: 'funded' }), /Statut de projet invalide/);
});