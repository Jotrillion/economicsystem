import test from 'node:test';
import assert from 'node:assert/strict';
import { allocateCreditsToProject, getProjectVirtualFunding, getWalletSummary, transferCredits } from '../src/virtualCurrency.js';

const initial = {
  wallets: [
    { email: 'admin@civitas.org', balance: 100 },
    { email: 'nia@civitas.org', balance: 5 },
  ],
  transactions: [],
};

const transactionDefaults = { transactionId: 'txn-1', createdAt: '2026-09-27T00:00:00.000Z' };

test('virtual transfers conserve credits and record both accounts', () => {
  const result = transferCredits(initial, { ...transactionDefaults, fromEmail: 'admin@civitas.org', toEmail: 'nia@civitas.org', amount: 12.35 });

  assert.equal(getWalletSummary(result.state, 'admin@civitas.org').balance, 87.65);
  assert.equal(getWalletSummary(result.state, 'nia@civitas.org').balance, 17.35);
  assert.equal(result.state.wallets.reduce((sum, wallet) => sum + wallet.balance, 0), 105);
  assert.equal(getWalletSummary(result.state, 'admin@civitas.org').transactions[0].amount, 12.35);
});

test('transfers reject overdrafts, self-transfers, and amounts with excess decimals', () => {
  assert.throws(() => transferCredits(initial, { ...transactionDefaults, fromEmail: 'nia@civitas.org', toEmail: 'admin@civitas.org', amount: 6 }), /insuffisant/);
  assert.throws(() => transferCredits(initial, { ...transactionDefaults, fromEmail: 'admin@civitas.org', toEmail: 'admin@civitas.org', amount: 1 }), /propre compte/);
  assert.throws(() => transferCredits(initial, { ...transactionDefaults, fromEmail: 'admin@civitas.org', toEmail: 'nia@civitas.org', amount: 1.001 }), /deux décimales/);
});

test('project allocations debit the wallet and accumulate separately', () => {
  const result = allocateCreditsToProject(initial, {
    ...transactionDefaults,
    fromEmail: 'admin@civitas.org',
    projectId: 'project-1',
    projectName: 'Coopérative solaire',
    amount: 20,
  });

  assert.equal(getWalletSummary(result.state, 'admin@civitas.org').balance, 80);
  assert.equal(getProjectVirtualFunding(result.state, 'project-1'), 20);
  assert.equal(initial.wallets[0].balance, 100);
});