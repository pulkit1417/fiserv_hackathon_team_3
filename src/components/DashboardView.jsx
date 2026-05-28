import React from 'react';
import { 
  FileText, 
  Percent, 
  Briefcase, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  User,
  ShieldCheck
} from 'lucide-react';

export default function DashboardView({ user, onNavigate }) {
  if (!user) return null;

  // 1. Calculate Base DTI (before new loan)
  const monthlyIncome = user.monthly_income || 50000;
  const monthlyExpense = user.monthly_expense || 15000;
  const existingEmi = user.existing_monthly_emi || 0;
  const defaults = user.defaults || 0;
  const history = user.credit_history_months || 0;

  const currentDti = Math.round(((monthlyExpense + existingEmi) / monthlyIncome) * 100);

  // 2. Estimate Base Credit Score
  let score = 600;
  if (currentDti < 30) score += 100;
  if (history > 24) score += 80;
  if (defaults === 0) score += 50;
  
  if (currentDti > 50) score -= 150;
  if (defaults >= 2) score -= 200;
  if (monthlyIncome < 15000) score -= 80;
  
  score = Math.max(300, Math.min(900, score));

  // Risk Rating Category
  let riskCategory = "Medium Risk";
  let riskColor = "var(--primary)";
  if (score >= 750) {
    riskCategory = "Low Risk (Good)";
    riskColor = "var(--success)";
  } else if (score < 600) {
    riskCategory = "High Risk (Critical)";
    riskColor = "var(--danger)";
  }

  // 3. Estimate Max Loan Capability (assume max 35% DTI buffer)
  const maxAllowedOutflow = monthlyIncome * 0.50; // hard cap DTI 50%
  const currentOutflow = monthlyExpense + existingEmi;
  const remainingBuffer = Math.max(0, maxAllowedOutflow - currentOutflow);
  
  // Standard EMI estimate for standard 12% interest for 12 months (monthly rate = 0.01)
  // EMI = P * r * (1+r)^N / ((1+r)^N - 1) => P = EMI / [r * (1+r)^N / ((1+r)^N - 1)]
  // For r=0.01, N=12 => factor = 0.01 * 1.1268 / 0.1268 = 0.0888
  // P ≈ EMI / 0.088849 => Max Loan ≈ buffer * 11.25
  const estimatedMaxLoan = Math.round(remainingBuffer * 11.25);

  // 4. Recommendation Quick Status
  let quickRec = "Check advice";
  if (defaults >= 2) {
    quickRec = "Needs Credit Rehabilitation";
  } else if (currentDti > 50) {
    quickRec = "Lower expenses to unlock credit";
  } else if (score >= 750) {
    quickRec = "Qualifies for Premium Micro-Loans";
  } else {
    quickRec = "Qualified for Standard Tiers";
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{ 
        padding: '2rem', 
        textAlign: 'left',
        backgroundColor: 'var(--bg-card-hover)',
        borderColor: 'var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Welcome Back, {user.name}!
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.4rem', maxWidth: '600px' }}>
              Your FinSure workspace is active. Below is your real-time risk profile preview compiled from your onboarding parameters. Select a workspace tab below to perform actions.
            </p>
          </div>
          <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', backgroundColor: 'var(--bg-app)', borderStyle: 'dashed' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Profile Baseline</span>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.85rem' }}>
              <div>Income: <strong style={{ color: 'var(--success)' }}>₹{monthlyIncome.toLocaleString()}</strong></div>
              <div>Baseline DTI: <strong style={{ color: currentDti > 50 ? 'var(--danger)' : currentDti > 35 ? 'var(--primary)' : 'var(--success)' }}>{currentDti}%</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Box Grid Dashboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.5rem',
      }} className="analytics-grid-2x1">
        
        {/* Card 1: Credit Evaluator */}
        <div className="glass-panel card-hover-interactive" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          padding: '1.5rem',
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }} onClick={() => onNavigate('form')}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary-glow)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <FileText size={22} />
              </div>
              <span className="app-badge" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>workspace</span>
            </div>
            
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Credit Evaluator Form</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1.25rem 0', lineHeight: 1.4 }}>
              Submit a detailed micro-credit application to run warning flags, calculate amortization, and get an automated score decision.
            </p>
          </div>

          <div style={{ 
            borderTop: '1px solid var(--border-color)', 
            paddingTop: '1rem', 
            marginTop: 'auto',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Est. Credit Score: <strong style={{ color: riskColor }}>{score} ({riskCategory})</strong>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Open <ArrowRight size={14} />
            </span>
          </div>
        </div>

        {/* Card 2: EMI Calculator */}
        <div className="glass-panel card-hover-interactive" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          padding: '1.5rem',
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }} onClick={() => onNavigate('emi')}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary-glow)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Percent size={22} />
              </div>
              <span className="app-badge" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>tools</span>
            </div>
            
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Smart EMI Calculator</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1.25rem 0', lineHeight: 1.4 }}>
              Simulate interest rates, principal sums, and loan tenures in real-time. Analyze interest payout loads and debt weights.
            </p>
          </div>

          <div style={{ 
            borderTop: '1px solid var(--border-color)', 
            paddingTop: '1rem', 
            marginTop: 'auto',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Standard Micro-EMI (₹1L @12%): <strong style={{ color: 'var(--primary)' }}>₹8,885/mo</strong>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Calculate <ArrowRight size={14} />
            </span>
          </div>
        </div>

        {/* Card 3: Personalized Portfolio */}
        <div className="glass-panel card-hover-interactive" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          padding: '1.5rem',
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }} onClick={() => onNavigate('portfolio')}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--success-glow)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Briefcase size={22} />
              </div>
              <span className="app-badge" style={{ backgroundColor: 'var(--success-glow)', color: 'var(--success)' }}>analytics</span>
            </div>
            
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Personalized Portfolio</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1.25rem 0', lineHeight: 1.4 }}>
              Check your debt capacity limits, current DTI levels, and maximum borrow guidelines to avoid high-risk rejections.
            </p>
          </div>

          <div style={{ 
            borderTop: '1px solid var(--border-color)', 
            paddingTop: '1rem', 
            marginTop: 'auto',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Est. Max Safe Loan: <strong style={{ color: 'var(--success)' }}>₹{estimatedMaxLoan > 0 ? estimatedMaxLoan.toLocaleString() : 0}</strong>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Review <ArrowRight size={14} />
            </span>
          </div>
        </div>

        {/* Card 4: Smart Recommendations */}
        <div className="glass-panel card-hover-interactive" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          padding: '1.5rem',
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }} onClick={() => onNavigate('recommendations')}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary-glow)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Sparkles size={22} />
              </div>
              <span className="app-badge" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>advisory</span>
            </div>
            
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Smart Recommendations</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1.25rem 0', lineHeight: 1.4 }}>
              Unlock pre-approved product packages matching your profile, and review personalized steps to improve your credit eligibility.
            </p>
          </div>

          <div style={{ 
            borderTop: '1px solid var(--border-color)', 
            paddingTop: '1rem', 
            marginTop: 'auto',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
              {quickRec}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Optimize <ArrowRight size={14} />
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
