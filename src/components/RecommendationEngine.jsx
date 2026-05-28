import React from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  IndianRupee, 
  TrendingUp, 
  Calendar,
  ThumbsUp
} from 'lucide-react';

export default function RecommendationEngine({ user, onBack }) {
  if (!user) return null;

  const monthlyIncome = user.monthly_income || 50000;
  const monthlyExpense = user.monthly_expense || 15000;
  const existingEmi = user.existing_monthly_emi || 0;
  const defaults = user.defaults || 0;
  const history = user.credit_history_months || 0;

  const currentDti = Math.round(((monthlyExpense + existingEmi) / monthlyIncome) * 100);

  // Estimate credit score
  let score = 600;
  if (currentDti < 30) score += 100;
  if (history > 24) score += 80;
  if (defaults === 0) score += 50;
  
  if (currentDti > 50) score -= 150;
  if (defaults >= 2) score -= 200;
  if (monthlyIncome < 15000) score -= 80;
  
  score = Math.max(300, Math.min(900, score));

  // Define product packages
  const products = [
    {
      id: "starter",
      name: "Micro-Starter Loan",
      amount: 20000,
      rate: 10,
      tenure: 6,
      description: "Quick starter credit designed to build credit history with minimal friction.",
      checkQualified: () => {
        const errors = [];
        if (monthlyIncome < 15000) errors.push("Minimum income ₹15,000 required");
        if (currentDti > 50) errors.push("DTI ratio exceeds 50%");
        if (defaults >= 2) errors.push("Too many past defaults");
        if (history < 6) errors.push("Minimum 6 months credit history required");
        return { isQualified: errors.length === 0, errors };
      }
    },
    {
      id: "personal",
      name: "Standard Personal Credit",
      amount: 100000,
      rate: 12,
      tenure: 12,
      description: "Medium-tier personal loan for home improvements, electronics, or personal expenses.",
      checkQualified: () => {
        const errors = [];
        if (score < 600) errors.push("Requires credit score ≥ 600");
        if (monthlyIncome < 30000) errors.push("Minimum income ₹30,000 required");
        if (currentDti >= 45) errors.push("DTI ratio exceeds 45% limit");
        if (defaults > 0) errors.push("Requires 0 active defaults");
        if (history < 12) errors.push("Requires 12+ months credit history");
        return { isQualified: errors.length === 0, errors };
      }
    },
    {
      id: "gold",
      name: "Premium Gold Capital",
      amount: 350000,
      rate: 9.5,
      tenure: 24,
      description: "Low-interest premium personal credit lines with flexible multi-year tenures.",
      checkQualified: () => {
        const errors = [];
        if (score < 750) errors.push("Requires Credit Score ≥ 750 (Low Risk)");
        if (monthlyIncome < 60000) errors.push("Minimum income ₹60,000 required");
        if (currentDti >= 35) errors.push("Requires DTI ratio < 35%");
        if (defaults > 0) errors.push("Requires 0 defaults history");
        if (history < 24) errors.push("Requires 24+ months credit history");
        return { isQualified: errors.length === 0, errors };
      }
    }
  ];

  // Compile Advice Alerts
  const tips = [];
  if (currentDti >= 35) {
    const targetOutflow = Math.round(monthlyIncome * 0.35);
    const reductionNeeded = Math.round((monthlyExpense + existingEmi) - targetOutflow);
    tips.push({
      type: "warning",
      text: `Your DTI is high at ${currentDti}%. Try reducing monthly expenses by ₹${reductionNeeded.toLocaleString()} to reach the healthy 35% safe borrowing ceiling.`
    });
  }
  if (defaults > 0) {
    tips.push({
      type: "danger",
      text: `You have ${defaults} outstanding defaults. Clearing past defaults is the fastest way to restore your credit score. Each default heavily penalizes your application.`
    });
  }
  if (history < 12) {
    tips.push({
      type: "info",
      text: `Your credit history is only ${history} months. Keeping accounts open and active for another ${12 - history} months will graduate you to Standard Tier loans.`
    });
  }
  if (tips.length === 0) {
    tips.push({
      type: "success",
      text: "Outstanding credit profile! Continue paying current bills on time. Avoid submitting multiple credit queries to preserve your premium eligibility status."
    });
  }

  return (
    <div className="glass-panel" style={{ textAlign: 'left' }}>
      
      {/* Header */}
      <div className="panel-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            type="button" 
            className="preset-btn" 
            onClick={onBack}
            style={{ margin: 0, padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <ArrowLeft size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Back
          </button>
          <h2><Sparkles size={18} className="app-logo" style={{ color: 'var(--primary)' }} /> Smart Recommendations</h2>
        </div>
        <span className="app-badge" style={{ background: 'var(--primary)' }}>Credit Optimization</span>
      </div>

      <div className="panel-body">
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2rem' }} className="analytics-grid-2x1">
          
          {/* Left Column: Pre-Approved Packages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.5rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Customized Credit Offers
            </h3>

            {products.map((p) => {
              const { isQualified, errors } = p.checkQualified();
              
              // Standard EMI factor for display
              const r = p.rate / 12 / 100;
              const emi = Math.round((p.amount * r * Math.pow(1 + r, p.tenure)) / (Math.pow(1 + r, p.tenure) - 1));

              return (
                <div key={p.id} className="glass-panel" style={{ 
                  padding: '1.25rem', 
                  backgroundColor: 'hsla(224, 30%, 5%, 0.2)',
                  borderColor: isQualified ? 'var(--success-glow)' : 'var(--border-color)',
                  opacity: isQualified ? 1 : 0.7,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{p.name}</h4>
                    {isQualified ? (
                      <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem' }}>
                        <CheckCircle2 size={12} /> Pre-Approved
                      </span>
                    ) : (
                      <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem' }}>
                        <XCircle size={12} /> Restricted
                      </span>
                    )}
                  </div>
                  
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>{p.description}</p>
                  
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-main)' }}>
                    <div>Limit: <strong style={{ color: 'var(--primary)' }}>₹{p.amount.toLocaleString()}</strong></div>
                    <div>Rate: <strong style={{ color: 'var(--primary)' }}>{p.rate}%</strong></div>
                    <div>Tenure: <strong style={{ color: 'var(--success)' }}>{p.tenure}m</strong></div>
                    <div>Est. EMI: <strong>₹{emi}/mo</strong></div>
                  </div>

                  {!isQualified && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      padding: '0.5rem', 
                      backgroundColor: 'hsla(355, 80%, 50%, 0.08)', 
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem',
                      border: '1px dashed hsla(355, 80%, 50%, 0.2)',
                      textAlign: 'left'
                    }}>
                      <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: '0.25rem' }}>Reason for restriction:</div>
                      <ul style={{ paddingLeft: '1rem', margin: 0, color: 'var(--text-muted)' }}>
                        {errors.map((e, idx) => <li key={idx}>{e}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Advisory / Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.5rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Credit Health Insights
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tips.map((t, idx) => {
                let badgeColor = 'var(--primary)';
                let Icon = ThumbsUp;
                if (t.type === 'warning') {
                  badgeColor = 'var(--primary)';
                  Icon = ShieldAlert;
                } else if (t.type === 'danger') {
                  badgeColor = 'var(--danger)';
                  Icon = ShieldAlert;
                } else if (t.type === 'success') {
                  badgeColor = 'var(--success)';
                  Icon = ThumbsUp;
                }

                return (
                  <div key={idx} className="glass-panel" style={{ 
                    padding: '1rem', 
                    backgroundColor: 'hsla(224, 30%, 5%, 0.2)',
                    display: 'flex', 
                    gap: '0.75rem',
                    textAlign: 'left'
                  }}>
                    <div style={{
                      color: badgeColor,
                      marginTop: '2px'
                    }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: badgeColor, fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                        {t.type === 'success' ? 'Profile Status' : `${t.type} advice`}
                      </h4>
                      <p style={{ fontSize: '0.8rem', lineHeight: 1.4, margin: 0, color: 'var(--text-main)' }}>
                        {t.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* General Advice */}
            <div className="glass-panel" style={{ padding: '1rem', backgroundColor: 'hsla(224, 30%, 5%, 0.1)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <h4 style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>General Decision Parameters</h4>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li>Hard rejection if income is under ₹15,000 monthly.</li>
                <li>Hard rejection if credit history is less than 6 months.</li>
                <li>Hard rejection if user has 2 or more past defaults.</li>
                <li>Hard rejection if total projected DTI ratio exceeds 50%.</li>
              </ul>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
