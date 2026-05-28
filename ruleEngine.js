/**
 * Simplified Micro-Credit Rule Engine
 * Implements the exact formulas and rules requested by the user.
 */

export function evaluateApplicant(input) {
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

  // 3. Credit Score Calculation
  let score = 600;
  const scoreBreakdown = [];
  scoreBreakdown.push({ factor: "Base Score", change: 600, running: 600 });

  // Positive Factors
  if (dtiRounded < 30) {
    score += 100;
    scoreBreakdown.push({ factor: "DTI < 30%", change: 100, running: score });
  }
  if (creditHistory > 24) {
    score += 80;
    scoreBreakdown.push({ factor: "Credit History > 24 months", change: 80, running: score });
  }
  if (defaultCount === 0) {
    score += 50;
    scoreBreakdown.push({ factor: "0 Defaults", change: 50, running: score });
  }

  // Negative Factors
  if (dtiRounded > 50) {
    score -= 150;
    scoreBreakdown.push({ factor: "DTI > 50%", change: -150, running: score });
  }
  if (defaultCount >= 2) {
    score -= 200;
    scoreBreakdown.push({ factor: "Defaults >= 2", change: -200, running: score });
  }
  if (income < 15000) {
    score -= 80;
    scoreBreakdown.push({ factor: "Income < ₹15,000", change: -80, running: score });
  }

  // Clamp score: 300 to 900
  const rawScore = score;
  score = Math.max(300, Math.min(score, 900));
  if (score !== rawScore) {
    scoreBreakdown.push({ factor: "Clamping (300-900)", change: score - rawScore, running: score });
  }

  // Determine Risk Category based on Score
  let riskCategory = "High Risk";
  if (score >= 750) {
    riskCategory = "Low Risk";
  } else if (score >= 600) {
    riskCategory = "Medium Risk";
  }

  // 4. Decision Logics
  const auditLog = [];
  let isRejected = false;

  // DTI Rule: DTI > 50% -> Reject
  if (dtiRounded > 50) {
    isRejected = true;
    auditLog.push({
      rule: "DTI Ratio Check (Limit: 50%)",
      passed: false,
      details: `Projected DTI is ${dtiRounded}%, exceeding the limit of 50%.`,
      type: "reject"
    });
  } else if (dtiRounded >= 35) {
    auditLog.push({
      rule: "DTI Ratio Check (Limit: 50%)",
      passed: true,
      details: `Projected DTI is ${dtiRounded}% (Medium Risk: 35-50% Review).`,
      type: "warning"
    });
  } else {
    auditLog.push({
      rule: "DTI Ratio Check (Limit: 50%)",
      passed: true,
      details: `Projected DTI is ${dtiRounded}% (Good DTI: <35%).`,
      type: "pass"
    });
  }

  // Defaults Rule: Defaults >= 2 -> Reject
  if (defaultCount >= 2) {
    isRejected = true;
    auditLog.push({
      rule: "Defaults Repayment Check (Limit: 2)",
      passed: false,
      details: `Applicant has ${defaultCount} defaults (Limit: Defaults < 2).`,
      type: "reject"
    });
  } else if (defaultCount === 1) {
    auditLog.push({
      rule: "Defaults Repayment Check (Limit: 2)",
      passed: true,
      details: `Applicant has 1 default (Medium Risk impact).`,
      type: "warning"
    });
  } else {
    auditLog.push({
      rule: "Defaults Repayment Check (Limit: 2)",
      passed: true,
      details: `Applicant has 0 defaults (Good standing).`,
      type: "pass"
    });
  }

  // Credit History Rule: < 6 months -> Risk (Reject)
  if (creditHistory < 6) {
    isRejected = true;
    auditLog.push({
      rule: "Credit History Duration Check (Min: 6m)",
      passed: false,
      details: `Credit history of ${creditHistory} months is below the minimum required 6 months.`,
      type: "reject"
    });
  } else if (creditHistory <= 24) {
    auditLog.push({
      rule: "Credit History Duration Check (Min: 6m)",
      passed: true,
      details: `Credit history is ${creditHistory} months (Medium status: 6-24m).`,
      type: "warning"
    });
  } else {
    auditLog.push({
      rule: "Credit History Duration Check (Min: 6m)",
      passed: true,
      details: `Credit history is ${creditHistory} months (Strong status: >24m).`,
      type: "pass"
    });
  }

  // Income Check Rule: Income < 15,000 -> Reject
  if (income < 15000) {
    isRejected = true;
    auditLog.push({
      rule: "Minimum Income Check (Min: ₹15k)",
      passed: false,
      details: `Income of ₹${income.toLocaleString()} is below the required ₹15,000.`,
      type: "reject"
    });
  } else {
    auditLog.push({
      rule: "Minimum Income Check (Min: ₹15k)",
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
    if (dtiRounded > 50) reasons.push("Projected DTI exceeds 50%");
    if (defaultCount >= 2) reasons.push("Too many defaults (2 or more)");
    if (creditHistory < 6) reasons.push("Short credit history (<6 months)");
    if (income < 15000) reasons.push("Income below ₹15,000 limit");
    decisionReason = `Rejected due to: ${reasons.join(", ")}.`;
  } else if (score >= 750) {
    decision = "APPROVE";
    decisionReason = "Excellent risk score and low debt ratio. Loan is approved instantly.";
  } else if (score >= 600) {
    decision = "REVIEW"; // Review maps to conditional approval
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

export function evaluateBatch(applicants, rules) {
  const results = applicants.map(app => evaluateApplicant(app));
  
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
