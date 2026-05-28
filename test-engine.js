import { evaluateApplicant } from './ruleEngine.js';

const testCases = [
  {
    name: "Perfect Low-Risk Borrower (Approve)",
    input: {
      name: "Pulkit",
      monthly_income: 80000,
      monthly_expense: 10000,
      existing_monthly_emi: 5000,
      requested_loan_amount: 100000,
      interest_rate: 12,
      loan_tenure: 12,
      credit_history_months: 30, // >24 Strong
      defaults: 0
    },
    expectedDecision: "APPROVE",
    expectedMinScore: 750
  },
  {
    name: "Low Income (Hard Reject)",
    input: {
      name: "User B",
      monthly_income: 12000, // < 15,000 Reject
      monthly_expense: 4000,
      existing_monthly_emi: 0,
      requested_loan_amount: 20000,
      interest_rate: 10,
      loan_tenure: 6,
      credit_history_months: 12,
      defaults: 0
    },
    expectedDecision: "REJECT"
  },
  {
    name: "DTI Over 50% (Hard Reject)",
    input: {
      name: "User C",
      monthly_income: 30000,
      monthly_expense: 12000,
      existing_monthly_emi: 5000,
      requested_loan_amount: 150000, // EMI ~ 13.3k. Total Outflow = 12k + 5k + 13.3k = 30.3k > 30k Income (DTI > 100%)
      interest_rate: 12,
      loan_tenure: 12,
      credit_history_months: 18,
      defaults: 0
    },
    expectedDecision: "REJECT"
  },
  {
    name: "Short History (Hard Reject)",
    input: {
      name: "User D",
      monthly_income: 40000,
      monthly_expense: 10000,
      existing_monthly_emi: 0,
      requested_loan_amount: 50000,
      interest_rate: 10,
      loan_tenure: 12,
      credit_history_months: 3, // < 6 months Reject
      defaults: 0
    },
    expectedDecision: "REJECT"
  },
  {
    name: "Borderline Borrower (Review)",
    input: {
      name: "User E",
      monthly_income: 50000,
      monthly_expense: 10000,
      existing_monthly_emi: 5000,
      requested_loan_amount: 50000, // EMI ~ 4.4k. Total Outflow = 19.4k. DTI = 38.8% (35-50% Review)
      interest_rate: 12,
      loan_tenure: 12,
      credit_history_months: 12,
      defaults: 1 // Defaults = 1 -> Medium Risk
    },
    expectedDecision: "REVIEW"
  }
];

let failed = 0;

console.log("\n==================================================");
console.log("🧪 RUNNING REFINED RULE ENGINE UNIT TESTS");
console.log("==================================================\n");

testCases.forEach((tc, idx) => {
  try {
    const res = evaluateApplicant(tc.input);
    
    let pass = true;
    let details = [];

    if (res.decision !== tc.expectedDecision) {
      pass = false;
      details.push(`Expected decision: ${tc.expectedDecision}, Got: ${res.decision}`);
    }

    if (tc.expectedMinScore && res.score < tc.expectedMinScore) {
      pass = false;
      details.push(`Expected score >= ${tc.expectedMinScore}, Got: ${res.score}`);
    }

    if (pass) {
      console.log(`✅ [PASS] Case #${idx + 1}: ${tc.name}`);
      console.log(`          Score: ${res.score} | Risk: ${res.riskCategory} | Decision: ${res.decision}`);
    } else {
      failed++;
      console.log(`❌ [FAIL] Case #${idx + 1}: ${tc.name}`);
      details.forEach(d => console.log(`          └─ ${d}`));
    }
  } catch (err) {
    failed++;
    console.log(`💥 [ERROR] Case #${idx + 1}: ${tc.name}`);
    console.error(err);
  }
});

console.log("\n==================================================");
if (failed === 0) {
  console.log("🎉 ALL REFINED TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
} else {
  console.log(`🚨 ${failed} TEST(S) FAILED.`);
  process.exit(1);
}
console.log("==================================================\n");
