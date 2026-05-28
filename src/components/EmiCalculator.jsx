import React, { useState } from 'react';
import { 
  ArrowLeft, 
  IndianRupee, 
  Percent, 
  Calendar, 
  TrendingUp, 
  Award,
  Wallet
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function EmiCalculator({ onBack }) {
  const [params, setParams] = useState({
    amount: 100000,
    rate: 12,
    tenure: 12
  });

  const handleChange = (field, val) => {
    setParams(prev => ({
      ...prev,
      [field]: Number(val)
    }));
  };

  // Math Calculations
  const P = params.amount;
  const annualInterest = params.rate;
  const N = params.tenure;

  const r = annualInterest / 12 / 100;
  
  // EMI formula
  const emi = r > 0 
    ? Math.round((P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1))
    : Math.round(P / N);

  const totalRepayment = emi * N;
  const totalInterest = Math.max(0, totalRepayment - P);

  // Chart Data
  const pieData = [
    { name: 'Loan Principal', value: P, color: 'var(--primary)' },
    { name: 'Total Interest', value: totalInterest, color: 'var(--danger)' }
  ];

  const getAmortizationSchedule = () => {
    const schedule = [];
    if (emi > 0 && N > 0) {
      let currentBalance = P;
      const r = (annualInterest / 12) / 100;
      
      for (let month = 1; month <= N; month++) {
        const monthInterest = Math.round(currentBalance * r * 100) / 100;
        let monthPrincipal = Math.round((emi - monthInterest) * 100) / 100;
        
        if (month === N) {
          monthPrincipal = currentBalance;
        }
        
        const endingBalance = Math.max(0, Math.round((currentBalance - monthPrincipal) * 100) / 100);
        
        schedule.push({
          month,
          beginningBalance: Math.round(currentBalance),
          emi: Math.round(emi),
          principal: Math.round(monthPrincipal),
          interest: Math.round(monthInterest),
          endingBalance: Math.round(endingBalance)
        });
        
        currentBalance = endingBalance;
      }
    }
    return schedule;
  };

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
          <h2><TrendingUp size={18} className="app-logo" /> Smart EMI Calculator</h2>
        </div>
        <span className="app-badge" style={{ background: 'var(--primary)' }}>Simulate Rates</span>
      </div>

      <div className="panel-body">
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }} className="analytics-grid-2x1">
          
          {/* Sliders Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Amount Slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="form-label">Loan Principal Amount</span>
                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1rem' }}>₹{P.toLocaleString()}</span>
              </div>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><IndianRupee size={14} /></span>
                <input
                  type="number"
                  className="form-input"
                  value={params.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  min="10000"
                  max="1000000"
                />
              </div>
              <div className="slider-container" style={{ marginTop: '0.5rem' }}>
                <input
                  type="range"
                  className="form-slider"
                  min="10000"
                  max="500000"
                  step="5000"
                  value={params.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                />
              </div>
            </div>

            {/* Interest Rate Slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="form-label">Annual Interest Rate</span>
                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1rem' }}>{annualInterest}% p.a.</span>
              </div>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><Percent size={14} /></span>
                <input
                  type="number"
                  className="form-input"
                  step="0.1"
                  value={params.rate}
                  onChange={(e) => handleChange('rate', e.target.value)}
                  min="3"
                  max="36"
                />
              </div>
              <div className="slider-container" style={{ marginTop: '0.5rem' }}>
                <input
                  type="range"
                  className="form-slider"
                  min="5"
                  max="30"
                  step="0.1"
                  value={params.rate}
                  onChange={(e) => handleChange('rate', e.target.value)}
                />
              </div>
            </div>

            {/* Tenure Slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="form-label">Loan Tenure</span>
                <span style={{ color: 'var(--success)', fontWeight: 800, fontSize: '1rem' }}>{N} Months</span>
              </div>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><Calendar size={14} /></span>
                <input
                  type="number"
                  className="form-input"
                  value={params.tenure}
                  onChange={(e) => handleChange('tenure', e.target.value)}
                  min="3"
                  max="120"
                />
              </div>
              <div className="slider-container" style={{ marginTop: '0.5rem' }}>
                <input
                  type="range"
                  className="form-slider"
                  min="3"
                  max="60"
                  step="1"
                  value={params.tenure}
                  onChange={(e) => handleChange('tenure', e.target.value)}
                />
              </div>
            </div>

          </div>

          {/* Results Analytics Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Monthly EMI Card */}
            <div style={{ 
              padding: '1.25rem', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'var(--primary-glow)',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
                Calculated Monthly EMI
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', marginTop: '0.25rem' }}>
                ₹{emi.toLocaleString()}
              </div>
            </div>

            {/* Metrics cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="glass-panel" style={{ padding: '0.75rem', textAlign: 'center', backgroundColor: 'hsla(224, 30%, 5%, 0.2)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Principal</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '0.25rem' }}>₹{P.toLocaleString()}</div>
              </div>
              <div className="glass-panel" style={{ padding: '0.75rem', textAlign: 'center', backgroundColor: 'hsla(224, 30%, 5%, 0.2)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Interest</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.25rem' }}>₹{totalInterest.toLocaleString()}</div>
              </div>
            </div>

            {/* Recharts Pie Chart */}
            <div className="glass-panel" style={{ 
              height: '180px', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'hsla(224, 30%, 5%, 0.2)',
              position: 'relative'
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: 'var(--bg-panel)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Total Pay</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>₹{totalRepayment.toLocaleString()}</div>
              </div>
            </div>

          </div>

        </div>

        {/* Amortization Schedule (Always visible) */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0' }}>Amortization Schedule</h3>
          <div className="applicants-table-wrapper" style={{ maxHeight: '300px' }}>
            <table className="applicants-table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th style={{ textAlign: 'right' }}>Principal Paid</th>
                  <th style={{ textAlign: 'right' }}>Interest Paid</th>
                  <th style={{ textAlign: 'right' }}>Ending Balance</th>
                </tr>
              </thead>
              <tbody>
                {getAmortizationSchedule().map((row) => (
                  <tr key={row.month}>
                    <td>Month {row.month}</td>
                    <td style={{ textAlign: 'right', color: 'var(--success)' }}>₹{row.principal.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: 'var(--danger)' }}>₹{row.interest.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{row.endingBalance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
