import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.join(__dirname, 'scenarios.json');

app.use(cors());
app.use(express.json());

const ensureDataFile = () => {
  if (!fs.existsSync(dataFilePath)) {
    const seed = [
      {
        id: 'scenario-1',
        name: 'Balanced Growth',
        description: 'Public services and cooperative financing rise together.',
        policies: {
          basicAccess: true,
          greenInfra: true,
          cooperativeCredit: true,
          publicData: false,
        },
        metrics: {
          growth: 8.4,
          trust: 94,
          inflation: 2.1,
          employment: 96,
          utility: 91,
          resilience: 89,
          inclusion: 97,
          capital: 1.8,
          productivity: 87,
          distribution: 90,
          stability: 82,
          innovation: 94,
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'scenario-2',
        name: 'Green Transition',
        description: 'Large investment in clean infrastructure and climate resilience.',
        policies: {
          basicAccess: true,
          greenInfra: true,
          cooperativeCredit: false,
          publicData: true,
        },
        metrics: {
          growth: 7.8,
          trust: 92,
          inflation: 1.8,
          employment: 95,
          utility: 89,
          resilience: 94,
          inclusion: 95,
          capital: 1.9,
          productivity: 85,
          distribution: 86,
          stability: 90,
          innovation: 95,
        },
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(dataFilePath, JSON.stringify(seed, null, 2));
  }
};

const readScenarios = () => {
  ensureDataFile();
  const raw = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(raw);
};

const writeScenarios = (scenarios) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(scenarios, null, 2));
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'civitas-api', timestamp: new Date().toISOString() });
});

app.get('/api/scenarios', (req, res) => {
  const scenarios = readScenarios();
  res.json(scenarios);
});

app.get('/api/scenarios/:id', (req, res) => {
  const scenario = readScenarios().find((item) => item.id === req.params.id);
  if (!scenario) {
    return res.status(404).json({ message: 'Scenario not found' });
  }
  return res.json(scenario);
});

app.post('/api/scenarios', (req, res) => {
  const scenarios = readScenarios();
  const newScenario = {
    id: crypto.randomUUID(),
    name: req.body.name || 'New Scenario',
    description: req.body.description || 'Scenario generated from simulation.',
    policies: req.body.policies || {},
    metrics: req.body.metrics || {},
    createdAt: new Date().toISOString(),
  };

  scenarios.unshift(newScenario);
  writeScenarios(scenarios);
  res.status(201).json(newScenario);
});

app.put('/api/scenarios/:id', (req, res) => {
  const scenarios = readScenarios();
  const index = scenarios.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Scenario not found' });
  }

  const updated = {
    ...scenarios[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  scenarios[index] = updated;
  writeScenarios(scenarios);
  return res.json(updated);
});

app.delete('/api/scenarios/:id', (req, res) => {
  const scenarios = readScenarios().filter((item) => item.id !== req.params.id);
  writeScenarios(scenarios);
  res.json({ success: true, deletedId: req.params.id });
});

app.listen(PORT, () => {
  console.log(`Civitas API listening on http://localhost:${PORT}`);
});
