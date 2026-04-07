import React from 'react';
import { Plane, User } from 'lucide-react';
import FareChargeTable from './FareChargeTable';

const FlightSearchResultCard = ({ 
  journey, 
  fareKey, 
  fareDetails, 
  tripIndex, 
  isSelected, 
  onSelect,
  paxCounts,
  apiSettings
}) => {
  if (!fareDetails) return null;

  const journeyId = journey.journeyKey || (journey.designator?.departure + '-' + journey.designator?.origin + '-' + journey.designator?.destination);
  const segments = journey.segments || fareDetails.fares || [];
  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];
  if (!firstSeg || !lastSeg) return null;

  const carrier = firstSeg.identifier?.carrierCode || 'JA';
  const flightNum = firstSeg.identifier?.identifier || 'FLIGHT';
  const depDate = firstSeg.designator?.departure;
  const arrDate = lastSeg.designator?.arrival;

  return (
    <div className={`flight-card card ${isSelected ? 'selected' : ''}`} style={{ padding: 0, marginBottom: '1.5rem', border: isSelected ? '3px solid var(--jetsmart-cyan)' : '1px solid #ddd', background: 'white' }}>
      {/* Header with times and prices */}
      <div style={{ background: 'white', padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: 'minmax(100px, 1fr) 3fr minmax(130px, 1fr)', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', justifyContent: 'flex-start' }}>
          <div onClick={(e) => { e.stopPropagation(); onSelect(tripIndex, fareKey, journey); }} className={`radio-option ${isSelected ? 'selected' : ''}`} style={{ margin: 0, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}>
            <input type="radio" checked={isSelected} readOnly style={{ width: '24px', height: '24px', cursor: 'pointer' }} />
          </div>
          <div style={{ fontWeight: 950, color: 'var(--jetsmart-navy)', fontSize: '1.4rem' }}>{fareDetails.fares?.[0]?.productClass || 'TS'}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: '900px' }}>
             <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '0.65rem', color: '#999', fontWeight: 900, textTransform: 'uppercase' }}>Origen</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 950, color: 'var(--jetsmart-navy)', lineHeight: 1 }}>{depDate ? new Date(depDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--jetsmart-cyan)', fontWeight: 900 }}>{firstSeg.designator?.origin || '-'}</div>
             </div>
             
             {segments.map((seg, sIdx) => {
               if (sIdx === segments.length - 1) return null;
               return (
                 <React.Fragment key={sIdx}>
                   <div style={{ height: '3px', background: isSelected ? 'var(--jetsmart-cyan)' : '#eee', flex: 0.5, borderRadius: '2px' }} />
                   <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '0.65rem', color: '#999', fontWeight: 900, textTransform: 'uppercase' }}>Escala</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--jetsmart-navy)', lineHeight: 1 }}>{seg.designator?.arrival ? new Date(seg.designator.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 900 }}>{seg.designator?.destination || '-'}</div>
                   </div>
                   <div style={{ textAlign: 'center', position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ height: '3px', background: isSelected ? 'var(--jetsmart-cyan)' : '#eee', width: '100%', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', background: 'white', padding: '0 8px' }}>
                         <Plane size={24} color={isSelected ? 'var(--jetsmart-cyan)' : '#ccc'} fill={isSelected ? 'var(--jetsmart-cyan)' : 'none'} />
                      </div>
                   </div>
                 </React.Fragment>
               );
             })}

             <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '0.65rem', color: '#999', fontWeight: 900, textTransform: 'uppercase' }}>Destino</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 950, color: 'var(--jetsmart-navy)', lineHeight: 1 }}>{arrDate ? new Date(arrDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--jetsmart-cyan)', fontWeight: 900 }}>{lastSeg.designator?.destination || '-'}</div>
             </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 800, background: '#f8f9fa', padding: '4px 12px', borderRadius: '20px', border: '1px solid #eee', marginTop: '4px' }}>
            {segments.length} {segments.length > 1 ? 'TRAMOS' : 'TRAMO'}
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: '2.4rem', fontWeight: 950, color: 'var(--jetsmart-navy)', lineHeight: 1 }}>
           {(fareDetails.totals?.fareTotal || 0).toLocaleString()} <span style={{ fontSize: '1rem' }}>{apiSettings.money}</span>
        </div>
      </div>

      {/* Details when expanded (selected) */}
      {isSelected && (
        <div style={{ padding: '1.5rem', background: '#fafafa' }}>
           <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ background: '#fff9e6', padding: '10px 15px', borderRadius: '8px', border: '1px solid #ffeeba', fontSize: '0.75rem', color: '#856404' }}>
                <span style={{ opacity: 0.5, fontWeight: 900, marginRight: '6px' }}>FARE KEY:</span> <b>{fareKey}</b>
              </div>
              <div style={{ background: 'white', padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.75rem', color: '#555' }}>
                <span style={{ opacity: 0.5, fontWeight: 900, marginRight: '6px' }}>VUELO:</span> <b>{carrier}{flightNum}</b>
              </div>
              <div style={{ background: 'white', padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.75rem', color: 'var(--jetsmart-navy)' }}>
                <span style={{ opacity: 0.5, fontWeight: 900, marginRight: '6px' }}>CLASE:</span> <b>{fareDetails.fares?.[0]?.classOfService || 'T'}</b>
              </div>
           </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
            {['ADT', 'CHD', 'INFF'].filter(type => (paxCounts[type] || 0) > 0).map((pType) => {
              const totalForPaxType = (fareDetails.fares || []).reduce((acc, seg) => {
                const pf = seg.passengerFares?.find(f => f.passengerType === pType);
                if (!pf) return acc;
                const paxSub = (pf.serviceCharges || []).reduce((sa, sc) => {
                  const amount = sc.amount || 0;
                  return [2,3,16].includes(sc.type) ? sa : (sc.type === 1 ? sa - amount : sa + amount);
                }, 0);
                return acc + (paxSub * (paxCounts[pType] || 0));
              }, 0);

              return (
                <div key={pType} style={{ background: 'white', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
                   <div style={{ background: 'var(--jetsmart-navy)', padding: '1rem 1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={16} color="var(--jetsmart-cyan)" />
                        <b style={{ fontSize: '1rem', letterSpacing: '1px' }}>{pType === 'ADT' ? 'ADULTO' : pType === 'CHD' ? 'NIÑO' : 'INFANTE'} ({paxCounts[pType]})</b>
                     </div>
                     <span style={{ fontWeight: 950, color: 'var(--jetsmart-cyan)', fontSize: '1.3rem' }}>{totalForPaxType.toLocaleString()} {apiSettings.money}</span>
                   </div>
                   <div style={{ padding: '1.2rem' }}>
                     {segments.map((seg, sIdx) => {
                       const fareSeg = fareDetails.fares?.[sIdx] || (sIdx === 0 ? fareDetails.fares?.[0] : null);
                       const pf = fareSeg?.passengerFares?.find(f => f.passengerType === pType);

                       return (
                         <div key={sIdx} style={{ marginBottom: '1.5rem' }}>
                           <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--jetsmart-cyan)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <Plane size={12} /> TRAMO {sIdx + 1}: {seg.designator?.origin} → {seg.designator?.destination}
                             {(!pf || !pf.serviceCharges) && sIdx > 0 && <span style={{ marginLeft: '10px', color: '#aaa', fontSize: '0.6rem' }}>(TASAS CONSOLIDADAS EN TRAMO 1)</span>}
                           </div>
                           <FareChargeTable passengerFare={pf} />
                         </div>
                       );
                     })}
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightSearchResultCard;
