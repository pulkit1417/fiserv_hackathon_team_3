import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  ArrowRight, 
  IndianRupee, 
  Wallet, 
  Layers, 
  Calendar, 
  AlertTriangle 
} from 'lucide-react';

export default function AuthPage({ onAuthSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    monthly_income: 50000,
    monthly_expense: 15000,
    existing_monthly_emi: 5000,
    credit_history_months: 24,
    defaults: 0
  });
  const [error, setError] = useState("");

  const handleChange = (field, val) => {
    setFormData({
      ...formData,
      [field]: field === 'name' || field === 'email' ? val : Number(val)
    });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (formData.monthly_income <= 0) {
      setError("Monthly Income must be greater than zero.");
      return;
    }
    if (formData.monthly_expense < 0 || formData.existing_monthly_emi < 0) {
      setError("Financial outflows cannot be negative.");
      return;
    }

    // Save session in localStorage
    localStorage.setItem('wealthshield_user', JSON.stringify(formData));
    onAuthSuccess(formData);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      width: '100%',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="panel-header" style={{ 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center', 
          padding: '2rem 2rem 1.25rem', 
          gap: '0.75rem', 
          borderBottom: '1px solid var(--border-color)' 
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--primary-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            boxShadow: 'var(--shadow-primary)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
              Personalized FinSure Setup
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', maxWidth: '500px' }}>
              Please provide your basic details and financial baseline. We will use these numbers to customize your credit dashboard, EMI calculator, and loan recommendations.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-body" style={{ padding: '2rem' }}>
            
            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: 'var(--danger-glow)',
                color: 'var(--danger)',
                border: '1px solid hsla(355, 85%, 58%, 0.2)',
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}>
                {error}
              </div>
            )}

            {/* Form Two-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="analytics-grid-2x1">
              
              {/* Left Column: Personal Identity & History */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', margin: 0, textAlign: 'left' }}>
                  1. Profile Identity
                </h3>

                {/* Name */}
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon"><User size={16} /></span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Pulkit"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon"><Mail size={16} /></span>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. pulkit@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Credit History */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Credit History (Months)</span>
                    <span style={{ fontWeight: 700 }}>{formData.credit_history_months}m</span>
                  </label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon"><Calendar size={16} /></span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.credit_history_months}
                      onChange={(e) => handleChange('credit_history_months', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                {/* Defaults */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Past Defaults Count</span>
                    <span style={{ color: formData.defaults > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                      {formData.defaults}
                    </span>
                  </label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon"><AlertTriangle size={16} /></span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.defaults}
                      onChange={(e) => handleChange('defaults', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Financial Baseline Sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', margin: 0, textAlign: 'left' }}>
                  2. Financial Outlines
                </h3>

                {/* Income */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Monthly Income</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>₹{formData.monthly_income.toLocaleString()}</span>
                  </label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon"><IndianRupee size={14} /></span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.monthly_income}
                      onChange={(e) => handleChange('monthly_income', e.target.value)}
                    />
                  </div>
                  <div className="slider-container">
                    <input
                      type="range"
                      className="form-slider"
                      min="10000"
                      max="150000"
                      step="5000"
                      value={formData.monthly_income}
                      onChange={(e) => handleChange('monthly_income', e.target.value)}
                    />
                  </div>
                </div>

                {/* Expenses */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Monthly Expenses</span>
                    <span style={{ color: 'var(--warning)', fontWeight: 700 }}>₹{formData.monthly_expense.toLocaleString()}</span>
                  </label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon"><Wallet size={14} /></span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.monthly_expense}
                      onChange={(e) => handleChange('monthly_expense', e.target.value)}
                    />
                  </div>
                  <div className="slider-container">
                    <input
                      type="range"
                      className="form-slider"
                      min="5000"
                      max="100000"
                      step="2500"
                      value={formData.monthly_expense}
                      onChange={(e) => handleChange('monthly_expense', e.target.value)}
                    />
                  </div>
                </div>

                {/* Existing EMI */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Existing Monthly EMI</span>
                    <span style={{ color: 'var(--danger)', fontWeight: 700 }}>₹{formData.existing_monthly_emi.toLocaleString()}</span>
                  </label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon"><Layers size={14} /></span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.existing_monthly_emi}
                      onChange={(e) => handleChange('existing_monthly_emi', e.target.value)}
                    />
                  </div>
                  <div className="slider-container">
                    <input
                      type="range"
                      className="form-slider"
                      min="0"
                      max="50000"
                      step="1000"
                      value={formData.existing_monthly_emi}
                      onChange={(e) => handleChange('existing_monthly_emi', e.target.value)}
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>

          <div style={{ 
            padding: '1.25rem 2rem', 
            borderTop: '1px solid var(--border-color)', 
            display: 'flex', 
            justifyContent: 'flex-end',
            backgroundColor: 'hsla(224, 30%, 5%, 0.2)'
          }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
            >
              Configure Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
