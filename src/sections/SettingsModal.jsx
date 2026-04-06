import React from 'react';
import { X } from 'lucide-react';

const SettingsModal = ({ show, onClose, settings, setSettings, onSave, loading }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ width: '850px', maxWidth: '95%', borderRadius: '24px', padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '3px solid #eee', paddingBottom: '1rem' }}>
          <b style={{ color: 'var(--jetsmart-navy)', fontSize: '1.5rem', fontWeight: 900 }}>Configuración de API JetSmart</b>
          <X onClick={onClose} style={{ cursor: 'pointer', opacity: 0.5 }} size={32} />
        </div>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="form-group">
            <label>Entorno (Base URL)</label>
            <select value={settings.url} onChange={e => setSettings(p => ({...p, url: e.target.value}))}>
              <option value="https://partners-cert.api.jetsmart.com">CERTIFICACIÓN (CERT)</option>
              <option value="https://partners-prod.api.jetsmart.com">PRODUCCIÓN (PROD)</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group"><label>Usuario</label><input type="text" value={settings.username} onChange={e => setSettings(p => ({...p, username: e.target.value}))} /></div>
            <div className="form-group">
              <label>Contraseña</label>
              {!settings.isCustomPassword ? (
                <select value={settings.password} onChange={e => e.target.value === "CUSTOM" ? setSettings(p => ({ ...p, isCustomPassword: true, password: '' })) : setSettings(p => ({ ...p, password: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  <option value="mBfzjCe!!3">mBfzjCe!!3</option>
                  <option value="HwLN8s@KXW">HwLN8s@KXW</option>
                  <option value="CUSTOM">Configurar Manualmente...</option>
                </select>
              ) : (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input type="password" value={settings.password} onChange={e => setSettings(p => ({ ...p, password: e.target.value }))} style={{ flex: 1 }} />
                  <button onClick={() => setSettings(p => ({ ...p, isCustomPassword: false, password: '' }))} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={18} /></button>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group"><label>Dominio</label><input type="text" value={settings.domain} onChange={e => setSettings(p => ({ ...p, domain: e.target.value }))} /></div>
            <div className="form-group"><label>Locación</label><input type="text" value={settings.location} onChange={e => setSettings(p => ({ ...p, location: e.target.value }))} /></div>
            <div className="form-group"><label>Canal</label><input type="text" value={settings.channelType} onChange={e => setSettings(p => ({ ...p, channelType: e.target.value }))} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group"><label>Moneda</label><input type="text" value={settings.money} onChange={e => setSettings(p => ({ ...p, money: e.target.value }))} /></div>
            <div className="form-group"><label>Org Code</label><input type="text" value={settings.orgCode} onChange={e => setSettings(p => ({ ...p, orgCode: e.target.value }))} /></div>
          </div>
          <button className="primary" disabled={loading} onClick={onSave} style={{ marginTop: '2rem', padding: '1.2rem', fontSize: '1.1rem' }}>
            {loading ? 'VALIDANDO CREDENCIALES...' : 'GUARDAR Y OBTENER TOKEN'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
