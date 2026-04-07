import React from 'react';
import { User, CheckCircle2 } from 'lucide-react';

const PassengerForms = ({ sellResults, passengersData, setPassengersData, passengerStatus, onAddPassenger, onAddAll, committing, onCommit }) => {
  if (!sellResults) return null;

  return (
    <section className="pax-docs" style={{ marginTop: '3rem' }}>
      <h2 className="section-title">DOCUMENTACIÓN DE PASAJEROS <span style={{ color: 'var(--jetsmart-cyan)' }}>PASO 5</span></h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {Object.entries(sellResults.passengers).map(([key, p]) => {
          const pD = passengersData[key] || {};
          const status = passengerStatus[key]?.status;
          const isSuccess = status === 'success';
          const isError = status === 'error';
          
          return (
            <div 
              key={key} 
              className={`card ${isSuccess ? 'success' : ''}`} 
              style={{ 
                borderTop: `6px solid ${isSuccess ? '#27ae60' : (isError ? '#e74c3c' : 'var(--jetsmart-navy)')}`, 
                position: 'relative',
                transition: 'border-color 0.3s ease'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <User size={24} color={status === 'success' ? '#27ae60' : 'var(--jetsmart-cyan)'} />
                  <b style={{ color: 'var(--jetsmart-navy)', fontSize: '1.1rem' }}>{p.passengerTypeCode} - {key}</b>
                </div>
                {status === 'success' && <CheckCircle2 color="#27ae60" size={24} />}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label>Título</label><select value={pD.title} onChange={e=>setPassengersData(p=>({...p, [key]:{...p[key], title:e.target.value}}))}><option value="Mr">Sr.</option><option value="Ms">Sra.</option><option value="Miss">Srta.</option><option value="Mstr">Niño</option></select></div>
                <div className="form-group"><label>Género</label><select value={pD.gender} onChange={e=>setPassengersData(p=>({...p, [key]:{...p[key], gender:e.target.value}}))}><option value="Male">Masculino</option><option value="Female">Femenino</option><option value="Other">Otro</option></select></div>
                <div className="form-group"><label>Nombre</label><input value={pD.firstName} onChange={e=>setPassengersData(p=>({...p, [key]:{...p[key], firstName:e.target.value}}))} /></div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Apellido</label><input value={pD.lastName} onChange={e=>setPassengersData(p=>({...p, [key]:{...p[key], lastName:e.target.value}}))} /></div>
                <div className="form-group"><label>Nacionalidad</label><select value={pD.nationality} onChange={e=>setPassengersData(p=>({...p, [key]:{...p[key], nationality:e.target.value}}))}><option value="AR">Argentina</option><option value="CL">Chile</option><option value="PE">Perú</option><option value="CO">Colombia</option></select></div>
                <div className="form-group"><label>Fecha Nacimiento</label><input type="date" value={pD.dob} onChange={e=>setPassengersData(p=>({...p, [key]:{...p[key], dob:e.target.value}}))} /></div>
              </div>

              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                 <button 
                   className="primary" 
                   onClick={() => onAddPassenger(key)}
                   disabled={status === 'success' || status === 'loading'}
                   style={{ 
                     padding: '0.6rem 1.5rem', 
                     fontSize: '0.8rem', 
                     borderRadius: '8px',
                     background: status === 'success' ? '#27ae60' : 'var(--jetsmart-navy)',
                     cursor: status === 'success' ? 'default' : 'pointer'
                   }}>
                   {status === 'loading' ? 'AGREGANDO...' : status === 'success' ? 'PASAJERO AGREGADO' : 'AGREGAR PASAJERO'}
                 </button>
                 {passengerStatus[key]?.message && status === 'error' && (
                   <div style={{ color: '#e74c3c', fontSize: '0.7rem', marginTop: '5px', maxWidth: '300px', marginLeft: 'auto', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {passengerStatus[key].message}
                   </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
         <button className="primary" onClick={onAddAll} disabled={Object.values(passengerStatus).some(s => s.status === 'success')} style={{ padding: '1.2rem 4rem', opacity: Object.values(passengerStatus).some(s => s.status === 'success') ? 0.5 : 1 }}>
            AGREGAR TODOS LOS PASAJEROS (PASO 5)
         </button>
      </div>

      {Object.keys(passengerStatus).length === Object.keys(sellResults.passengers).length && Object.values(passengerStatus).every(s => s.status === 'success') && (
         <div style={{ marginTop: '5rem', padding: '4rem', border: '8px solid var(--jetsmart-yellow)', textAlign: 'center', borderRadius: '32px', background: 'rgba(255,243,205,0.1)' }}>
            <h2 style={{ color: 'var(--jetsmart-navy)', fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem' }}>CERRAR RESERVA <span style={{ color: 'var(--jetsmart-cyan)' }}>PASO 9</span></h2>
            <button className="primary" onClick={onCommit} disabled={committing} style={{ padding: '1.5rem 6rem', fontSize: '1.8rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
              {committing ? 'GENERANDO LOCALIZADOR...' : 'COMMIT 1 (CREAR PNR)'}
            </button>
         </div>
      )}
    </section>
  );
};

export default PassengerForms;
