import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CALIBRATION, runEconomicModel, validateCalibration } from '../src/economicsModel.js';

const policies = { basicAccess: true, greenInfra: true, cooperativeCredit: true, publicData: true };

test('model results are deterministic and expose fiscal, labor and investment impacts', () => {
  const first = runEconomicModel(DEFAULT_CALIBRATION, policies);
  const second = runEconomicModel(DEFAULT_CALIBRATION, policies);

  assert.deepEqual(first, second);
  assert.ok(first.gdp > DEFAULT_CALIBRATION.macro.gdp);
  assert.ok(first.publicDebt > 0);
  assert.ok(first.taxRevenue > 0);
  assert.ok(first.publicInvestment > 0);
  assert.equal(first.sensitivity.length, 3);
});

test('implementation is scaled to the available public budget', () => {
  const calibration = structuredClone(DEFAULT_CALIBRATION);
  calibration.budget.availableProgramBudgetPctGdp = 0.5;
  const result = runEconomicModel(calibration, policies);

  assert.equal(result.budgetStatus, 'rationed');
  assert.equal(result.approvedCostPctGdp, 0.5);
  assert.ok(result.implementationScale < 1);
});

test('stress scenario changes economic projections', () => {
  const baseline = runEconomicModel(DEFAULT_CALIBRATION, policies, 'none');
  const energyShock = runEconomicModel(DEFAULT_CALIBRATION, policies, 'energy');

  assert.notEqual(energyShock.growthPct, baseline.growthPct);
  assert.ok(energyShock.inflationRatePct > baseline.inflationRatePct);
});

test('calibration rejects sector shares that do not add to 100 percent', () => {
  const calibration = structuredClone(DEFAULT_CALIBRATION);
  calibration.sectors[0].sharePct = 1;

  assert.throws(() => validateCalibration(calibration), /totaliser 100/);
});