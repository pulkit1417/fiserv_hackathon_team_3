import React, { useState } from 'react';
import ScoreGauge from './ScoreGauge';
import { jsPDF } from 'jspdf';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Award,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Info,
  Table,
  Download
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function ExplanationPanel({ evaluation, onBack }) {
  const [showSchedule, setShowSchedule] = useState(false);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(234, 88, 12); // Orange
    doc.text("finSure Credit Evaluation Report", margin, y);
    y += 8;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Muted text
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, y);
    y += 4;

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, 210 - margin, y);
    y += 10;

    // Category 1: Applicant Profile & Loan Details
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // Dark slate
    doc.text("1. Applicant Profile & Loan Details", margin, y);
    y += 8;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    
    // Two Column layout
    const col1X = margin;
    const col2X = margin + 85;

    doc.text(`Applicant Name: ${evaluation.input.name || 'Guest'}`, col1X, y);
    doc.text(`Requested Amount: Rs. ${Number(evaluation.input.requested_loan_amount).toLocaleString()}`, col2X, y);
    y += 6;
    doc.text(`Monthly Income: Rs. ${Number(evaluation.input.monthly_income).toLocaleString()}`, col1X, y);
    doc.text(`Interest Rate: ${evaluation.input.interest_rate}% p.a.`, col2X, y);
    y += 6;
    doc.text(`Monthly Expenses: Rs. ${Number(evaluation.input.monthly_expense).toLocaleString()}`, col1X, y);
    doc.text(`Loan Tenure: ${evaluation.input.loan_tenure} Months`, col2X, y);
    y += 6;
    doc.text(`Existing Monthly EMI: Rs. ${Number(evaluation.input.existing_monthly_emi).toLocaleString()}`, col1X, y);
    doc.text(`Credit History: ${evaluation.input.credit_history_months} Months`, col2X, y);
    y += 6;
    doc.text(`Past Defaults: ${evaluation.input.defaults} Count`, col1X, y);
    y += 12;

    // Category 2: Evaluation Decision
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("2. Evaluation Decision & Risk Profile", margin, y);
    y += 8;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    
    const displayDecision = decision === "APPROVE" ? "APPROVED" : decision === "REVIEW" ? "REVIEW REQUIRED" : "REJECTED";
    doc.setFont("Helvetica", "bold");
    doc.text("Decision: ", col1X, y);
    if (decision === "APPROVE") {
      doc.setTextColor(22, 163, 74); // Green
    } else if (decision === "REVIEW") {
      doc.setTextColor(234, 88, 12); // Orange
    } else {
      doc.setTextColor(220, 38, 38); // Red
    }
    doc.text(displayDecision, col1X + 20, y);
    
    doc.setTextColor(15, 23, 42); // back to dark slate
    doc.setFont("Helvetica", "normal");
    doc.text(`Credit Score: ${score} (${riskCategory})`, col2X, y);
    y += 7;

    const reasonTextLines = doc.splitTextToSize(`Decision Reason: ${decisionReason}`, 170);
    doc.text(reasonTextLines, margin, y);
    y += (reasonTextLines.length * 6) + 8;

    // Category 3: Key Financial Metrics
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("3. Key Financial Metrics", margin, y);
    y += 8;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Calculated Monthly EMI: Rs. ${Math.round(metrics.emi).toLocaleString()}`, margin, y);
    y += 6;
    doc.text(`Projected Debt-to-Income (DTI) Ratio: ${metrics.dti}%`, margin, y);
    y += 6;
    doc.text(`Monthly Affordability Cushion: Rs. ${Math.round(metrics.affordabilityCushion).toLocaleString()}`, margin, y);
    y += 12;

    // Category 4: Risk Checkpoints Audit
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("4. Risk Checkpoints Audit", margin, y);
    y += 8;

    doc.setFontSize(10);
    auditLog.forEach((log) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("Helvetica", "bold");
      const status = log.type === "pass" ? "PASS" : log.type === "warning" ? "WARNING" : "FAIL";
      
      doc.text(log.rule, margin, y);
      
      if (log.type === "pass") {
        doc.setTextColor(22, 163, 74);
      } else if (log.type === "warning") {
        doc.setTextColor(234, 88, 12);
      } else {
        doc.setTextColor(220, 38, 38);
      }
      doc.text(`[${status}]`, margin + 110, y);
      doc.setTextColor(15, 23, 42);
      doc.setFont("Helvetica", "normal");
      
      y += 5;
      const detailsLines = doc.splitTextToSize(log.details, 170);
      doc.text(detailsLines, margin, y);
      y += (detailsLines.length * 5) + 4;
    });

    // Category 5: Amortization Table (Only if approved)
    if (decision === "APPROVE" && schedule && schedule.length > 0) {
      if (y > 220) {
        doc.addPage();
        y = 20;
      }
      
      y += 5;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.text("5. Monthly Amortization Repayments", margin, y);
      y += 8;

      // Draw table headers
      doc.setFontSize(10);
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, 170, 7, "F");
      doc.text("Month", margin + 3, y + 5);
      doc.text("Principal Paid", margin + 40, y + 5);
      doc.text("Interest Paid", margin + 85, y + 5);
      doc.text("Ending Balance", margin + 130, y + 5);
      y += 7;

      doc.setFont("Helvetica", "normal");
      schedule.forEach((row) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
          
          doc.setFont("Helvetica", "bold");
          doc.setFillColor(241, 245, 249);
          doc.rect(margin, y, 170, 7, "F");
          doc.text("Month", margin + 3, y + 5);
          doc.text("Principal Paid", margin + 40, y + 5);
          doc.text("Interest Paid", margin + 85, y + 5);
          doc.text("Ending Balance", margin + 130, y + 5);
          y += 7;
          doc.setFont("Helvetica", "normal");
        }

        doc.text(`Month ${row.month}`, margin + 3, y + 5);
        doc.text(`Rs. ${row.principal.toLocaleString()}`, margin + 40, y + 5);
        doc.text(`Rs. ${row.interest.toLocaleString()}`, margin + 85, y + 5);
        doc.text(`Rs. ${row.endingBalance.toLocaleString()}`, margin + 130, y + 5);
        
        doc.setDrawColor(241, 245, 249);
        doc.line(margin, y + 7, margin + 170, y + 7);
        y += 7;
      });
    }

    doc.save(`finSure-Credit-Report-${evaluation.input.name || 'Applicant'}.pdf`);
  };

  if (!evaluation) {
    return (
      <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <Info size={40} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
          <p>Submit the borrower application form on the left to evaluate risk and view loan decisions.</p>
        </div>
      </div>
    );
  }

  const { score, riskCategory, decision, decisionReason, metrics, auditLog, scoreBreakdown, schedule } = evaluation;

  // Decision class styling maps
  let decisionClass = "REJECTED";
  let decisionTitle = "Rejected";
  let DecisionIcon = XCircle;
  let statusColor = "var(--danger)";

  if (decision === "APPROVE") {
    decisionClass = "APPROVED";
    decisionTitle = "Approved";
    DecisionIcon = CheckCircle2;
    statusColor = "var(--success)";
  } else if (decision === "REVIEW") {
    decisionClass = "CONDITIONAL_APPROVED";
    decisionTitle = "Review Required";
    DecisionIcon = AlertCircle;
    statusColor = "var(--primary)";
  }

  // Reference pie chart
  const pieData = [
    { name: 'Loan Principal', value: evaluation.input.requested_loan_amount, color: 'var(--primary)' },
    { name: 'Total Interest Payable', value: metrics.totalInterest, color: 'var(--danger)' }
  ];

  return (
    <div className="glass-panel">
      <div className="panel-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            type="button" 
            className="preset-btn" 
            onClick={onBack}
            style={{ margin: 0, padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 700 }}
          >
            &larr; Back
          </button>
          <button 
            type="button" 
            className="preset-btn" 
            onClick={handleDownloadPDF}
            style={{ margin: 0, padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Download size={12} /> Download PDF
          </button>
          <h2><Award size={18} className="app-logo" /> Evaluation Decision</h2>
        </div>
        <span className="app-badge" style={{ 
          background: decision === "APPROVE" ? 'var(--success)' : decision === "REVIEW" ? 'var(--primary)' : 'var(--danger)'
        }}>{decision === "REVIEW" ? "Under Review" : decision}</span>
      </div>

      <div className="panel-body">
        
        {/* Double column upper section: Decision + score gauge + pie chart */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="analytics-grid-2x1">
          
          {/* Decision Box */}
          <div className={`decision-panel ${decisionClass}`} style={{ justifyContent: 'center' }}>
            <div className="decision-icon">
              <DecisionIcon size={30} />
            </div>
            <h3 className="decision-title">{decisionTitle}</h3>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.4 }}>
              {decisionReason}
            </p>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
              Risk: {riskCategory}
            </span>
          </div>

          {/* Credit Score Gauge */}
          <div className="glass-panel" style={{ backgroundColor: 'hsla(224, 30%, 5%, 0.2)', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ScoreGauge score={score} />
          </div>

        </div>

        {/* Calculated Financial Metrics */}
        <div className="metrics-display-grid" style={{ marginTop: '0.5rem' }}>
          
          {/* Monthly EMI */}
          <div className="metric-card">
            <span className="metric-card-label">Calculated Monthly EMI</span>
            <span className="metric-card-value" style={{ color: 'var(--primary)' }}>
              ₹{Math.round(metrics.emi).toLocaleString()}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Interest: {evaluation.input.interest_rate}% p.a.
            </span>
          </div>

          {/* DTI Ratio */}
          <div className="metric-card">
            <span className="metric-card-label">Debt-to-Income (DTI)</span>
            <span className="metric-card-value" style={{ 
              color: metrics.dti > 50 ? 'var(--danger)' : metrics.dti >= 35 ? 'var(--primary)' : 'var(--success)'
            }}>
              {metrics.dti}%
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {metrics.dti > 50 ? "Limit Exceeded (>50%)" : metrics.dti >= 35 ? "Review Zone (35-50%)" : "Safe Zone (<35%)"}
            </span>
          </div>

          {/* Savings Cushion */}
          <div className="metric-card">
            <span className="metric-card-label">Affordability Cushion</span>
            <span className="metric-card-value" style={{ 
              color: metrics.affordabilityCushion <= 0 ? 'var(--danger)' : 'var(--success)'
            }}>
              ₹{Math.round(metrics.affordabilityCushion).toLocaleString()}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Surplus net income
            </span>
          </div>

        </div>

        {/* Rule audit checklists */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', textAlign: 'left' }}>
            Risk Checkpoints
          </h4>
          <div className="audit-list">
            {auditLog.map((log, index) => {
              let Icon = CheckCircle2;
              if (log.type === "reject") Icon = XCircle;
              if (log.type === "warning") Icon = AlertCircle;

              return (
                <div key={index} className={`audit-item ${log.type}`}>
                  <div className="audit-item-icon">
                    <Icon size={16} />
                  </div>
                  <div className="audit-item-info">
                    <span className="audit-item-name">{log.rule}</span>
                    <span className="audit-item-desc">{log.details}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score Calculations breakdown */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', textAlign: 'left' }}>
            Point Breakdown Matrix
          </h4>
          <div className="applicants-table-wrapper" style={{ maxHeight: 'none' }}>
            <table className="score-table">
              <thead>
                <tr>
                  <th>Scoring Factor</th>
                  <th style={{ textAlign: 'right' }}>Points</th>
                  <th style={{ textAlign: 'right' }}>Running Score</th>
                </tr>
              </thead>
              <tbody>
                {scoreBreakdown.map((row, idx) => {
                  let pointsClass = "points-neutral";
                  let pointsPrefix = "";
                  
                  if (idx > 0 && idx < scoreBreakdown.length - 1) {
                    if (row.change > 0) {
                      pointsClass = "points-add";
                      pointsPrefix = "+";
                    } else if (row.change < 0) {
                      pointsClass = "points-sub";
                      pointsPrefix = "";
                    }
                  } else if (idx === scoreBreakdown.length - 1 && row.change !== 0) {
                    pointsClass = row.change > 0 ? "points-add" : "points-sub";
                    pointsPrefix = row.change > 0 ? "+" : "";
                  }

                  return (
                    <tr key={idx} style={{ 
                      backgroundColor: idx === 0 || idx === scoreBreakdown.length - 1 ? 'hsla(224, 30%, 5%, 0.4)' : 'transparent',
                      fontWeight: idx === scoreBreakdown.length - 1 ? '700' : 'normal'
                    }}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {idx > 0 && <ChevronRight size={12} color="var(--text-muted)" />}
                        {row.factor}
                      </td>
                      <td className={pointsClass} style={{ textAlign: 'right' }}>
                        {idx === 0 ? "" : `${pointsPrefix}${row.change}`}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: idx === scoreBreakdown.length - 1 ? '800' : 'normal' }}>
                        {row.running}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Repayment Interest split and Amortization schedule (Only visible if approved) */}
        {decision === "APPROVE" && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.25rem', marginTop: '0.5rem' }} className="analytics-grid-2x1">
              {/* Interest summary & Pie */}
              <div className="glass-panel" style={{ padding: '1rem', backgroundColor: 'hsla(224, 30%, 5%, 0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '110px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%', textAlign: 'left', marginTop: '0.25rem' }}>
                  <div>Principal: <strong>₹{Number(evaluation.input.requested_loan_amount).toLocaleString()}</strong></div>
                  <div>Total Interest: <strong>₹{metrics.totalInterest.toLocaleString()}</strong></div>
                </div>
              </div>

              {/* Amortization schedule button */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <span className="form-label" style={{ fontSize: '0.7rem' }}>Total Repayment Outflow</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>
                    ₹{(Math.round(metrics.emi) * evaluation.input.loan_tenure).toLocaleString()}
                  </span>
                </div>

                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.8rem', padding: '0.5rem', width: '100%' }}
                  onClick={() => setShowSchedule(!showSchedule)}
                >
                  <Table size={14} style={{ marginRight: '4px' }} />
                  {showSchedule ? "Hide Amortization" : "View Amortization"}
                </button>
              </div>
            </div>

            {/* Scrollable Amortization table */}
            {showSchedule && (
              <div className="applicants-table-wrapper" style={{ marginTop: '0.75rem', maxHeight: '250px' }}>
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
                    {schedule.map((row) => (
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
            )}
          </>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleDownloadPDF}
            style={{ width: '100%', maxWidth: '240px' }}
          >
            <Download size={16} /> Download PDF Report
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={onBack}
            style={{ width: '100%', maxWidth: '240px' }}
          >
            Run Another Evaluation
          </button>
        </div>

      </div>
    </div>
  );
}
