# Civitas 2.0

Civitas 2.0 is a French-language prototype for exploring public-policy scenarios. It is a decision-support demonstrator, not a calibrated forecasting system or an independently validated economic model.

## Run locally

```bash
npm install
npm run dev
```

The Vite client runs at `http://localhost:5173` and proxies API requests to the Express server on port 3001. Run `npm test` for the model checks and `npm run build` for a production build.

## Simulation capabilities

- Sector-weighted output projections for energy, food, housing, education, health, industry, and services.
- Fiscal-space cap that scales selected programs when requested costs exceed the available envelope.
- Projected GDP, tax revenue, public spending, investment, annual deficit, public debt, debt-to-GDP, unemployment, and inflation.
- Deterministic energy-price, recession, and interest-rate stress scenarios.
- Sensitivity table varying policy-impact coefficients from 0.5x to 1.5x.
- Scenario persistence and evaluator-declared review records.
- JSON import for macroeconomic, sector, budget, and policy calibration inputs.
- Project proposals with funding-gap analysis, estimated operating surplus, job and local-procurement estimates, and separately reported post-launch outcomes.

## Real-data calibration

Open **Simulation**, download `calibration-template.json`, replace the example values with a documented dataset, and set its source, reference year, currency, units, and sector weights. Sector GDP shares must sum to 100%. Upload the completed JSON to use the data in the projection. The included template values are fictional demonstration inputs and must not be cited as real economic observations.

The model uses sector shares to aggregate annual sector growth, policy cost and investment shares as percentages of GDP, and the configured tax-to-GDP ratio to project fiscal flows. Program spending is scaled pro rata to the configured fiscal envelope. Employment, inflation, and stress-shock coefficients are simplified assumptions editable through the calibration file. The projection does not represent a structural macroeconomic model, causal estimate, or official forecast; replace and validate all coefficients for the jurisdiction and period being studied.

## Expert review

Saved scenarios can contain evaluator-declared reviews with name, institution, expertise, conclusion, and observations. The application does not authenticate reviewers or verify credentials; a submitted review is not independent certification. Expert validation requires external review of data provenance, model specification, identification, fiscal assumptions, and reproducibility.

## Project proposals and outcomes

The **Projets** page records an idea, territory, sector, initial capital requirement, proposed public and private/cooperative funding, estimated annual revenue and operating costs, expected jobs and beneficiaries, and local procurement share. It calculates an unfunded capital gap and simple projected operating surpluses. Once a project is active, users can report observed revenue, costs, and jobs with a stated source. These results are self-declared and not independently audited. The app does not process payments, raise capital, match investors, or guarantee viability.

## Project structure

- `src/App.jsx` – React interface, policy controls, scenario and review workflows.
- `src/economicsModel.js` – deterministic sector, fiscal, stress, and sensitivity calculations.
- `src/projectEconomics.js` – project funding and operating surplus calculations.
- `server/index.js` – Express API for saved scenarios and project proposals.
- `server/scenarios.json` – local JSON scenario store.
- `server/projects.json` – local JSON project portfolio.
- `public/calibration-template.json` – importable example schema; values are illustrative.
- `test/` – focused economic model and project workflow checks.
