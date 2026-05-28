import React, { useEffect, useState } from 'react';
import { 
  User, 
  IndianRupee, 
  Wallet, 
  Layers, 
  Calendar, 
  AlertTriangle,
  Play,
  TrendingUp
} from 'lucide-react';

export default function LoanForm({ onSubmit, userProfile, onBack }) {
  const [formData, setFormData] = useState({
    name: userProfile?.name || "Applicant",
    monthly_income: userProfile?.monthly_income || 50000,
    monthly_expense: userProfile?.monthly_expense || 15000,
    existing_monthly_emi: userProfile?.existing_monthly_emi || 5000,
    requested_loan_amount: 100000,
    interest_rate: 12,
    loan_tenure: 12,
    credit_history_months: userProfile?.credit_history_months || 24,
    defaults: userProfile?.defaults || 0
  });

  const [errors, setErrors] = useState({});

  // Sync applicant details if user logs in
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        name: userProfile.name || prev.name,
        monthly_income: userProfile.monthly_income !== undefined && userProfile.monthly_income !== null ? Number(userProfile.monthly_income) : prev.monthly_income,
        monthly_expense: userProfile.monthly_expense !== undefined && userProfile.monthly_expense !== null ? Number(userProfile.monthly_expense) : prev.monthly_expense,
        existing_monthly_emi: userProfile.existing_monthly_emi !== undefined && userProfile.existing_monthly_emi !== null ? Number(userProfile.existing_monthly_emi) : prev.existing_monthly_emi,
        credit_history_months: userProfile.credit_history_months !== undefined && userProfile.credit_history_months !== null ? Number(userProfile.credit_history_months) : prev.credit_history_months,
        defaults: userProfile.defaults !== undefined && userProfile.defaults !== null ? Number(userProfile.defaults) : prev.defaults
      }));
    }
  }, [userProfile]);


  const validate = (data) => {
    let errs = {};
    if (data.monthly_income <= 0) {
      errs.monthly_income = "Income must be greater than zero";
    }
    if (data.monthly_expense < 0) {
      errs.monthly_expense = "Expenses cannot be negative";
    }
    if (data.existing_monthly_emi < 0) {
      errs.existing_monthly_emi = "EMI cannot be negative";
    }
    if (data.requested_loan_amount <= 0) {
      errs.requested_loan_amount = "Requested loan must be greater than zero";
    }
    if (data.interest_rate <= 0) {
      errs.interest_rate = "Interest rate must be greater than zero";
    }
    if (data.loan_tenure <= 0) {
      errs.loan_tenure = "Tenure must be at least 1 month";
    }
    if (data.credit_history_months < 0) {
      errs.credit_history_months = "History cannot be negative";
    }
    if (data.defaults < 0) {
      errs.defaults = "Defaults cannot be negative";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, val) => {
    const updated = {
      ...formData,
      [field]: field === 'name' ? val : (val === "" ? "" : Number(val))
    };
    setFormData(updated);
    validate(updated);
  };

  const handleBlur = () => {
    const cleaned = { ...formData };
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === "" && key !== 'name') cleaned[key] = 0;
    });
    setFormData(cleaned);
    validate(cleaned);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate(formData)) {
      onSubmit(formData);
    }
  };


  return (
    <div className="glass-panel" style={{ height: '100%' }}>
      <div className="panel-header">
        {onBack && (
          <button 
            type="button" 
            className="preset-btn" 
            onClick={onBack}
            style={{ margin: 0, padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, marginRight: '0.5rem' }}
          >
            &larr; Back
          </button>
        )}
        <h2><Wallet size={18} className="app-logo" /> Applicant Profile</h2>
        <span className="app-badge" style={{ background: 'var(--primary)' }}>Real-time Input</span>
      </div>

      <div className="panel-body">

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Applicant Name (read-only) */}
          <div className="form-group">
            <label className="form-label">Applicant Name</label>
            <div className="form-input-wrapper">
              <span className="form-input-icon"><User size={16} /></span>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                readOnly
                style={{ opacity: 0.8, backgroundColor: 'hsla(224, 30%, 5%, 0.4)', borderStyle: 'dashed' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="config-grid-2col">
            {/* Income */}
            <div className="form-group">
              <label className="form-label">
                <span>Monthly Income</span>
                <span className="points-add">₹{(formData.monthly_income || 0).toLocaleString()}</span>
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><IndianRupee size={14} /></span>
                <input
                  type="number"
                  className="form-input"
                  value={formData.monthly_income}
                  onChange={(e) => handleChange('monthly_income', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  className="form-slider"
                  min="10000"
                  max="150000"
                  step="5000"
                  value={formData.monthly_income || 0}
                  onChange={(e) => handleChange('monthly_income', e.target.value)}
                />
              </div>
            </div>

            {/* Expenses */}
            <div className="form-group">
              <label className="form-label">
                <span>Monthly Expenses</span>
                <span className="points-sub">₹{(formData.monthly_expense || 0).toLocaleString()}</span>
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><Wallet size={14} /></span>
                <input
                  type="number"
                  className="form-input"
                  value={formData.monthly_expense}
                  onChange={(e) => handleChange('monthly_expense', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  className="form-slider"
                  min="5000"
                  max="100000"
                  step="2500"
                  value={formData.monthly_expense || 0}
                  onChange={(e) => handleChange('monthly_expense', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="config-grid-2col">
            {/* Existing EMI */}
            <div className="form-group">
              <label className="form-label">
                <span>Existing Monthly EMI</span>
                <span className="points-sub">₹{(formData.existing_monthly_emi || 0).toLocaleString()}</span>
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><Layers size={14} /></span>
                <input
                  type="number"
                  className="form-input"
                  value={formData.existing_monthly_emi}
                  onChange={(e) => handleChange('existing_monthly_emi', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  className="form-slider"
                  min="0"
                  max="50000"
                  step="1000"
                  value={formData.existing_monthly_emi || 0}
                  onChange={(e) => handleChange('existing_monthly_emi', e.target.value)}
                />
              </div>
            </div>

            {/* Requested Loan Amount */}
            <div className="form-group">
              <label className="form-label">
                <span>Requested Loan Amount</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{(formData.requested_loan_amount || 0).toLocaleString()}</span>
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><IndianRupee size={14} /></span>
                <input
                  type="number"
                  className="form-input"
                  value={formData.requested_loan_amount}
                  onChange={(e) => handleChange('requested_loan_amount', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  className="form-slider"
                  min="10000"
                  max="500000"
                  step="10000"
                  value={formData.requested_loan_amount || 0}
                  onChange={(e) => handleChange('requested_loan_amount', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="config-grid-2col">
            {/* Interest Rate */}
            <div className="form-group">
              <label className="form-label">
                <span>Interest Rate (% p.a.)</span>
                <span>{formData.interest_rate}%</span>
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><TrendingUp size={14} /></span>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={formData.interest_rate}
                  onChange={(e) => handleChange('interest_rate', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  className="form-slider"
                  min="5"
                  max="30"
                  step="0.5"
                  value={formData.interest_rate || 0}
                  onChange={(e) => handleChange('interest_rate', e.target.value)}
                />
              </div>
            </div>

            {/* Loan Tenure */}
            <div className="form-group">
              <label className="form-label">
                <span>Loan Tenure (Months)</span>
                <span>{formData.loan_tenure}m</span>
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><Calendar size={14} /></span>
                <input
                  type="number"
                  className="form-input"
                  value={formData.loan_tenure}
                  onChange={(e) => handleChange('loan_tenure', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  className="form-slider"
                  min="3"
                  max="60"
                  step="1"
                  value={formData.loan_tenure || 0}
                  onChange={(e) => handleChange('loan_tenure', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="config-grid-2col">
            {/* Credit History */}
            <div className="form-group">
              <label className="form-label">
                <span>Credit History (Months)</span>
                <span>{formData.credit_history_months}m</span>
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><Calendar size={14} /></span>
                <input
                  type="number"
                  className="form-input"
                  value={formData.credit_history_months}
                  onChange={(e) => handleChange('credit_history_months', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  className="form-slider"
                  min="0"
                  max="60"
                  step="1"
                  value={formData.credit_history_months || 0}
                  onChange={(e) => handleChange('credit_history_months', e.target.value)}
                />
              </div>
            </div>

            {/* Defaults */}
            <div className="form-group">
              <label className="form-label">
                <span>Past Defaults</span>
                <span className="points-sub">{formData.defaults} Count</span>
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><AlertTriangle size={14} /></span>
                <input
                  type="number"
                  className="form-input"
                  value={formData.defaults}
                  onChange={(e) => handleChange('defaults', e.target.value)}
                  onBlur={handleBlur}
                  min="0"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={Object.keys(errors).length > 0}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <Play size={16} /> Evaluate Risk & Calculate EMI
          </button>
        </form>
      </div>
    </div>
  );
}
