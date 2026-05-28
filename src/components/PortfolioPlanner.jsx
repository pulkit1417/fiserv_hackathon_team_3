import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Briefcase, 
  IndianRupee, 
  Percent, 
  AlertTriangle,
  TrendingDown,
  Layers,
  Wallet
} from 'lucide-react';

export default function PortfolioPlanner({ user, onBack }) {
  if (!user) return null;

  const monthlyIncome = user.monthly_income || 50000;
  const monthlyExpense = user.monthly_expense || 15000;
  const existingEmi = user.existing_monthly_emi || 0;

  // State for new loan EMI simulation
  const [simulatedEmi, setSimulatedEmi] = useState(5000);

  // Math computations
  const currentOutflow = monthlyExpense + existingEmi;
  const netIncome = Math.max(0, monthlyIncome - currentOutflow);
  
  const currentDti = Math.round((currentOutflow / monthlyIncome) * 100);
  
  // DTI with simulated EMI
  const projectedOutflow = currentOutflow + simulatedEmi;
  const projectedDti = Math.round((projectedOutflow / monthlyIncome) * 100);

  // Safe limits (DTI limit at 35%)
  const safeOutflowLimit = Math.round(monthlyIncome * 0.35);
  const safeEmiBuffer = Math.max(0, safeOutflowLimit - currentOutflow);
  // Estimate loan size for this safe EMI buffer (assuming 12% interest for 12 months, factor = 0.0888)
  const safeLoanEstimate = Math.round(safeEmiBuffer * 11.25);

  // Risk Rating for projected DTI
  let ratingText = "Good (Low Risk)";
  let ratingColor = "var(--success)";
  let progressColor = "var(--success)";
  if (projectedDti > 50) {
    ratingText = "Reject (High Risk)";
    ratingColor = "var(--danger)";
    progressColor = "var(--danger)";
  } else if (projectedDti >= 35) {
    ratingText = "Review (Medium Risk)";
    ratingColor = "var(--primary)";
    progressColor = "var(--primary)";
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
          <h2><Briefcase size={18} className="app-logo" /> Debt Portfolio Planner</h2>
        </div>
        <span className="app-badge" style={{ background: 'var(--success)' }}>Personal Analysis</span>
      </div>

      <div className="panel-body">
        
        {/* Step 1: Cash Flow Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }} className="analytics-summary-grid">
          
          <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid var(--success)', backgroundColor: 'hsla(224, 30%, 5%, 0.2)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <IndianRupee size={12} /> Monthly Income
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '0.25rem', color: 'var(--success)' }}>
              ₹{monthlyIncome.toLocaleString()}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid var(--danger)', backgroundColor: 'hsla(224, 30%, 5%, 0.2)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Wallet size={12} /> Total Outflows
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '0.25rem', color: 'var(--danger)' }}>
              ₹{currentOutflow.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Expenses + EMIs</span>
          </div>

          <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid var(--primary)', backgroundColor: 'hsla(224, 30%, 5%, 0.2)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={12} /> Discretionary Cash
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '0.25rem', color: 'var(--primary)' }}>
              ₹{netIncome.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Available cash buffer</span>
          </div>

        </div>

        {/* Step 2: DTI Capacity & Simulator */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2rem' }} className="analytics-grid-2x1">
          
          {/* Simulation Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'hsla(224, 30%, 5%, 0.2)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingDown size={16} style={{ color: 'var(--primary)' }} /> Simulate Additional Debt EMI
              </h3>
              
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="form-label">Simulated Monthly Loan EMI</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 800 }}>₹{simulatedEmi.toLocaleString()}</span>
                </div>
                <div className="slider-container">
                  <input
                    type="range"
                    className="form-slider"
                    min="0"
                    max="30000"
                    step="1000"
                    value={simulatedEmi}
                    onChange={(e) => setSimulatedEmi(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'left', backgroundColor: 'hsla(224, 30%, 5%, 0.3)' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                Safe Borrowing Guideline
              </h4>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.4, color: 'var(--text-main)', margin: '0 0 1rem 0' }}>
                Fintech risk models suggest maintaining a total Debt-to-Income (DTI) ratio **below 35%** for optimal financial health.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Max safe monthly loan payments:</span>
                  <strong style={{ color: 'var(--success)' }}>₹{safeEmiBuffer.toLocaleString()}/mo</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estimated safe micro-credit limit:</span>
                  <strong style={{ color: 'var(--success)' }}>₹{safeLoanEstimate.toLocaleString()}</strong>
                </div>
              </div>
            </div>

          </div>

          {/* DTI Gauge Representation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center' }}>
            
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: 'hsla(224, 30%, 5%, 0.4)', position: 'relative' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Projected DTI Ratio
              </span>
              
              <div style={{ fontSize: '3rem', fontWeight: 900, color: ratingColor, marginTop: '0.25rem' }}>
                {projectedDti}%
              </div>

              {/* DTI Slider Gauge Progress Bar */}
              <div style={{ width: '100%', height: '14px', backgroundColor: 'var(--border-color)', borderRadius: '50px', overflow: 'hidden', marginTop: '1rem', position: 'relative' }}>
                <div style={{ 
                  width: `${Math.min(100, projectedDti)}%`, 
                  height: '100%', 
                  backgroundColor: progressColor, 
                  borderRadius: '50px',
                  transition: 'width 0.4s ease-out'
                }}></div>
                {/* 35% safe marker */}
                <div style={{ position: 'absolute', left: '35%', top: 0, bottom: 0, width: '2px', backgroundColor: 'white', opacity: 0.5 }} title="35% Safe Limit"></div>
                {/* 50% reject marker */}
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', backgroundColor: 'var(--danger)', opacity: 0.8 }} title="50% Reject Limit"></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                <span>0%</span>
                <span style={{ transform: 'translateX(-50%)' }}>35% (Safe)</span>
                <span style={{ transform: 'translateX(-50%)' }}>50% (Limit)</span>
                <span>100%</span>
              </div>

              <div style={{ 
                marginTop: '1.25rem', 
                padding: '0.5rem', 
                borderRadius: 'var(--radius-sm)', 
                fontSize: '0.8rem', 
                fontWeight: 700,
                color: ratingColor,
                backgroundColor: ratingColor + '15',
                border: `1px solid ${ratingColor}30`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <AlertTriangle size={14} /> Risk decision: {ratingText}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
