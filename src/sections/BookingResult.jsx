import React from 'react';
import { CheckCircle2, CreditCard, Plane, CheckCircle, AlertTriangle, User } from 'lucide-react';
import { CHARGE_TYPES } from '../constants';

const BookingResult = ({ bookingFinal }) => {
  if (!bookingFinal) return null;

  const renderChargeRow = (sc) => {
    const isDiscount = sc.type === 1;
    const isIncluded = [2, 3, 16].includes(sc.type);
    const color = isDiscount ? '#e74c3c' : 'inherit';
    return (
      <tr key={sc.type + '-' + sc.amount + Math.random()} style={{ borderBottom: '1px solid #f0f0f0', color }}>
        <td style={{ padding: '6px 0' }}>
          {CHARGE_TYPES[sc.type] || 'Servicio'} <span style={{ opacity: 0.5, fontSize: '0.65rem' }}> ({sc.type})</span>
          {sc.type === 1 && <span style={{ color: '#e74c3c', fontSize: '0.6rem', fontWeight: 900 }}> RESTA</span>}
          {sc.type !== 0 && sc.type !== 1 && (
            isIncluded ? <span style={{ color: '#27ae60', fontSize: '0.6rem', fontWeight: 900, marginLeft: '4px' }}> INCLUIDO</span> : <span style={{ color: '#ff00ff', fontSize: '0.6rem', fontWeight: 900, marginLeft: '4px' }}> NO INCLUIDO</span>
          )}
        </td>
        <td style={{ textAlign: 'right', fontWeight: 600 }}>{isDiscount ? '-' : ''}{sc.amount.toLocaleString()}</td>
      </tr>
    );
  };

  let sum = 0;
  const paxCounts = Object.values(bookingFinal.passengers).reduce((acc, p) => {
    acc[p.passengerTypeCode] = (acc[p.passengerTypeCode] || 0) + 1;
    return acc;
  }, {});

  bookingFinal.journeys.forEach(j => j.segments.forEach(s => s.fares?.[0]?.passengerFares.forEach(pf => {
     const count = paxCounts[pf.passengerType] || 0;
     pf.serviceCharges.forEach(sc => {
       if (sc.type === 1) sum -= sc.amount * count; 
       else if (![2,3,16].includes(sc.type)) sum += sc.amount * count;
     });
  })));

  const balance = bookingFinal.breakdown.balanceDue || bookingFinal.breakdown.totalAmount;
  const isValid = Math.abs(sum - balance) < 0.01;

  return (
    <div style={{ marginTop: '3.5rem', animation: 'fadeIn 0.5s ease' }}>
      <div style={{ background: 'var(--jetsmart-navy)', color: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 15px 40px rgba(0,0,0,0.15)', marginBottom: '3rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
         <CheckCircle2 color="var(--jetsmart-yellow)" size={64} style={{ marginBottom: '1.5rem' }} />
         <h2 style={{ fontSize: '2.8rem', fontWeight: 950, marginBottom: '0.8rem' }}>¡RESERVA CONFIRMADA!</h2>
         <p style={{ opacity: 0.8, fontSize: '1.2rem', fontWeight: 700 }}>Localizador de Reserva (PNR)</p>
         <div style={{ fontSize: '5rem', fontWeight: 950, letterSpacing: '8px', textShadow: '0 5px 15px rgba(0,0,0,0.3)', color: 'var(--jetsmart-cyan)' }}>{bookingFinal.recordLocator}</div>
         <CreditCard style={{ position: 'absolute', right: '-30px', bottom: '-30px', opacity: 0.05 }} size={200} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
         <div className="card" style={{ background: 'var(--jetsmart-navy)', color: 'white', borderRadius: '20px', padding: '2rem' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 700 }}>TOTAL PAGADO</div>
            <div style={{ fontSize: '3.5rem', fontWeight: 950, color: 'var(--jetsmart-yellow)' }}>{balance.toLocaleString()} {bookingFinal.currencyCode}</div>
         </div>
         <div className="card" style={{ background: isValid ? '#f0f9f4' : '#fff5f5', border: `1px solid ${isValid ? '#27ae60' : '#e74c3c'}`, borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontWeight: 950, color: isValid ? '#27ae60' : '#e74c3c', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
              {isValid ? <CheckCircle size={28} /> : <AlertTriangle size={28} />} VERIFICACIÓN FINANCIERA: {isValid ? 'EXITOSA' : 'FALLIDA'}
            </div>
            <div style={{ fontSize: '1.2rem', marginTop: '12px' }}>Cálculo auditado: <b>{sum.toLocaleString()}</b> {bookingFinal.currencyCode}</div>
         </div>
      </div>

      <h3 className="section-title">DETALLES DEL ITINERARIO FINAL</h3>
      {bookingFinal.journeys.map((j, jIdx) => (
        <div key={jIdx} className="flight-card card" style={{ borderLeft: '12px solid var(--jetsmart-yellow)', marginBottom: '2rem', padding: 0 }}>
          <div style={{ background: '#fcfcfc', padding: '1.2rem 2rem', borderBottom: '1px solid #eee' }}>
             <b style={{ fontSize: '1.2rem', color: 'var(--jetsmart-navy)' }}>{jIdx === 0 ? 'IDA' : 'VUELTA'}: {j.designator.origin} → {j.designator.destination}</b>
          </div>
          {j.segments.map((seg, sIdx) => (
            <div key={sIdx} style={{ padding: '2rem', borderBottom: sIdx < j.segments.length-1 ? '1px dashed #eee' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--jetsmart-navy)', color: 'white', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '6px', fontWeight: 900 }}>TRAMO {sIdx + 1}</div>
                <Plane size={18} color="var(--jetsmart-yellow)" />
                <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>{seg.designator.origin} → {seg.designator.destination}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {Object.keys(seg.passengerSegment).map(pKey => {
                  const pI = bookingFinal.passengers[pKey];
                  const pF = seg.fares?.[0]?.passengerFares.find(f => f.passengerType === pI.passengerTypeCode);
                  const pS = seg.passengerSegment[pKey];
                  const pSub = pF?.serviceCharges.reduce((a,c) => [2,3,16].includes(c.type) ? a : (c.type === 1 ? a-c.amount : a+c.amount), 0) || 0;
                  return (
                    <div key={pKey} style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.6rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16} color="var(--jetsmart-navy)" /><b style={{ fontSize: '1rem' }}>{pI.names?.[0]?.first || 'Pax'} {pI.names?.[0]?.last || pKey}</b></div>
                        <b style={{ color: 'var(--jetsmart-navy)', fontSize: '1rem' }}>{pSub.toLocaleString()}</b>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.65rem', background: '#eee', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>{pI.passengerTypeCode === 'ADT' ? 'ADULTO' : pI.passengerTypeCode === 'CHD' ? 'NIÑO' : 'INFANTE'}</span>
                        {pS.ssrs?.map((s, idx) => (
                           <span key={idx} style={{ fontSize: '0.65rem', background: 'var(--jetsmart-cyan)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontWeight: 900 }}>{s.ssrCode}</span>
                        ))}
                      </div>
                      <table style={{ width: '100%', fontSize: '0.75rem' }}><tbody>{pF?.serviceCharges.map(sc => renderChargeRow(sc))}</tbody></table>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default BookingResult;
