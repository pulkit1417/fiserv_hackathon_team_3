import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluateApplicant, evaluateBatch } from './ruleEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const RULES_FILE = path.join(__dirname, 'rules.json');

app.use(cors());
app.use(express.json());

// Helper to load rules
function loadRules() {
  try {
    const data = fs.readFileSync(RULES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      hard_rejects: { min_monthly_income: 15000, min_credit_history_months: 6, max_defaults: 1 },
      warnings: { max_dti_ratio: 0.50 }
    };
  }
}

// -------------------------------------------------------------
// APIs
// -------------------------------------------------------------

// 1. Get rules
app.get('/api/rules', (req, res) => {
  res.json(loadRules());
});

// 2. Update rules
app.post('/api/rules', (req, res) => {
  try {
    const newRules = req.body;
    fs.writeFileSync(RULES_FILE, JSON.stringify(newRules, null, 2), 'utf8');
    res.json({ message: 'Rules updated successfully', rules: newRules });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update rules: ' + error.message });
  }
});

// 3. Evaluate applicant (Using exact math formulas)
app.post('/api/evaluate', (req, res) => {
  try {
    const input = req.body;
    
    // Validate inputs
    const required = [
      'monthly_income', 
      'monthly_expense', 
      'existing_monthly_emi', 
      'requested_loan_amount', 
      'interest_rate', 
      'loan_tenure', 
      'credit_history_months', 
      'defaults'
    ];
    
    for (const key of required) {
      if (input[key] === undefined || input[key] === null) {
        return res.status(400).json({ error: `Missing required field: ${key}` });
      }
    }
    
    const evaluation = evaluateApplicant(input);
    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ error: 'Evaluation failed: ' + error.message });
  }
});

// 4. Batch evaluate portfolio
app.post('/api/evaluate/batch', (req, res) => {
  try {
    const { applicants } = req.body;
    if (!Array.isArray(applicants)) {
      return res.status(400).json({ error: 'Applicants must be an array.' });
    }
    
    const batchResult = evaluateBatch(applicants);
    res.json(batchResult);
  } catch (error) {
    res.status(500).json({ error: 'Batch evaluation failed: ' + error.message });
  }
});

// Serve frontend build in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*all', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running. Start the Vite dev server for the frontend dashboard.');
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Credit Approval Backend running on port ${PORT}`);
  });
}

export default app;
