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
    nav: ['dashboard', 'simulation', 'scenarios', 'users'],
  },
  analyst: {
    label: 'Analyste de politiques',
    nav: ['dashboard', 'simulation', 'scenarios'],
  },
  citizen: {
    label: 'Conseiller citoyen',
    nav: ['dashboard', 'scenarios'],
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

function DashboardPage({ policies }) {
  const metrics = useMemo(() => calculateMetrics(policies), [policies]);
  const indexScore = Number(((metrics.productivity + metrics.distribution + metrics.stability + metrics.innovation) / 4).toFixed(1));

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

function SimulationPage({ policies, setPolicies, scenarios, setScenarios }) {
  const metrics = useMemo(() => calculateMetrics(policies), [policies]);
  const navigate = useNavigate();

  const trendData = [
    { period: 'T1', value: 62 },
    { period: 'T2', value: 68 },
    { period: 'T3', value: 73 },
    { period: 'T4', value: 80 },
    { period: 'T5', value: 88 },
  ];

  const handleToggle = (key) => {
    setPolicies((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRunSimulation = async () => {
    const updatedMetrics = {
      ...calculateMetrics(policies),
      growth: Number((metrics.growth + (Math.random() * 1.5 - 0.5)).toFixed(1)),
      trust: Math.min(100, Math.max(70, metrics.trust + Math.round(Math.random() * 6 - 2))),
      resilience: Math.min(100, Math.max(70, metrics.resilience + Math.round(Math.random() * 6 - 2))),
      inclusion: Math.min(100, Math.max(70, metrics.inclusion + Math.round(Math.random() * 7 - 2))),
    };

    const newScenario = {
      id: `scenario-${Date.now()}`,
      name: 'Simulation en direct',
      description: 'Simulation dynamique des politiques générée à partir des paramètres actuels.',
      policies,
      metrics: updatedMetrics,
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
          <p className="eyebrow accent">Simulateur de politiques</p>
          <h2>Exécuter une simulation économique</h2>
        </div>
        <button className="primary-btn" onClick={handleRunSimulation}>Lancer la simulation</button>
      </div>

      <section className="dashboard-grid two-up">
        <div className="panel glass">
          <div className="panel-header">
            <span>Pile de politiques</span>
            <span className="tiny-tag">Adaptatif</span>
          </div>

          <div className="switch-list">
            {Object.entries(policyConfig).map(([key, value]) => (
              <label className="switch-row" key={key}>
                <div>
                  <strong>{value.name}</strong>
                  <small>{value.description}</small>
                </div>
                <input type="checkbox" checked={policies[key]} onChange={() => handleToggle(key)} />
              </label>
            ))}
          </div>
        </div>

        <div className="panel glass">
          <div className="panel-header">
            <span>Résultat de la simulation</span>
            <span className="tiny-tag">Projection</span>
          </div>

          <div className="metrics-stack">
            <div className="metric-pill"><span>Croissance</span><strong>{metrics.growth.toFixed(1)}%</strong></div>
            <div className="metric-pill"><span>Confiance</span><strong>{metrics.trust}</strong></div>
            <div className="metric-pill"><span>Inflation</span><strong>{metrics.inflation.toFixed(1)}%</strong></div>
            <div className="metric-pill"><span>Résilience</span><strong>{metrics.resilience}</strong></div>
          </div>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="period" stroke="#9eb6d0" />
                <YAxis stroke="#9eb6d0" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#ffd166" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </main>
  );
}

function ScenariosPage({ scenarios, setScenarios }) {
  const [selectedId, setSelectedId] = useState(scenarios[0]?.id ?? '');

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

  useEffect(() => {
    fetch('/api/scenarios')
      .then((res) => res.json())
      .then((data) => setScenarios(data))
      .catch(() => setScenarios([]));
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
                <DashboardPage policies={policies} />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/simulation"
          element={
            <ProtectedRoute allowedRoles={['admin', 'analyst']} role={user?.role}>
              <AppShell user={user} onLogout={handleLogout}>
                <SimulationPage policies={policies} setPolicies={setPolicies} scenarios={scenarios} setScenarios={setScenarios} />
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
