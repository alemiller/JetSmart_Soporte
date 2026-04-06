import React from 'react';
import { RefreshCw, Settings, CheckCircle2, XCircle } from 'lucide-react';

const Header = ({ loading, onRefresh, onOpenSettings, token }) => (
  <header style={{ background: 'white', borderBottom: '3px solid var(--jetsmart-cyan)', padding: '0.8rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <img src="/resources/JetSmart_logo.png" alt="JetSmart" style={{ height: '100px', width: 'auto' }} />
        <span style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--jetsmart-navy)', letterSpacing: '5px', opacity: 0.8, marginTop: '20px' }}>API DEBUG</span>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '1rem', fontSize: '0.8rem', fontWeight: 900 }}>
           {token ? (
             <><CheckCircle2 size={16} color="#27ae60" /> <span style={{ color: '#27ae60' }}>TOKEN ACTIVO</span></>
           ) : (
             <><XCircle size={16} color="#e74c3c" /> <span style={{ color: '#e74c3c' }}>REQUERIDO</span></>
           )}
        </div>
        <button className="icon-btn-secondary" onClick={onRefresh} disabled={loading} title={token ? "Refrescar Token" : "Obtener Token"}>
          <RefreshCw size={20} className={loading ? 'spinning' : ''} />
        </button>
        <button onClick={onOpenSettings} className="icon-btn-secondary" title="Configuración">
          <Settings size={20} />
        </button>
      </div>
    </div>
  </header>
);

export default Header;
