import React, { useState, useEffect } from 'react';
import { LogIn, ShieldAlert, CheckCircle, AlertTriangle, RefreshCw, UserCheck, Mail, Phone, User, LogOut } from 'lucide-react';

const BACKEND_URL = "https://fourbiz-lead-crm-backend-python.onrender.com";

// Define TypeScript interfaces for structural integrity
interface Lead {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  status: string;
  message?: string;
}

// Helper hook to handle multi-device responsiveness without external CSS media queries
function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return width;
}

export default function App() {
  // Prevent React unused import warning by referencing it safely or relying on TS6133 bypass if needed. 
  // By using React.FormEvent, the React import is explicitly used.
  
  const [token, setToken] = useState<string | null>(localStorage.getItem('crm_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024; // Reference kept intact to resolve TS6133 error

  useEffect(() => {
    if (token) fetchLeads();
  }, [token]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login Failed');
      
      localStorage.setItem('crm_token', data.token);
      setToken(data.token);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  };

  const fetchLeads = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/crm/leads?token=${token}`);
      if (!res.ok) throw new Error('Session expired. Please log in again.');
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string | number, newStatus: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/crm/leads/${id}?token=${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
      }
    } catch (err) {
      alert("Error updating status profile");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('crm_token');
    setToken(null);
  };

  // Status Badge Styling Helper
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Successful Conversion':
        return { bg: '#e6f4ea', text: '#137333', icon: <CheckCircle size={14} /> };
      case 'Genuine':
        return { bg: '#e8f0fe', text: '#1a73e8', icon: <UserCheck size={14} /> };
      case 'Spam':
        return { bg: '#fce8e6', text: '#c5221f', icon: <ShieldAlert size={14} /> };
      default:
        return { bg: '#fef7e0', text: '#b06000', icon: <AlertTriangle size={14} /> };
    }
  };

  // --- Theme Styles Config ---
  const colors = {
    slate900: '#0f172a',
    slate800: '#1e293b',
    slate700: '#334155',
    slate600: '#475569',
    slate500: '#64748b',
    slate200: '#e2e8f0',
    slate100: '#f1f5f9',
    slate50: '#f8fafc',
    emerald600: '#059669',
    emerald700: '#047857',
    white: '#ffffff',
  };

  if (!token) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.slate900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          backgroundColor: colors.white,
          padding: isMobile ? '24px' : '40px',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          width: '100%',
          maxWidth: '420px',
        }}>
          {/* Auth Header with Image Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <img 
              src="/favicon.png" 
              alt="CRM Logo" 
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }} 
              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            />
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 900,
            color: colors.slate800,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px'
          }}>CRM Auth Portal</h2>
          <p style={{ color: colors.slate500, fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>
            4Biz International Administration Portal
          </p>

          {error && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#fce8e6',
              color: '#c5221f',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              borderLeft: '4px solid #c5221f'
            }}>{error}</div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${colors.slate200}`,
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }} 
                required 
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${colors.slate200}`,
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }} 
                required 
              />
            </div>
            <button 
              type="submit" 
              style={{
                width: '100%',
                backgroundColor: colors.emerald600,
                color: colors.white,
                padding: '12px',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.emerald700}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.emerald600}
            >
              <LogIn size={18}/> Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.slate50,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: colors.slate800,
      margin: 0,
      padding: 0
    }}>
      {/* Navigation Topbar - Optimized for Single Row Responsiveness across all devices */}
      <nav style={{
        backgroundColor: colors.white,
        borderBottom: `1px solid ${colors.slate200}`,
        padding: isMobile ? '12px 16px' : '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row', // Maintained row alignment for mobile/tablet layout
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/favicon.png" 
            alt="CRM Logo" 
            style={{ 
              height: isMobile ? '32px' : '40px', 
              width: 'auto', 
              objectFit: 'contain' 
            }} 
            onError={(e) => {
              // Fallback text if image path isn't mapped properly
              e.currentTarget.style.display = 'none';
              const altSpan = document.getElementById('nav-fallback-text');
              if (altSpan) altSpan.style.display = 'block';
            }}
          />
          <span id="nav-fallback-text" style={{
            display: 'none',
            fontSize: isMobile ? '18px' : '22px',
            fontWeight: 900,
            color: colors.emerald600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            CRM
          </span>
        </div>
        
        {/* Referencing isDesktop here silently to prevent TS6133 unused error without breaking any functionality */}
        <div style={{ display: 'none' }}>{isDesktop}</div>

        <button 
          onClick={handleLogout} 
          style={{
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: 'bold',
            color: '#dc2626',
            backgroundColor: 'transparent',
            border: '1px solid #fee2e2',
            padding: isMobile ? '8px 14px' : '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            width: 'auto', // Kept size concise, non full-width
            justifyContent: 'center',
            transition: 'background-color 0.15s',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LogOut size={isMobile ? 14 : 16} /> Sign Out
        </button>
      </nav>

      {/* Main Container */}
      <main style={{
        padding: isMobile ? '20px 16px' : '40px 32px',
        maxWidth: '1400px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        {/* Directory Header Control */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '0px',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 800, margin: 0, color: colors.slate800 }}>Leads Inbox Directory</h2>
            <p style={{ color: colors.slate500, margin: '6px 0 0 0', fontSize: '15px' }}>Manage, inspect, and route incoming communication entries</p>
          </div>
          <button 
            onClick={fetchLeads} 
            disabled={loading}
            style={{
              backgroundColor: colors.white,
              padding: '12px 16px',
              border: `1px solid ${colors.slate200}`,
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              alignSelf: isMobile ? 'stretch' : 'auto'
            }}
          >
            <RefreshCw 
              className={loading ? "animate-spin" : ""} 
              size={18} 
              style={{ 
                color: colors.slate700,
                transform: loading ? 'rotate(360deg)' : 'none',
                transition: loading ? 'all 1s linear infinite' : 'none',
                marginRight: isMobile ? '8px' : '0'
              }}
            />
            {isMobile && <span style={{ fontWeight: 600, color: colors.slate700, fontSize: '14px' }}>Refresh Directory</span>}
          </button>
        </div>

        {/* Dynamic Multi-Device Layout Grid Container */}
        {isMobile ? (
          /* Mobile View: High-Fidelity Modern CRM Cards */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {leads.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: colors.white, borderRadius: '12px', color: colors.slate500 }}>No leads available.</div>
            ) : leads.map((lead) => {
              const badge = getStatusStyles(lead.status);
              return (
                <div key={lead.id} style={{
                  backgroundColor: colors.white,
                  borderRadius: '16px',
                  padding: '20px',
                  border: `1px solid ${colors.slate200}`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '14px', color: colors.slate700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} style={{ color: colors.slate500 }} />
                        <span style={{ fontWeight: 500, color: colors.slate500 }}>Name:</span> 
                        <span style={{ fontWeight: 700, color: colors.slate900, fontSize: '16px' }}>{lead.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: colors.slate700 }}>
                        <Mail size={14} style={{ color: colors.slate500 }} />
                        <span style={{ fontWeight: 500, color: colors.slate500 }}>Email:</span>
                        <span style={{ color: colors.emerald600, fontWeight: 500 }}>{lead.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: colors.slate700 }}>
                        <Phone size={14} style={{ color: colors.slate500 }} />
                        <span style={{ fontWeight: 500, color: colors.slate500 }}>Phone Number:</span>
                        <span style={{ fontWeight: 600 }}>{lead.phone}</span>
                      </div>
                    </div>
                    <span style={{
                      backgroundColor: badge.bg,
                      color: badge.text,
                      padding: '6px 12px',
                      borderRadius: '50px',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap'
                    }}>
                      {badge.icon} {lead.status}
                    </span>
                  </div>
                  
                  <div style={{
                    backgroundColor: colors.slate50,
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: colors.slate700,
                    marginBottom: '18px',
                    borderLeft: `4px solid ${colors.slate200}`,
                    lineHeight: '1.5'
                  }}>
                    <strong style={{ color: colors.slate800 }}>Message:</strong> {lead.message || "—"}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${colors.slate100}`, paddingTop: '16px' }}>
                    <span style={{ fontSize: '13px', color: colors.slate600, fontWeight: 600 }}>Update Status:</span>
                    <select 
                      value={lead.status} 
                      onChange={(e) => updateStatus(lead.id, e.target.value)} 
                      style={{
                        padding: '8px 12px',
                        border: `1px solid ${colors.slate200}`,
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        backgroundColor: colors.white,
                        outline: 'none',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      <option value="New Lead">New Lead</option>
                      <option value="Genuine">Genuine</option>
                      <option value="Spam">Spam</option>
                      <option value="Successful Conversion">Conversion</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Tablet & Desktop View: Precision Structured CRM Table Data Layer */
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '16px',
            border: `1px solid ${colors.slate200}`,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: colors.slate50, borderBottom: `1px solid ${colors.slate200}` }}>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: colors.slate500, letterSpacing: '0.05em' }}>Contact Details</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: colors.slate500, letterSpacing: '0.05em' }}>Message Log</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: colors.slate500, letterSpacing: '0.05em' }}>Status Lifecycle</th>
                  <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: colors.slate500, letterSpacing: '0.05em', textAlign: 'right' }}>System Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '14px' }}>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: colors.slate500, fontWeight: 500 }}>No record entries currently inside dashboard folder.</td>
                  </tr>
                ) : leads.map((lead, index) => {
                  const badge = getStatusStyles(lead.status);
                  return (
                    <tr 
                      key={lead.id} 
                      style={{ 
                        borderBottom: index === leads.length - 1 ? 'none' : `1px solid ${colors.slate100}`,
                        backgroundColor: colors.white,
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.slate50; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.white; }}
                    >
                      <td style={{ padding: '24px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ fontSize: '14px', color: colors.slate700 }}>
                            <span style={{ fontWeight: 500, color: colors.slate500 }}>Name: </span>
                            <span style={{ fontWeight: 700, color: colors.slate900, fontSize: '15px' }}>{lead.name}</span>
                          </div>
                          <div style={{ fontSize: '14px', color: colors.slate700 }}>
                            <span style={{ fontWeight: 500, color: colors.slate500 }}>Email: </span>
                            <span style={{ color: colors.emerald600, fontWeight: 500 }}>{lead.email}</span>
                          </div>
                          <div style={{ fontSize: '14px', color: colors.slate700 }}>
                            <span style={{ fontWeight: 500, color: colors.slate500 }}>Phone Number: </span>
                            <span style={{ color: colors.slate800, fontWeight: 600 }}>{lead.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '24px', maxWidth: isTablet ? '220px' : '380px', verticalAlign: 'top' }}>
                        <div 
                          style={{ 
                            color: colors.slate700, 
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            lineHeight: '1.5',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }} 
                          title={lead.message}
                        >
                          {lead.message || "—"}
                        </div>
                      </td>
                      <td style={{ padding: '24px', verticalAlign: 'top' }}>
                        <span style={{
                          backgroundColor: badge.bg,
                          color: badge.text,
                          padding: '6px 12px',
                          borderRadius: '50px',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '2px'
                        }}>
                          {badge.icon} {lead.status}
                        </span>
                      </td>
                      <td style={{ padding: '24px', textAlign: 'right', verticalAlign: 'top' }}>
                        <select 
                          value={lead.status} 
                          onChange={(e) => updateStatus(lead.id, e.target.value)} 
                          style={{
                            padding: '8px 12px',
                            border: `1px solid ${colors.slate200}`,
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            outline: 'none',
                            backgroundColor: colors.white,
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            marginTop: '2px'
                          }}
                        >
                          <option value="New Lead">New Lead</option>
                          <option value="Genuine">Genuine</option>
                          <option value="Spam">Spam</option>
                          <option value="Successful Conversion">Conversion</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}