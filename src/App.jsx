import { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  Link,
  useNavigate,
} from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DEFAULT_CALIBRATION, STRESS_SCENARIOS, runEconomicModel, validateCalibration } from './economicsModel.js';
import { calculateProjectMetrics } from './projectEconomics.js';

const policyConfig = {
  basicAccess: {
    name: 'Accès universel de base',
    description: 'Soins, éducation, internet haut débit et transports comme droits publics.',
    effect: { growth: 3.4, trust: 8, distribution: 7, inclusion: 6 },
  },
  greenInfra: {
    name: 'Infrastructure verte',
    description: 'Énergie propre, villes résilientes et services publics climato-adaptés.',
    effect: { growth: 2.1, stability: 7, resilience: 6, inflation: -0.6 },
  },
  cooperativeCredit: {
    name: 'Crédit coopératif',
    description: 'Financement local pour les PME, les ménages et l’investissement communautaire.',
    effect: { growth: 2.8, distribution: 8, employment: 4, capital: 0.28 },
  },
  publicData: {
    name: 'Données publiques communes',
    description: 'Numérisation ouverte et services publics interopérables.',
    effect: { innovation: 7, inclusion: 5, productivity: 4 },
  },
};

const initialPolicies = {
  basicAccess: true,
  greenInfra: true,
  cooperativeCredit: true,
  publicData: false,
};

const sectorRows = [
  { name: 'Energy', value: 88 },
  { name: 'Food', value: 82 },
  { name: 'Housing', value: 74 },
  { name: 'Education', value: 94 },
  { name: 'Health', value: 89 },
];

const regionRows = [
  { region: 'North', growth: 7.4, trust: 94, resilience: 88 },
  { region: 'Coastal', growth: 6.7, trust: 90, resilience: 85 },
  { region: 'Rural', growth: 5.2, trust: 87, resilience: 82 },
  { region: 'Urban Core', growth: 8.1, trust: 92, resilience: 90 },
];

const baseTrend = [
  { year: '2025', growth: 4.8, stability: 63, innovation: 68 },
  { year: '2026', growth: 5.4, stability: 67, innovation: 72 },
  { year: '2027', growth: 6.1, stability: 71, innovation: 77 },
  { year: '2028', growth: 6.9, stability: 76, innovation: 84 },
  { year: '2029', growth: 7.8, stability: 81, innovation: 89 },
  { year: '2030', growth: 8.7, stability: 87, innovation: 94 },
];

const roleConfig = {
  admin: {
    label: 'Administrateur',
    nav: ['dashboard', 'simulation', 'scenarios', 'projects', 'users'],
  },
  analyst: {
    label: 'Analyste de politiques',
    nav: ['dashboard', 'simulation', 'scenarios', 'projects'],
  },
  citizen: {
    label: 'Conseiller citoyen',
    nav: ['dashboard', 'scenarios', 'projects'],
  },
};

function calculateMetrics(policies) {
  let growth = 6.8;
  let trust = 91;
  let inflation = 2.4;
  let employment = 94;
  let utility = 87;
  let resilience = 84;
  let inclusion = 96;
  let capital = 1.4;
  let productivity = 82;
  let distribution = 88;
  let stability = 76;
  let innovation = 93;

  Object.entries(policies).forEach(([key, enabled]) => {
    if (!enabled) return;

    const effect = policyConfig[key].effect;
    growth += effect.growth || 0;
    trust += effect.trust || 0;
    inflation += effect.inflation || 0;
    employment += effect.employment || 0;
    utility += effect.utility || 0;
    resilience += effect.resilience || 0;
    inclusion += effect.inclusion || 0;
    capital += effect.capital || 0;
    productivity += effect.productivity || 0;
    distribution += effect.distribution || 0;
    stability += effect.stability || 0;
    innovation += effect.innovation || 0;
  });

  return {
    growth: Number(Math.min(10, growth).toFixed(1)),
    trust: Math.min(100, trust),
    inflation: Number(Math.max(1.1, inflation).toFixed(1)),
    employment: Math.min(99, employment),
    utility: Math.min(100, utility),
    resilience: Math.min(100, resilience),
    inclusion: Math.min(100, inclusion),
    capital: Number(Math.min(3.5, capital).toFixed(1)),
    productivity: Math.min(100, productivity),
    distribution: Math.min(100, distribution),
    stability: Math.min(100, stability),
    innovation: Math.min(100, innovation),
  };
}

function ProtectedRoute({ children, allowedRoles, role }) {
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@civitas.org');
  const [password, setPassword] = useState('demo123');
  const [role, setRole] = useState('admin');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (email && password) {
      onLogin({ email, role });
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="brand-wrap">
          <div className="brand-mark">C</div>
          <div>
            <p className="eyebrow accent">ÉCONOMIE DE DEMAIN</p>
            <h1>Civitas 2.0</h1>
          </div>
        </div>

        <h2>Plateforme de prospérité publique</h2>
        <p className="auth-copy">
          Concevez des institutions résilientes, des richesses partagées et une croissance durable grâce à un système économique axé sur les politiques publiques.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Courriel professionnel
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>

          <label>
            Mot de passe
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>

          <label>
            Rôle
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="admin">Administrateur</option>
              <option value="analyst">Analyste de politiques</option>
              <option value="citizen">Conseiller citoyen</option>
            </select>
          </label>

          <button type="submit" className="primary-btn full-width">Se connecter</button>
        </form>

        <div className="demo-box">
          <span>Accès démo</span>
          <strong>admin@civitas.org / demo123</strong>
        </div>
      </div>
    </div>
  );
}

