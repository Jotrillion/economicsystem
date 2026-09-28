const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value, label) {
  const email = String(value ?? '').trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new Error(`${label} : adresse e-mail invalide.`);
  return email;
}

function parseCredits(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) {
    throw new Error('Le montant doit être supérieur à 0 et inférieur ou égal à 1 000 000 000 CVC.');
  }
  const cents = Math.round(amount * 100);
  if (Math.abs(cents / 100 - amount) > 0.000001) throw new Error('Les crédits sont limités à deux décimales.');
  return cents;
}

function balanceInCents(balance) {
  return Math.round(Number(balance || 0) * 100);
}

export function getWalletSummary(state, emailValue) {
  const email = normalizeEmail(emailValue, 'Compte');
  const wallet = state.wallets.find((item) => item.email === email);
  return {
    email,
    balance: wallet?.balance ?? 0,
    transactions: state.transactions
      .filter((transaction) => transaction.fromEmail === email || transaction.toEmail === email)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

export function transferCredits(state, input) {
  const fromEmail = normalizeEmail(input.fromEmail, 'Expéditeur');
  const toEmail = normalizeEmail(input.toEmail, 'Destinataire');
  if (fromEmail === toEmail) throw new Error('Un transfert vers votre propre compte est impossible.');
  const amountCents = parseCredits(input.amount);
  const sender = state.wallets.find((wallet) => wallet.email === fromEmail);
  if (!sender) throw new Error('Ce compte de démonstration ne possède pas de portefeuille préchargé.');
  if (balanceInCents(sender.balance) < amountCents) throw new Error('Solde virtuel insuffisant.');

  const wallets = state.wallets.map((wallet) => ({ ...wallet }));
  const senderWallet = wallets.find((wallet) => wallet.email === fromEmail);
  let recipientWallet = wallets.find((wallet) => wallet.email === toEmail);
  if (!recipientWallet) {
    recipientWallet = { email: toEmail, balance: 0 };
    wallets.push(recipientWallet);
  }
  senderWallet.balance = (balanceInCents(senderWallet.balance) - amountCents) / 100;
  recipientWallet.balance = (balanceInCents(recipientWallet.balance) + amountCents) / 100;

  const transaction = {
    id: input.transactionId,
    type: 'transfer',
    fromEmail,
    toEmail,
    amount: amountCents / 100,
    memo: String(input.memo ?? '').trim().slice(0, 160),
    createdAt: input.createdAt,
  };
  return { state: { wallets, transactions: [transaction, ...state.transactions] }, transaction };
}

export function allocateCreditsToProject(state, input) {
  const fromEmail = normalizeEmail(input.fromEmail, 'Expéditeur');
  const amountCents = parseCredits(input.amount);
  const sender = state.wallets.find((wallet) => wallet.email === fromEmail);
  if (!sender) throw new Error('Ce compte de démonstration ne possède pas de portefeuille préchargé.');
  if (!input.projectId || !String(input.projectName ?? '').trim()) throw new Error('Projet cible invalide.');
  if (balanceInCents(sender.balance) < amountCents) throw new Error('Solde virtuel insuffisant.');

  const wallets = state.wallets.map((wallet) => ({ ...wallet }));
  const senderWallet = wallets.find((wallet) => wallet.email === fromEmail);
  senderWallet.balance = (balanceInCents(senderWallet.balance) - amountCents) / 100;
  const transaction = {
    id: input.transactionId,
    type: 'project-allocation',
    fromEmail,
    projectId: String(input.projectId),
    projectName: String(input.projectName).trim().slice(0, 120),
    amount: amountCents / 100,
    memo: String(input.memo ?? '').trim().slice(0, 160),
    createdAt: input.createdAt,
  };
  return { state: { wallets, transactions: [transaction, ...state.transactions] }, transaction };
}

export function getProjectVirtualFunding(state, projectId) {
  return state.transactions
    .filter((transaction) => transaction.type === 'project-allocation' && transaction.projectId === projectId)
    .reduce((total, transaction) => total + balanceInCents(transaction.amount), 0) / 100;
}