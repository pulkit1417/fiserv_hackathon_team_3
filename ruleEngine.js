import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RULES_FILE = path.join(__dirname, 'rules.json');

function getRules(passedRules) {
  if (passedRules) return passedRules;
  try {
    const data = fs.readFileSync(RULES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      hard_rejects: {
        min_monthly_income: 15000,
        min_credit_history_months: 6,
        max_defaults: 1
      },
      warnings: {
        max_dti_ratio: 0.50
      },
      score_weights: {
        base_score: 600,
        dti_ranges: [
          { max: 0.20, points: 100 },
          { max: 0.35, points: 50 },
          { max: 0.45, points: -20 },
          { max: 1.00, points: -150 }
        ],
        credit_history_ranges: [
          { min: 24, points: 80 },
          { min: 12, points: 50 },
          { min: 6, points: -30 },
          { min: 0, points: -150 }
        ],
        defaults_ranges: [
          { count: 0, points: 50 },
          { count: 1, points: -100 },
          { count: 2, points: -200 }
        ]
      },
      decision_thresholds: {
        approved_min_score: 750,
        conditional_min_score: 600
      }
    };
  }
}

export function evaluateApplicant(input, passedRules = null) {
  const rules = getRules(passedRules);

  const {
    name,
    monthly_income,
    monthly_expense,
    existing_monthly_emi,
    requested_loan_amount,
    interest_rate,
    loan_tenure,
    credit_history_months,
    defaults
  } = input;

  const income = Number(monthly_income) || 0;
  const expense = Number(monthly_expense) || 0;
  const existingEmi = Number(existing_monthly_emi) || 0;
  const loanAmount = Number(requested_loan_amount) || 0;
  const annualInterest = Number(interest_rate) || 0;
  const tenure = Number(loan_tenure) || 0;
  const creditHistory = Number(credit_history_months) || 0;
  const defaultCount = Number(defaults) || 0;

  // 1. EMI Calculation
  let newEmi = 0;
  if (loanAmount > 0 && tenure > 0 && annualInterest > 0) {
    const monthlyRate = annualInterest / 12 / 100;
    newEmi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
             (Math.pow(1 + monthlyRate, tenure) - 1);
    newEmi = Math.round(newEmi * 100) / 100; // Round to 2 decimals
  }

  const totalPayment = Math.round(newEmi * tenure);
  const totalInterest = Math.max(0, Math.round(totalPayment - loanAmount));

  // 2. DTI Calculation
  // Formula: DTI = ((Expenses + ExistingEMI + NewEMI) / MonthlyIncome) * 100
  const totalMonthlyOutflow = expense + existingEmi + newEmi;
  const dti = income > 0 ? (totalMonthlyOutflow / income) * 100 : 100;
  const dtiRounded = Math.round(dti * 10) / 10;
  const dtiRatio = dtiRounded / 100;

  // 3. Credit Score Calculation
  const baseScore = rules.score_weights.base_score || 600;
  let score = baseScore;
  const scoreBreakdown = [];
  scoreBreakdown.push({ factor: "Base Score", change: baseScore, running: baseScore });

  // DTI points matching
  let dtiPoints = 0;
  if (rules.score_weights.dti_ranges) {
    const range = rules.score_weights.dti_ranges.find(r => dtiRatio <= r.max);
    if (range) dtiPoints = range.points;
  }
  score += dtiPoints;
  scoreBreakdown.push({ factor: `DTI Ratio points (DTI: ${dtiRounded}%)`, change: dtiPoints, running: score });

  // History points matching
  let historyPoints = 0;
  if (rules.score_weights.credit_history_ranges) {
    const range = [...rules.score_weights.credit_history_ranges]
      .sort((a, b) => b.min - a.min)
      .find(r => creditHistory >= r.min);
    if (range) historyPoints = range.points;
  }
  score += historyPoints;
  scoreBreakdown.push({ factor: `Credit History points (${creditHistory} months)`, change: historyPoints, running: score });

  // Defaults points matching
  let defaultsPoints = 0;
  if (rules.score_weights.defaults_ranges) {
    const range = rules.score_weights.defaults_ranges.find(r => defaultCount === r.count)
      || rules.score_weights.defaults_ranges.find(r => r.count === 2)
      || { points: -200 };
    if (range) defaultsPoints = range.points;
  }
  score += defaultsPoints;
  scoreBreakdown.push({ factor: `Defaults points (${defaultCount} count)`, change: defaultsPoints, running: score });

  // Income penalty check
  const minIncome = rules.hard_rejects.min_monthly_income || 15000;
  if (income < minIncome) {
    score -= 80;
    scoreBreakdown.push({ factor: `Income penalty (Income < ₹${minIncome.toLocaleString()})`, change: -80, running: score });
  }

  // Clamp score: 300 to 900
  const rawScore = score;
  score = Math.max(300, Math.min(score, 900));
  if (score !== rawScore) {
    scoreBreakdown.push({ factor: "Clamping (300-900)", change: score - rawScore, running: score });
  }

  // Determine Risk Category based on Score
  const approvedMinScore = rules.decision_thresholds.approved_min_score || 750;
  const conditionalMinScore = rules.decision_thresholds.conditional_min_score || 600;

  let riskCategory = "High Risk";
  if (score >= approvedMinScore) {
    riskCategory = "Low Risk";
  } else if (score >= conditionalMinScore) {
    riskCategory = "Medium Risk";
  }

  // 4. Decision Logics
  const auditLog = [];
  let isRejected = false;

  // DTI Rule: DTI > max_dti_ratio -> Reject
  const maxDtiRatio = rules.warnings.max_dti_ratio || 0.50;
  if (dtiRatio > maxDtiRatio) {
    isRejected = true;
    auditLog.push({
      rule: `DTI Ratio Check (Limit: ${maxDtiRatio * 100}%)`,
      passed: false,
      details: `Projected DTI is ${dtiRounded}%, exceeding the limit of ${maxDtiRatio * 100}%.`,
      type: "reject"
    });
  } else if (dtiRounded >= 35) {
    auditLog.push({
      rule: `DTI Ratio Check (Limit: ${maxDtiRatio * 100}%)`,
      passed: true,
      details: `Projected DTI is ${dtiRounded}% (Medium Risk: 35% to ${maxDtiRatio * 100}% Review).`,
      type: "warning"
    });
  } else {
    auditLog.push({
      rule: `DTI Ratio Check (Limit: ${maxDtiRatio * 100}%)`,
      passed: true,
      details: `Projected DTI is ${dtiRounded}% (Good DTI: <35%).`,
      type: "pass"
    });
  }

  // Defaults Rule: Defaults > max_defaults -> Reject
  const maxDefaults = rules.hard_rejects.max_defaults || 1;
  if (defaultCount > maxDefaults) {
    isRejected = true;
    auditLog.push({
      rule: `Defaults Repayment Check (Limit: ${maxDefaults})`,
      passed: false,
      details: `Applicant has ${defaultCount} defaults (Limit: Defaults <= ${maxDefaults}).`,
      type: "reject"
    });
  } else if (defaultCount === 1) {
    auditLog.push({
      rule: `Defaults Repayment Check (Limit: ${maxDefaults})`,
      passed: true,
      details: `Applicant has 1 default (Medium Risk impact).`,
      type: "warning"
    });
  } else {
    auditLog.push({
      rule: `Defaults Repayment Check (Limit: ${maxDefaults})`,
      passed: true,
      details: `Applicant has 0 defaults (Good standing).`,
      type: "pass"
    });
  }

  // Credit History Rule: < min_credit_history_months -> Reject
  const minHistory = rules.hard_rejects.min_credit_history_months || 6;
  if (creditHistory < minHistory) {
    isRejected = true;
    auditLog.push({
      rule: `Credit History Duration Check (Min: ${minHistory}m)`,
      passed: false,
      details: `Credit history of ${creditHistory} months is below the minimum required ${minHistory} months.`,
      type: "reject"
    });
  } else if (creditHistory <= 24) {
    auditLog.push({
      rule: `Credit History Duration Check (Min: ${minHistory}m)`,
      passed: true,
      details: `Credit history is ${creditHistory} months (Medium status: ${minHistory}-24m).`,
      type: "warning"
    });
  } else {
    auditLog.push({
      rule: `Credit History Duration Check (Min: ${minHistory}m)`,
      passed: true,
      details: `Credit history is ${creditHistory} months (Strong status: >24m).`,
      type: "pass"
    });
  }

  // Income Check Rule: Income < min_monthly_income -> Reject
  if (income < minIncome) {
    isRejected = true;
    auditLog.push({
      rule: `Minimum Income Check (Min: ₹${minIncome.toLocaleString()})`,
      passed: false,
      details: `Income of ₹${income.toLocaleString()} is below the required ₹${minIncome.toLocaleString()}.`,
      type: "reject"
    });
  } else {
    auditLog.push({
      rule: `Minimum Income Check (Min: ₹${minIncome.toLocaleString()})`,
      passed: true,
      details: `Income of ₹${income.toLocaleString()} is within safe parameters.`,
      type: "pass"
    });
  }

  // Final Decision mapping
  let decision = "REJECT";
  let decisionReason = "";

  if (isRejected) {
    decision = "REJECT";
    const reasons = [];
    if (dtiRatio > maxDtiRatio) reasons.push(`Projected DTI exceeds ${maxDtiRatio * 100}%`);
    if (defaultCount > maxDefaults) reasons.push(`Too many defaults (exceeds ${maxDefaults})`);
    if (creditHistory < minHistory) reasons.push(`Short credit history (<${minHistory} months)`);
    if (income < minIncome) reasons.push(`Income below ₹${minIncome.toLocaleString()} limit`);
    decisionReason = `Rejected due to: ${reasons.join(", ")}.`;
  } else if (score >= approvedMinScore) {
    decision = "APPROVE";
    decisionReason = "Excellent risk score and low debt ratio. Loan is approved instantly.";
  } else if (score >= conditionalMinScore) {
    decision = "REVIEW";
    decisionReason = "Moderate credit score. Application marked for manual underwriter review.";
  } else {
    decision = "REJECT";
    decisionReason = `Rejected due to poor overall credit score of ${score} (High Risk).`;
  }

  // Amortization Schedule calculation
  const schedule = [];
  if (newEmi > 0 && tenure > 0) {
    let currentBalance = loanAmount;
    const r = (annualInterest / 12) / 100;
    
    for (let month = 1; month <= tenure; month++) {
      const monthInterest = Math.round(currentBalance * r * 100) / 100;
      let monthPrincipal = Math.round((newEmi - monthInterest) * 100) / 100;
      
      if (month === tenure) {
        monthPrincipal = currentBalance;
      }
      
      const endingBalance = Math.max(0, Math.round((currentBalance - monthPrincipal) * 100) / 100);
      
      schedule.push({
        month,
        beginningBalance: Math.round(currentBalance),
        emi: Math.round(newEmi),
        principal: Math.round(monthPrincipal),
        interest: Math.round(monthInterest),
        endingBalance: Math.round(endingBalance)
      });
      
      currentBalance = endingBalance;
    }
  }

  return {
    input,
    metrics: {
      emi: newEmi,
      totalPayment,
      totalInterest,
      dti: dtiRounded,
      affordabilityCushion: Math.max(0, income - totalMonthlyOutflow)
    },
    score,
    riskCategory,
    decision,
    decisionReason,
    auditLog,
    scoreBreakdown,
    schedule
  };
}

export function evaluateBatch(applicants, passedRules = null) {
  const rules = getRules(passedRules);
  const results = applicants.map(app => evaluateApplicant(app, rules));
  
  const stats = {
    total: results.length,
    approved: results.filter(r => r.decision === "APPROVE").length,
    review: results.filter(r => r.decision === "REVIEW").length,
    rejected: results.filter(r => r.decision === "REJECT").length,
    avgScore: Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length),
    riskCategories: {
      low: results.filter(r => r.riskCategory === "Low Risk").length,
      medium: results.filter(r => r.riskCategory === "Medium Risk").length,
      high: results.filter(r => r.riskCategory === "High Risk").length
    }
  };

  return {
    results,
    stats
  };
}
