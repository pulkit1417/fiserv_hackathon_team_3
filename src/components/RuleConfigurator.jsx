import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Settings, AlertCircle, RefreshCw, Save } from 'lucide-react';

export default function RuleConfigurator({ onBack, showToast }) {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current rules
  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/rules');
      if (!response.ok) {
        throw new Error('Failed to load rules from server.');
      }
      const data = await response.json();
      setJsonText(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message);
      if (showToast) showToast('Failed to load configuration rules.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleJsonChange = (e) => {
    setJsonText(e.target.value);
    setError(null);
  };

  const handleSave = async () => {
    try {
      // Validate JSON
      const parsedRules = JSON.parse(jsonText);
      
      // Basic schema validations
      if (!parsedRules.hard_rejects || !parsedRules.warnings || !parsedRules.score_weights || !parsedRules.decision_thresholds) {
        throw new Error("Rules must include 'hard_rejects', 'warnings', 'score_weights', and 'decision_thresholds'.");
      }

      setLoading(true);
      const response = await fetch('/api/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedRules),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save rules.');
      }

      const resData = await response.json();
      setJsonText(JSON.stringify(resData.rules, null, 2));
      if (showToast) showToast('Configuration rules updated successfully!', 'success');
    } catch (err) {
      setError(err.message);
      if (showToast) showToast('Failed to save rules: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefault = () => {
    const defaultRules = {
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
          { max: 0.30, points: 100 },
          { max: 0.50, points: 0 },
          { max: 999.00, points: -150 }
        ],
        credit_history_ranges: [
          { min: 25, points: 80 },
          { min: 0, points: 0 }
        ],
        defaults_ranges: [
          { count: 0, points: 50 },
          { count: 1, points: 0 },
          { count: 2, points: -200 }
        ]
      },
      decision_thresholds: {
        approved_min_score: 750,
        conditional_min_score: 600
      }
    };
    setJsonText(JSON.stringify(defaultRules, null, 2));
    setError(null);
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
          <h2><Settings size={18} className="app-logo" /> Dynamic Rule Configurator</h2>
        </div>
        <span className="app-badge" style={{ background: 'var(--primary)' }}>JSON Engine Config</span>
      </div>

      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {loading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="spin" style={{ marginBottom: '0.5rem' }} />
            <div>Loading active parameters...</div>
          </div>
        )}

        {!loading && (
          <>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Directly edit the credit evaluation model parameters (Hard rejects limits, DTI warnings, scoring ranges, and decision thresholds). The backend rule engine automatically parses and applies these configurations in real-time.
            </p>

            {error && (
              <div className="alert alert-danger" style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: 'var(--radius-sm)', 
                backgroundColor: 'var(--danger-glow)',
                color: 'var(--danger)',
                border: '1px solid var(--danger)40',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 500
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{error}</div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Rule Ruleset (JSON Format)
              </label>
              <textarea
                value={jsonText}
                onChange={handleJsonChange}
                rows={22}
                style={{
                  width: '100%',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'hsla(224, 30%, 5%, 0.15)',
                  color: 'var(--text-main)',
                  lineHeight: '1.5',
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSave}
                style={{ flexGrow: 1 }}
              >
                <Save size={16} /> Save & Apply Rules
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleResetDefault}
              >
                Reset to Defaults
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={fetchRules}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
