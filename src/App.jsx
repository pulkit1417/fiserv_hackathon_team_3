import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Activity,
  LogOut, 
  Sun, 
  Moon, 
  CheckCircle,
  AlertCircle,
  FileText,
  Percent,
  Briefcase,
  Sparkles
} from 'lucide-react';

import AuthPage from './components/AuthPage';
import LoanForm from './components/LoanForm';
import ExplanationPanel from './components/ExplanationPanel';
import DashboardView from './components/DashboardView';
import EmiCalculator from './components/EmiCalculator';
import PortfolioPlanner from './components/PortfolioPlanner';
import RecommendationEngine from './components/RecommendationEngine';


import './App.css';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wealthshield_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activeTab, setActiveTab] = useState("evaluator");
  const [evaluation, setEvaluation] = useState(null);
  const [activeApplicant, setActiveApplicant] = useState(null);

  const [dashboardSubView, setDashboardSubView] = useState(null);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setDashboardSubView(null);
    showToast(`Welcome to FinSure, ${userData.name}!`, "success");
    
    // Auto-evaluate the active applicant details with the logged-in name
    if (activeApplicant) {
      const updatedApplicant = {
        ...activeApplicant,
        name: userData.name
      };
      handleEvaluate(updatedApplicant, userData);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('wealthshield_user');
    setUser(null);
    setEvaluation(null);
    setActiveApplicant(null);
    setDashboardSubView(null);
    showToast("Signed out successfully.", "success");
  };

  // Evaluate applicant profile
  const handleEvaluate = async (applicantData, activeUser = user) => {
    setActiveApplicant(applicantData);
    if (!activeUser) {
      setDashboardSubView("result");
      return;
    }

    // Persist applicant details back to user state and localStorage
    const updatedUser = {
      ...activeUser,
      monthly_income: Number(applicantData.monthly_income),
      monthly_expense: Number(applicantData.monthly_expense),
      existing_monthly_emi: Number(applicantData.existing_monthly_emi),
      credit_history_months: Number(applicantData.credit_history_months),
      defaults: Number(applicantData.defaults)
    };
    setUser(updatedUser);
    localStorage.setItem('wealthshield_user', JSON.stringify(updatedUser));
    
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicantData),
      });
      const result = await response.json();
      setEvaluation(result);
      setDashboardSubView("result");

      // Confetti effect for instant approval!
      if (result.decision === "APPROVE") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ea580c', '#16a34a', '#ffffff']
        });
        showToast("Loan Application Approved Instantly!", "success");
      } else if (result.decision === "REVIEW") {
        showToast("Application marked for manual review.", "warning");
      } else {
        showToast("Application Rejected: High credit risk.", "error");
      }
    } catch (err) {
      console.error("Evaluation request failed:", err);
      showToast("Evaluation service offline.", "error");
    }
  };







  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg-app)',
      color: 'var(--text-main)',
      transition: 'background-color var(--transition-normal)'
    }}>
      
      {/* 1. Left Sidebar Navigation */}
      <aside className="glass-panel" style={{
        width: '260px',
        borderRadius: '0 var(--radius-md) var(--radius-md) 0',
        borderLeft: 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <ShieldCheck size={28} className="app-logo" style={{ color: 'var(--primary)' }} />
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, margin: 0, background: 'none', WebkitTextFillColor: 'initial', color: 'var(--primary)' }}>
              FinSure
            </h1>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Approval Engine
            </span>
          </div>
        </div>

        {/* User Profile */}
        <div style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'hsla(224, 30%, 5%, 0.2)'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: user ? 'var(--primary)' : 'var(--border-color)',
            color: user ? 'var(--text-inverse)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.95rem'
          }}>
            {user ? user.name[0].toUpperCase() : "G"}
          </div>
          <div style={{ textAlign: 'left', overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user ? user.name : "Guest Borrower"}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user ? user.email : "Not signed in"}
            </div>
          </div>
        </div>

        {/* Sidebar Nav buttons */}
        <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flexGrow: 1, overflowY: 'auto' }}>
          
          <button 
            type="button" 
            className={`nav-tab-btn ${dashboardSubView === null ? 'active' : ''}`}
            onClick={() => setDashboardSubView(null)}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Activity size={16} /> Credit Dashboard
          </button>

          <div style={{ margin: '0.75rem 0.5rem 0.25rem', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', textAlign: 'left' }}>
            Workspaces
          </div>

          <button 
            type="button" 
            className={`nav-tab-btn ${dashboardSubView === 'form' || dashboardSubView === 'result' ? 'active' : ''}`}
            onClick={() => setDashboardSubView("form")}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <FileText size={16} /> Credit Evaluator
          </button>

          <button 
            type="button" 
            className={`nav-tab-btn ${dashboardSubView === 'emi' ? 'active' : ''}`}
            onClick={() => setDashboardSubView("emi")}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Percent size={16} /> EMI Calculator
          </button>

          <button 
            type="button" 
            className={`nav-tab-btn ${dashboardSubView === 'portfolio' ? 'active' : ''}`}
            onClick={() => setDashboardSubView("portfolio")}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Briefcase size={16} /> Portfolio Planner
          </button>

          <button 
            type="button" 
            className={`nav-tab-btn ${dashboardSubView === 'recommendations' ? 'active' : ''}`}
            onClick={() => setDashboardSubView("recommendations")}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Sparkles size={16} /> Recommendations
          </button>

        </nav>

        {/* Footer sign out */}
        {user && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleSignOut}
              style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* 2. Main Workspace */}
      <div style={{ flexGrow: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowX: 'hidden' }}>
        
        {/* Top Navbar Header */}
        <header className="glass-panel" style={{
          padding: '0.75rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 40
        }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Micro-Credit Platform
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              {dashboardSubView === null ? "Personal Credit Dashboard" 
                : dashboardSubView === 'form' ? "Stateless Risk & Amortization Evaluator" 
                : dashboardSubView === 'result' ? "Credit Score & Amortization Repayments Decision"
                : dashboardSubView === 'emi' ? "Smart EMI Simulator" 
                : dashboardSubView === 'portfolio' ? "Debt Portfolio Planner" 
                : "Smart Recommendations & Advisory"}
            </h2>
          </div>


        </header>

        {/* View render */}
        <main style={{ flexGrow: 1 }}>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem', 
            maxWidth: (dashboardSubView === null || dashboardSubView === 'recommendations' || dashboardSubView === 'result') ? '960px' : '640px', 
            margin: '0 auto',
            width: '100%'
          }}>
            {!user ? (
              <AuthPage onAuthSuccess={handleAuthSuccess} />
            ) : dashboardSubView === null ? (
              <DashboardView user={user} onNavigate={(view) => setDashboardSubView(view)} />
            ) : dashboardSubView === 'form' ? (
              <LoanForm onSubmit={handleEvaluate} userProfile={user} onBack={() => setDashboardSubView(null)} />
            ) : dashboardSubView === 'result' ? (
              <ExplanationPanel evaluation={evaluation} onBack={() => setDashboardSubView("form")} />
            ) : dashboardSubView === 'emi' ? (
              <EmiCalculator onBack={() => setDashboardSubView(null)} />
            ) : dashboardSubView === 'portfolio' ? (
              <PortfolioPlanner user={user} onBack={() => setDashboardSubView(null)} />
            ) : dashboardSubView === 'recommendations' ? (
              <RecommendationEngine user={user} onBack={() => setDashboardSubView(null)} />
            ) : null}
          </div>

        </main>
      </div>

      {/* Floating Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`} style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 1000,
          backgroundColor: toast.type === 'success' ? 'var(--success-glow)' : toast.type === 'warning' ? 'var(--warning-glow)' : 'var(--danger-glow)',
          color: toast.type === 'success' ? 'var(--success)' : toast.type === 'warning' ? 'var(--warning)' : 'var(--danger)',
          border: `1px solid ${toast.type === 'success' ? 'var(--success)40' : toast.type === 'warning' ? 'var(--warning)40' : 'var(--danger)40'}`,
          animation: 'fadeIn var(--transition-fast) ease-out'
        }}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