function AppShell({ user, onLogout, children }) {
  const isAdmin = user.role === 'admin';

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">C</div>
          <div>
            <p className="eyebrow">ÉCONOMIE DE DEMAIN</p>
            <h1>Civitas 2.0</h1>
          </div>
        </div>

        <nav className="nav" aria-label="Navigation principale">
          {roleConfig[user.role].nav.includes('dashboard') && <Link to="/dashboard">Tableau de bord</Link>}
          {roleConfig[user.role].nav.includes('simulation') && <Link to="/simulation">Simulation</Link>}
          {roleConfig[user.role].nav.includes('scenarios') && <Link to="/scenarios">Scénarios</Link>}
          {roleConfig[user.role].nav.includes('projects') && <Link to="/projects">Projets</Link>}
          {isAdmin && <Link to="/users">Utilisateurs</Link>}
        </nav>

        <div className="topbar-actions">
          <span className="role-tag">{roleConfig[user.role].label}</span>
          <button className="ghost-btn" onClick={onLogout}>Déconnexion</button>
        </div>
      </header>

      {children}
    </div>
  );
}

function DashboardPage({ policies, projects }) {
  const metrics = useMemo(() => calculateMetrics(policies), [policies]);
  const indexScore = Number(((metrics.productivity + metrics.distribution + metrics.stability + metrics.innovation) / 4).toFixed(1));
  const projectsWithReportedResults = projects.filter((project) => project.actualAnnualRevenue != null && project.actualAnnualOperatingCosts != null);
  const reportedOperatingSurplus = projectsWithReportedResults.reduce((total, project) => total + Number(project.actualAnnualRevenue) - Number(project.actualAnnualOperatingCosts), 0);

  const chartData = [
    { name: 'Croissance', value: metrics.growth },
    { name: 'Confiance', value: metrics.trust },
    { name: 'Résilience', value: metrics.resilience },
    { name: 'Innovation', value: metrics.innovation },
  ];

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow accent">Moteur de prospérité résiliente</p>
          <h2>Construisez une économie qui récompense les personnes, les territoires et la valeur publique.</h2>
          <p className="lead">
            Un modèle centré sur l’humain, conçu autour de la richesse publique, des infrastructures résilientes, du financement coopératif et de la croissance durable.
          </p>
          <div className="hero-actions">
            <Link to="/simulation" className="primary-btn">Lancer le pilote</Link>
            <Link to="/scenarios" className="ghost-btn">Voir les scénarios</Link>
          </div>
        </div>

        <div className="hero-panel glass">
          <div className="panel-header">
            <span>Pulse économique national</span>
            <span className="live-pill">En direct</span>
          </div>

          <div className="big-number">
            <span className="label">Indice de richesse commune</span>
            <strong>{indexScore.toFixed(1)}</strong>
            <small>+{(indexScore - 70).toFixed(1)}% ce trimestre</small>
          </div>

          <div className="mini-grid">
            <div>
              <span>Croissance</span>
              <strong>{metrics.growth.toFixed(1)}%</strong>
            </div>
            <div>
              <span>Confiance</span>
              <strong>{metrics.trust}</strong>
            </div>
            <div>
              <span>Inflation</span>
              <strong>{metrics.inflation.toFixed(1)}%</strong>
            </div>
            <div>
              <span>Emploi</span>
              <strong>{metrics.employment}%</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card glass">
          <span className="kicker">Score d’utilité publique</span>
          <h3>{metrics.utility}</h3>
          <div className="trend up">+12 pts</div>
        </article>

        <article className="stat-card glass">
          <span className="kicker">Capital communautaire</span>
          <h3>${metrics.capital.toFixed(1)}T</h3>
          <div className="trend up">+8,3%</div>
        </article>

        <article className="stat-card glass">
          <span className="kicker">Indice de résilience</span>
          <h3>{metrics.resilience}</h3>
          <div className="trend up">+5,2%</div>
        </article>

        <article className="stat-card glass">
          <span className="kicker">Inclusion numérique</span>
          <h3>{metrics.inclusion}%</h3>
          <div className="trend down">-0,4% de risque</div>
        </article>

        <article className="stat-card glass reported-value-card">
          <span className="kicker">Surplus annuel déclaré</span>
          <h3>{reportedOperatingSurplus.toLocaleString('fr-FR')} €</h3>
          <div className="trend">{projectsWithReportedResults.length} projet(s) · données non auditées</div>
        </article>

        <article className="stat-card glass reported-value-card">
          <span className="kicker">Projets suivis</span>
          <h3>{projects.length}</h3>
          <Link to="/projects" className="trend">Ouvrir le portefeuille</Link>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="panel glass">
          <div className="panel-header">
            <span>Moteur économique</span>
            <span className="tiny-tag">Équilibré</span>
          </div>

          <div className="bars">
            <div className="bar-row">
              <label>Production</label>
              <div className="bar-track"><span style={{ width: `${metrics.productivity}%` }} /></div>
              <strong>{metrics.productivity.toFixed(0)}%</strong>
            </div>
            <div className="bar-row">
              <label>Répartition</label>
              <div className="bar-track"><span style={{ width: `${metrics.distribution}%` }} /></div>
              <strong>{metrics.distribution.toFixed(0)}%</strong>
            </div>
            <div className="bar-row">
              <label>Stabilité</label>
              <div className="bar-track"><span style={{ width: `${metrics.stability}%` }} /></div>
              <strong>{metrics.stability.toFixed(0)}%</strong>
            </div>
            <div className="bar-row">
              <label>Innovation</label>
              <div className="bar-track"><span style={{ width: `${metrics.innovation}%` }} /></div>
              <strong>{metrics.innovation.toFixed(0)}%</strong>
            </div>
          </div>
        </div>

        <div className="panel glass">
          <div className="panel-header">
            <span>Indicateurs du scénario</span>
            <span className="tiny-tag">Recharts</span>
          </div>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="#9eb6d0" />
                <YAxis stroke="#9eb6d0" />
                <Tooltip />
                <Bar dataKey="value" fill="#78b7ff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel glass">
          <div className="panel-header">
            <span>Secteurs clés</span>
            <span className="tiny-tag">Sain</span>
          </div>
          <div className="sector-list">
            {sectorRows.map((sector) => (
              <div className="sector-row" key={sector.name}>
                <span>{sector.name}</span>
                <div className="small-bar"><i style={{ width: `${sector.value}%` }} /></div>
                <strong>{sector.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="panel glass">
          <div className="panel-header">
            <span>Prévision</span>
            <span className="tiny-tag">Vue sur 5 ans</span>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={baseTrend}>
                <defs>
                  <linearGradient id="growthFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#66f0b4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#66f0b4" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                <XAxis dataKey="year" stroke="#9eb6d0" />
                <YAxis stroke="#9eb6d0" />
                <Tooltip />
                <Area type="monotone" dataKey="growth" stroke="#66f0b4" fill="url(#growthFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </main>
  );
}

function SimulationPage({ policies, setPolicies, setScenarios }) {
  const [calibration, setCalibration] = useState(DEFAULT_CALIBRATION);
  const [stress, setStress] = useState('none');
  const [calibrationMessage, setCalibrationMessage] = useState('Jeu de démonstration : remplacez-le par des données documentées.');
  const [calibrationError, setCalibrationError] = useState('');
  const metrics = useMemo(() => runEconomicModel(calibration, policies, stress), [calibration, policies, stress]);
  const navigate = useNavigate();

  const handleToggle = (key) => {
    setPolicies((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateCalibration = (section, key, value) => {
    setCalibration((previous) => ({
      ...previous,
      [section]: { ...previous[section], [key]: Number(value) },
    }));
    setCalibrationMessage('Paramètres modifiés localement; indiquez la source correspondante.');
  };

  const handleCalibrationImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = validateCalibration(JSON.parse(await file.text()));
      setCalibration(imported);
      setCalibrationMessage(`Données chargées : ${imported.metadata.source} (${imported.metadata.year}).`);
      setCalibrationError('');
    } catch (error) {
      setCalibrationError(error.message || 'Fichier de calibration invalide.');
    }
    event.target.value = '';
  };

  const handleRunSimulation = async () => {
    const newScenario = {
      name: `${STRESS_SCENARIOS[stress].label} · ${new Date().toLocaleDateString('fr-FR')}`,
      description: `Projection sur ${calibration.macro.horizonYears} ans; source : ${calibration.metadata.source}. Résultats illustratifs, non validés par des experts.`,
      policies,
      metrics: {
        growth: metrics.growthPct,
        inflation: metrics.inflationRatePct,
        employment: metrics.employmentRatePct,
        unemployment: metrics.unemploymentRatePct,
        trust: calculateMetrics(policies).trust,
        resilience: calculateMetrics(policies).resilience,
        publicDebt: metrics.publicDebt,
        debtToGdpPct: metrics.debtToGdpPct,
        taxRevenue: metrics.taxRevenue,
        publicInvestment: metrics.publicInvestment,
      },
      model: { ...metrics, stress, calibration },
      validation: { status: 'pending', reviews: [] },
      createdAt: new Date().toISOString(),
    };

    const response = await fetch('/api/scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newScenario),
    });

    if (response.ok) {
      const saved = await response.json();
      setScenarios((prev) => [saved, ...prev]);
      navigate('/scenarios');
    }
  };

  return (
    <main className="content-page">
      <div className="page-header">
        <div>
          <p className="eyebrow accent">Modèle multi-sectoriel · projection déterministe</p>
          <h2>Simulation et arbitrage budgétaire</h2>
        </div>
        <button className="primary-btn" onClick={handleRunSimulation}>Lancer la simulation</button>
      </div>

      <div className="model-disclaimer">
        <strong>Prototype analytique, non prévision officielle.</strong>
        <span>Les coefficients par défaut sont illustratifs. Importez des données sourcées et faites examiner les hypothèses avant toute décision publique.</span>
      </div>

      <section className="panel glass calibration-panel">
        <div className="panel-header">
          <span>Calibration des données</span>
          <a className="ghost-btn small" href="/calibration-template.json" download>Télécharger le modèle JSON</a>
        </div>
        <p className="calibration-source">{calibrationMessage}</p>
        <div className="calibration-actions">
          <label className="primary-btn import-btn">
            Importer une calibration JSON
            <input type="file" accept=".json,application/json" onChange={handleCalibrationImport} />
          </label>
          <label className="model-field source-field">
            <span>Source et référence</span>
            <input value={calibration.metadata.source} onChange={(event) => setCalibration((previous) => ({ ...previous, metadata: { ...previous.metadata, source: event.target.value } }))} />
          </label>
          <label className="model-field">
            <span>Année de référence</span>
            <input type="number" value={calibration.metadata.year} onChange={(event) => setCalibration((previous) => ({ ...previous, metadata: { ...previous.metadata, year: Number(event.target.value) } }))} />
          </label>
        </div>
        {calibrationError && <p className="form-error" role="alert">{calibrationError}</p>}
        <details className="assumptions-details">
          <summary>Paramètres macroéconomiques et enveloppe</summary>
          <div className="assumption-grid">
            {[
              ['gdp', 'PIB (milliards)'], ['taxRevenue', 'Recettes fiscales (milliards)'],
              ['publicSpending', 'Dépenses publiques (milliards)'], ['publicDebt', 'Dette publique (milliards)'],
              ['unemploymentRate', 'Chômage (%)'], ['inflationRate', 'Inflation (%)'],
              ['interestRate', 'Taux d’intérêt (%)'], ['baselineGrowth', 'Croissance de référence (%)'],
              ['taxRateChangePp', 'Variation du taux fiscal (points)'], ['horizonYears', 'Horizon (années)'],
              ['publicInvestmentPctGdp', 'Investissement public (% PIB)'],
            ].map(([key, label]) => (
              <label className="model-field" key={key}>
                <span>{label}</span>
                <input type="number" step="0.1" value={calibration.macro[key]} onChange={(event) => updateCalibration('macro', key, event.target.value)} />
              </label>
            ))}
            <label className="model-field">
              <span>Enveloppe de politiques (% PIB)</span>
              <input type="number" min="0" step="0.1" value={calibration.budget.availableProgramBudgetPctGdp} onChange={(event) => setCalibration((previous) => ({ ...previous, budget: { availableProgramBudgetPctGdp: Number(event.target.value) } }))} />
            </label>
          </div>
        </details>
      </section>

      <section className="dashboard-grid two-up simulation-inputs">
        <div className="panel glass">
          <div className="panel-header">
            <span>Leviers et coûts</span>
            <span className="tiny-tag">Coût en % du PIB</span>
          </div>

          <div className="switch-list">
            {Object.entries(policyConfig).map(([key, value]) => (
              <label className="switch-row" key={key}>
                <div>
                  <strong>{value.name}</strong>
                  <small>{value.description} Coût estimé : {calibration.policies[key].costPctGdp}% du PIB.</small>
                </div>
                <input type="checkbox" checked={policies[key]} onChange={() => handleToggle(key)} />
              </label>
            ))}
          </div>
          <label className="model-field stress-select">
            <span>Scénario de stress</span>
            <select value={stress} onChange={(event) => setStress(event.target.value)}>
              {Object.entries(STRESS_SCENARIOS).map(([key, scenario]) => <option value={key} key={key}>{scenario.label}</option>)}
            </select>
          </label>
        </div>

        <div className="panel glass">
          <div className="panel-header">
            <span>Projection à {calibration.macro.horizonYears} ans</span>
            <span className={`tiny-tag ${metrics.budgetStatus === 'rationed' ? 'warning-tag' : ''}`}>
              {metrics.budgetStatus === 'rationed' ? 'Budget rationné' : 'Dans l’enveloppe'}
            </span>
          </div>

          <div className="metrics-stack">
            <div className="metric-pill"><span>PIB projeté</span><strong>{metrics.gdp.toLocaleString('fr-FR')} Md</strong></div>
            <div className="metric-pill"><span>Croissance annuelle</span><strong>{metrics.growthPct}%</strong></div>
            <div className="metric-pill"><span>Chômage</span><strong>{metrics.unemploymentRatePct}%</strong></div>
            <div className="metric-pill"><span>Inflation</span><strong>{metrics.inflationRatePct}%</strong></div>
            <div className="metric-pill"><span>Dette / PIB</span><strong>{metrics.debtToGdpPct}%</strong></div>
            <div className="metric-pill"><span>Déficit annuel projeté</span><strong>{metrics.annualDeficit.toLocaleString('fr-FR')} Md</strong></div>
            <div className="metric-pill"><span>Recettes fiscales</span><strong>{metrics.taxRevenue.toLocaleString('fr-FR')} Md</strong></div>
            <div className="metric-pill"><span>Investissement public</span><strong>{metrics.publicInvestment.toLocaleString('fr-FR')} Md</strong></div>
          </div>
          <p className="budget-note">
            Coût demandé : {metrics.requestedCostPctGdp}% du PIB · coût retenu : {metrics.approvedCostPctGdp}% · facteur d’exécution : {Math.round(metrics.implementationScale * 100)}%.
            Recettes fiscales finales : {metrics.taxRevenueChange > 0 ? '+' : ''}{metrics.taxRevenueChange} Md vs année de référence.
          </p>
        </div>
      </section>

      <section className="dashboard-grid two-up model-analysis-grid">
        <div className="panel glass">
          <div className="panel-header"><span>Trajectoire budgétaire</span><span className="tiny-tag">{calibration.metadata.currency} · Md</span></div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metrics.yearly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="year" stroke="#9eb6d0" />
                <YAxis stroke="#9eb6d0" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="gdp" name="PIB" stroke="#66f0b4" strokeWidth={2} />
                <Line type="monotone" dataKey="debt" name="Dette publique" stroke="#ffd166" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel glass">
          <div className="panel-header"><span>Impacts sectoriels</span><span className="tiny-tag">Croissance annuelle (%)</span></div>
          <div className="sector-model-list">
            {metrics.sectorResults.map((sector) => (
              <div className="sector-model-row" key={sector.id}>
                <span>{sector.name}</span>
                <div className="bar-track"><span style={{ width: `${Math.max(2, Math.min(100, 50 + sector.growthPct * 10))}%` }} /></div>
                <strong>{sector.growthPct}%</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-grid two-up model-analysis-grid">
        <div className="panel glass">
          <div className="panel-header"><span>Analyse de sensibilité</span><span className="tiny-tag">Coefficient d’impact</span></div>
          <p className="panel-note">Le coefficient varie de 0,5× à 1,5×; les autres hypothèses restent constantes.</p>
          <div className="sensitivity-table-wrap">
            <table className="sensitivity-table">
              <thead><tr><th>Impact</th><th>Croissance</th><th>Chômage</th><th>Dette / PIB</th></tr></thead>
              <tbody>{metrics.sensitivity.map((row) => (
                <tr key={row.multiplier}><td>{row.multiplier}×</td><td>{row.growthPct}%</td><td>{row.unemploymentRatePct}%</td><td>{row.debtToGdpPct}%</td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
        <div className="panel glass expert-validation-panel">
          <div className="panel-header"><span>Revue par des experts</span><span className="warning-tag tiny-tag">Non validé</span></div>
          <p>Aucune validation indépendante n’est enregistrée. Pour une revue en économie publique, joindre les sources, le millésime, les définitions, les coefficients et les tests de sensibilité.</p>
          <div className="review-checklist">
            <span>□ Données et unités vérifiées</span>
            <span>□ Hypothèses et identification examinées</span>
            <span>□ Résultats répliqués par un évaluateur indépendant</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function ScenariosPage({ scenarios, setScenarios }) {
  const [selectedId, setSelectedId] = useState(scenarios[0]?.id ?? '');
  const [reviewer, setReviewer] = useState({ name: '', institution: '', expertise: '', verdict: 'with-reservations', comment: '' });
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    if (selectedId === '' && scenarios[0]) setSelectedId(scenarios[0].id);
  }, [scenarios, selectedId]);

  useEffect(() => {
    fetch('/api/scenarios')
      .then((res) => res.json())
      .then((data) => setScenarios(data))
      .catch(() => {});
  }, [setScenarios]);

  const selectedScenario = scenarios.find((item) => item.id === selectedId) ?? scenarios[0];

  const removeScenario = async (id) => {
    await fetch(`/api/scenarios/${id}`, { method: 'DELETE' });
    const next = scenarios.filter((item) => item.id !== id);
    setScenarios(next);
  };

  const addExpertReview = async (event) => {
    event.preventDefault();
    if (!selectedScenario || !reviewer.name.trim() || !reviewer.institution.trim() || !reviewer.expertise.trim()) return;
    const review = { ...reviewer, name: reviewer.name.trim(), institution: reviewer.institution.trim(), expertise: reviewer.expertise.trim(), comment: reviewer.comment.trim(), submittedAt: new Date().toISOString() };
    const validation = { status: 'reviewed', reviews: [...(selectedScenario.validation?.reviews ?? []), review] };
    try {
      const response = await fetch(`/api/scenarios/${selectedScenario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validation }),
      });
      if (!response.ok) throw new Error('La revue n’a pas pu être enregistrée.');
      const updated = await response.json();
      setScenarios((current) => current.map((item) => item.id === updated.id ? updated : item));
      setReviewer({ name: '', institution: '', expertise: '', verdict: 'with-reservations', comment: '' });
      setReviewMessage('Revue déclarée enregistrée. L’identité et les qualifications restent à vérifier indépendamment.');
    } catch (error) {
      setReviewMessage(error.message || 'Erreur lors de l’enregistrement de la revue.');
    }
  };

  return (
    <main className="content-page">
      <div className="page-header">
        <div>
          <p className="eyebrow accent">Scénarios enregistrés</p>
          <h2>Bibliothèque de scénarios de politique</h2>
        </div>
      </div>

      <section className="scenario-layout">
        <div className="panel glass scenario-list">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              className={`scenario-item ${scenario.id === selectedScenario?.id ? 'active' : ''}`}
              onClick={() => setSelectedId(scenario.id)}
            >
              <strong>{scenario.name}</strong>
              <span>{scenario.description}</span>
              <small>{new Date(scenario.createdAt).toLocaleDateString()}</small>
            </button>
          ))}
        </div>

        <div className="panel glass scenario-detail">
          {selectedScenario ? (
            <>
              <div className="panel-header">
                <span>{selectedScenario.name}</span>
                <button className="ghost-btn small" onClick={() => removeScenario(selectedScenario.id)}>Supprimer</button>
              </div>

              <p>{selectedScenario.description}</p>

              <section className="expert-review-section">
                <div className="panel-header">
                  <span>Évaluations déclarées</span>
                  <span className={`tiny-tag ${selectedScenario.validation?.reviews?.length ? '' : 'warning-tag'}`}>
                    {selectedScenario.validation?.reviews?.length ? `${selectedScenario.validation.reviews.length} revue(s) déclarée(s)` : 'Aucune revue'}
                  </span>
                </div>
                <p className="panel-note">Les informations ci-dessous sont fournies par les évaluateurs et ne sont pas vérifiées par la plateforme.</p>
                {(selectedScenario.validation?.reviews ?? []).map((review, index) => (
                  <article className="review-record" key={`${review.submittedAt}-${index}`}>
                    <strong>{review.name}</strong>
                    <span>{review.expertise} · {review.institution}</span>
                    <span>Conclusion : {review.verdict === 'favorable' ? 'Favorable' : review.verdict === 'with-reservations' ? 'Favorable avec réserves' : 'Révisions nécessaires'}</span>
                    {review.comment && <p>{review.comment}</p>}
                  </article>
                ))}
                <form className="review-form" onSubmit={addExpertReview}>
                  <label className="model-field"><span>Nom de l’évaluateur</span><input required value={reviewer.name} onChange={(event) => setReviewer((current) => ({ ...current, name: event.target.value }))} /></label>
                  <label className="model-field"><span>Institution</span><input required value={reviewer.institution} onChange={(event) => setReviewer((current) => ({ ...current, institution: event.target.value }))} /></label>
                  <label className="model-field"><span>Expertise en économie publique</span><input required value={reviewer.expertise} onChange={(event) => setReviewer((current) => ({ ...current, expertise: event.target.value }))} /></label>
                  <label className="model-field"><span>Conclusion déclarée</span><select value={reviewer.verdict} onChange={(event) => setReviewer((current) => ({ ...current, verdict: event.target.value }))}><option value="favorable">Favorable</option><option value="with-reservations">Favorable avec réserves</option><option value="revisions-required">Révisions nécessaires</option></select></label>
                  <label className="model-field review-comment"><span>Observations</span><textarea rows="3" value={reviewer.comment} onChange={(event) => setReviewer((current) => ({ ...current, comment: event.target.value }))} /></label>
                  <button className="ghost-btn small" type="submit">Enregistrer une revue déclarée</button>
                  {reviewMessage && <p className="panel-note" role="status">{reviewMessage}</p>}
                </form>
              </section>

              <div className="metrics-grid">
                <div><span>Croissance</span><strong>{selectedScenario.metrics.growth ?? 0}%</strong></div>
                <div><span>Confiance</span><strong>{selectedScenario.metrics.trust ?? 0}</strong></div>
                <div><span>Inflation</span><strong>{selectedScenario.metrics.inflation ?? 0}%</strong></div>
                <div><span>Résilience</span><strong>{selectedScenario.metrics.resilience ?? 0}</strong></div>
              </div>

              <div className="chart-box">
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Croissance', value: selectedScenario.metrics.growth ?? 0 },
                        { name: 'Stabilité', value: selectedScenario.metrics.stability ?? 0 },
                        { name: 'Innovation', value: selectedScenario.metrics.innovation ?? 0 },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      fill="#78b7ff"
                      label
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <p>Aucun scénario sélectionné.</p>
          )}
        </div>
      </section>
    </main>
  );
}

const emptyProjectForm = {
  name: '',
  sector: 'Énergie',
  location: '',
  description: '',
  investmentRequired: 0,
  publicFunding: 0,
  privateFunding: 0,
  annualRevenue: 0,
  annualOperatingCosts: 0,
  jobs: 0,
  beneficiaries: 0,
  localProcurementPct: 0,
  horizonYears: 5,
  scenarioId: '',
};

const projectStatusLabels = {
  idea: 'Idée à étudier',
  'seeking-funding': 'Recherche de financement',
  active: 'En activité',
  completed: 'Terminé',
};

function ProjectsPage({ projects, setProjects, scenarios }) {
  const [form, setForm] = useState(emptyProjectForm);
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? '');
  const [actuals, setActuals] = useState({ revenue: '', costs: '', jobs: '', source: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/projects')
      .then((response) => response.json())
      .then((data) => {
        setProjects(data);
        if (data[0]) setSelectedId((current) => current || data[0].id);
      })
      .catch(() => setError('Impossible de charger les projets. Vérifiez que le serveur API fonctionne.'));
  }, [setProjects]);

  const selectedProject = projects.find((project) => project.id === selectedId) ?? projects[0];
  const estimate = selectedProject ? calculateProjectMetrics(selectedProject) : null;

  useEffect(() => {
    setActuals({
      revenue: selectedProject?.actualAnnualRevenue ?? '',
      costs: selectedProject?.actualAnnualOperatingCosts ?? '',
      jobs: selectedProject?.actualJobs ?? '',
      source: selectedProject?.actualDataSource ?? '',
    });
  }, [selectedProject?.id]);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: ['investmentRequired', 'publicFunding', 'privateFunding', 'annualRevenue', 'annualOperatingCosts', 'jobs', 'beneficiaries', 'localProcurementPct', 'horizonYears'].includes(key) ? Number(value) : value }));
  };

  const saveProject = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Le projet n’a pas pu être enregistré.');
      setProjects((current) => [result, ...current]);
      setSelectedId(result.id);
      setForm(emptyProjectForm);
      setMessage('Projet enregistré. Les projections sont des estimations fournies par son porteur.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const updateProject = async (changes) => {
    if (!selectedProject) return;
    setError('');
    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Mise à jour impossible.');
      setProjects((current) => current.map((project) => project.id === result.id ? result : project));
      setMessage('Projet mis à jour.');
    } catch (updateError) {
      setError(updateError.message);
    }
  };

  const saveActuals = async (event) => {
    event.preventDefault();
    await updateProject({
      status: selectedProject.status === 'idea' || selectedProject.status === 'seeking-funding' ? 'active' : selectedProject.status,
      actualAnnualRevenue: Number(actuals.revenue),
      actualAnnualOperatingCosts: Number(actuals.costs),
      actualJobs: Number(actuals.jobs),
      actualDataSource: actuals.source.trim(),
      measuredAt: new Date().toISOString(),
    });
  };

  return (
    <main className="content-page">
      <div className="page-header">
        <div>
          <p className="eyebrow accent">Des idées aux activités réelles</p>
          <h2>Projets et création de valeur</h2>
        </div>
      </div>

      <div className="model-disclaimer">
        <strong>Cette page ne traite aucun paiement et ne garantit aucun financement ni bénéfice.</strong>
        <span>Elle structure des propositions, révèle les besoins de financement et permet de comparer les estimations aux résultats déclarés après lancement.</span>
      </div>

      <section className="project-workspace">
        <form className="panel glass project-form" onSubmit={saveProject}>
          <div className="panel-header"><span>Créer une proposition de projet</span><span className="tiny-tag">Prévisions du porteur</span></div>
          <label className="model-field"><span>Nom du projet</span><input required value={form.name} onChange={(event) => updateForm('name', event.target.value)} /></label>
          <div className="project-form-pair">
            <label className="model-field"><span>Secteur</span><select value={form.sector} onChange={(event) => updateForm('sector', event.target.value)}>{['Énergie', 'Alimentation', 'Logement', 'Éducation', 'Santé', 'Industrie', 'Services', 'Autre'].map((sector) => <option key={sector}>{sector}</option>)}</select></label>
            <label className="model-field"><span>Ville ou territoire</span><input required value={form.location} onChange={(event) => updateForm('location', event.target.value)} /></label>
          </div>
          <label className="model-field"><span>Besoin auquel le projet répond</span><textarea rows="3" value={form.description} onChange={(event) => updateForm('description', event.target.value)} /></label>
          <label className="model-field"><span>Scénario économique associé (facultatif)</span><select value={form.scenarioId} onChange={(event) => updateForm('scenarioId', event.target.value)}><option value="">Aucun scénario associé</option>{scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.name}</option>)}</select></label>
          <div className="project-form-pair">
            <label className="model-field"><span>Investissement initial requis (€)</span><input type="number" min="0" step="1000" required value={form.investmentRequired} onChange={(event) => updateForm('investmentRequired', event.target.value)} /></label>
            <label className="model-field"><span>Financement public envisagé (€)</span><input type="number" min="0" step="1000" required value={form.publicFunding} onChange={(event) => updateForm('publicFunding', event.target.value)} /></label>
            <label className="model-field"><span>Financement privé / coopératif (€)</span><input type="number" min="0" step="1000" required value={form.privateFunding} onChange={(event) => updateForm('privateFunding', event.target.value)} /></label>
            <label className="model-field"><span>Horizon de projection (années)</span><input type="number" min="1" max="30" required value={form.horizonYears} onChange={(event) => updateForm('horizonYears', event.target.value)} /></label>
            <label className="model-field"><span>Revenus annuels estimés (€)</span><input type="number" min="0" step="1000" required value={form.annualRevenue} onChange={(event) => updateForm('annualRevenue', event.target.value)} /></label>
            <label className="model-field"><span>Charges annuelles estimées (€)</span><input type="number" min="0" step="1000" required value={form.annualOperatingCosts} onChange={(event) => updateForm('annualOperatingCosts', event.target.value)} /></label>
            <label className="model-field"><span>Emplois attendus</span><input type="number" min="0" step="1" required value={form.jobs} onChange={(event) => updateForm('jobs', event.target.value)} /></label>
            <label className="model-field"><span>Ménages bénéficiaires estimés</span><input type="number" min="0" step="1" required value={form.beneficiaries} onChange={(event) => updateForm('beneficiaries', event.target.value)} /></label>
          </div>
          <label className="model-field"><span>Part des achats réalisée localement (%)</span><input type="number" min="0" max="100" step="1" required value={form.localProcurementPct} onChange={(event) => updateForm('localProcurementPct', event.target.value)} /></label>
          <button className="primary-btn" type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer la proposition'}</button>
          {message && <p className="panel-note" role="status">{message}</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
        </form>

        <section className="project-results">
          <div className="panel glass project-list-panel">
            <div className="panel-header"><span>Portefeuille de projets</span><span className="tiny-tag">{projects.length} projet(s)</span></div>
            {projects.length ? <div className="project-list">{projects.map((project) => (
              <button type="button" className={`project-item ${project.id === selectedProject?.id ? 'active' : ''}`} key={project.id} onClick={() => setSelectedId(project.id)}>
                <strong>{project.name}</strong><span>{project.sector} · {project.location}</span><small>{projectStatusLabels[project.status] || project.status}</small>
              </button>
            ))}</div> : <p className="panel-note">Aucune proposition pour le moment.</p>}
          </div>

          {selectedProject && estimate && <div className="panel glass project-detail-panel">
            <div className="panel-header"><span>{selectedProject.name}</span><label className="model-field status-field"><span>Statut</span><select value={selectedProject.status} onChange={(event) => updateProject({ status: event.target.value })}>{Object.entries(projectStatusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></div>
            <p className="panel-note">{selectedProject.sector} · {selectedProject.location}{selectedProject.description ? ` · ${selectedProject.description}` : ''}</p>
            <div className="project-metric-grid">
              <div><span>Besoin d’investissement</span><strong>{selectedProject.investmentRequired.toLocaleString('fr-FR')} €</strong></div>
              <div><span>Financement à trouver</span><strong>{estimate.fundingGap.toLocaleString('fr-FR')} €</strong></div>
              <div><span>Couverture financière</span><strong>{estimate.fundingCoveragePct.toFixed(0)}%</strong></div>
              <div><span>Surplus annuel estimé</span><strong>{estimate.projectedAnnualOperatingSurplus.toLocaleString('fr-FR')} €</strong></div>
              <div><span>Surplus cumulé estimé</span><strong>{estimate.projectedCumulativeOperatingSurplus.toLocaleString('fr-FR')} €</strong></div>
              <div><span>Après investissement initial*</span><strong>{estimate.projectedNetAfterInitialInvestment.toLocaleString('fr-FR')} €</strong></div>
              <div><span>Emplois estimés</span><strong>{selectedProject.jobs}</strong></div>
              <div><span>Achats locaux estimés</span><strong>{selectedProject.localProcurementPct}%</strong></div>
            </div>
            <p className="panel-note">* Somme non actualisée des surplus d’exploitation estimés sur {selectedProject.horizonYears} ans, moins l’investissement initial. Cela ne mesure pas la valeur ajoutée sociale ni une rentabilité garantie.</p>
            <div className="measured-outcome">
              <div className="panel-header"><span>Résultats annuels déclarés après lancement</span><span className={`tiny-tag ${estimate.measuredOperatingSurplus == null ? 'warning-tag' : ''}`}>{estimate.measuredOperatingSurplus == null ? 'Non renseignés' : 'Déclarés'}</span></div>
              {estimate.measuredOperatingSurplus == null ? <p className="panel-note">Saisissez des chiffres observés et indiquez leur source pour distinguer les résultats réels des prévisions.</p> : <div className="measured-surplus"><span>Surplus d’exploitation déclaré</span><strong>{estimate.measuredOperatingSurplus.toLocaleString('fr-FR')} €</strong><small>Source déclarée : {selectedProject.actualDataSource || 'non précisée'} · {selectedProject.measuredAt ? new Date(selectedProject.measuredAt).toLocaleDateString('fr-FR') : ''}</small></div>}
              <form className="actuals-form" onSubmit={saveActuals}>
                <label className="model-field"><span>Revenus observés (€ / an)</span><input type="number" min="0" required value={actuals.revenue} onChange={(event) => setActuals((current) => ({ ...current, revenue: event.target.value }))} /></label>
                <label className="model-field"><span>Charges observées (€ / an)</span><input type="number" min="0" required value={actuals.costs} onChange={(event) => setActuals((current) => ({ ...current, costs: event.target.value }))} /></label>
                <label className="model-field"><span>Emplois observés</span><input type="number" min="0" required value={actuals.jobs} onChange={(event) => setActuals((current) => ({ ...current, jobs: event.target.value }))} /></label>
                <label className="model-field"><span>Source des résultats</span><input required value={actuals.source} onChange={(event) => setActuals((current) => ({ ...current, source: event.target.value }))} /></label>
                <button className="ghost-btn small" type="submit">Enregistrer les résultats déclarés</button>
              </form>
            </div>
          </div>}
        </section>
      </section>
      {error && <p className="form-error" role="alert">{error}</p>}
    </main>
  );
}

function UsersPage() {
  const users = [
    { name: 'Nia Okafor', role: 'Administrateur', email: 'nia@civitas.org' },
    { name: 'Milo Chen', role: 'Analyste de politiques', email: 'milo@civitas.org' },
    { name: 'Ava Jordan', role: 'Conseiller citoyen', email: 'ava@civitas.org' },
  ];

  return (
    <main className="content-page">
      <div className="page-header">
        <div>
          <p className="eyebrow accent">Accès système</p>
          <h2>Rôles utilisateurs</h2>
        </div>
      </div>

      <div className="panel glass users-panel">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Rôle</th>
              <th>E-mail</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email}>
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [policies, setPolicies] = useState(initialPolicies);
  const [scenarios, setScenarios] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('/api/scenarios')
      .then((res) => res.json())
      .then((data) => setScenarios(data))
      .catch(() => setScenarios([]));
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch(() => setProjects([]));
  }, []);

  const handleLogin = ({ email, role }) => {
    setUser({ email, role });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'analyst', 'citizen']} role={user?.role}>
              <AppShell user={user} onLogout={handleLogout}>
                <DashboardPage policies={policies} projects={projects} />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/simulation"
          element={
            <ProtectedRoute allowedRoles={['admin', 'analyst']} role={user?.role}>
              <AppShell user={user} onLogout={handleLogout}>
                <SimulationPage policies={policies} setPolicies={setPolicies} setScenarios={setScenarios} />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/scenarios"
          element={
            <ProtectedRoute allowedRoles={['admin', 'analyst', 'citizen']} role={user?.role}>
              <AppShell user={user} onLogout={handleLogout}>
                <ScenariosPage scenarios={scenarios} setScenarios={setScenarios} />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={['admin', 'analyst', 'citizen']} role={user?.role}>
              <AppShell user={user} onLogout={handleLogout}>
                <ProjectsPage projects={projects} setProjects={setProjects} scenarios={scenarios} />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin']} role={user?.role}>
              <AppShell user={user} onLogout={handleLogout}>
                <UsersPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
