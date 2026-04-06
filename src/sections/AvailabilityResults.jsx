import React, { useState } from 'react';
import { Plane, ChevronDown, ChevronUp, Search, User } from 'lucide-react';
import JsonViewer from '../components/JsonViewer';
import { CHARGE_TYPES } from '../constants';

const AvailabilityResults = ({ searchResults, searchParams, apiSettings, selectedFares, onSelectFare }) => {
  const [showJson, setShowJson] = useState(false);

  const renderChargeRow = (sc) => {
    const isDiscount = sc.type === 1;
    const isIncluded = [2, 3, 16].includes(sc.type);
    return (
      <tr key={sc.type + '-' + sc.amount + Math.random()} style={{ borderBottom: '1px solid #f0f0f0', color: isDiscount ? '#e74c3c' : 'inherit' }}>
        <td style={{ padding: '8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{CHARGE_TYPES[sc.type] || 'Servicio'}</span>
             <span style={{ opacity: 0.4, fontSize: '0.65rem', fontWeight: 500 }}>({sc.type})</span>
             {sc.type === 1 && <b style={{ color: '#e74c3c', fontSize: '0.65rem' }}>RESTA</b>}
             {sc.type !== 0 && sc.type !== 1 && (
               isIncluded ? 
               <b style={{ color: '#27ae60', fontSize: '0.65rem' }}>INCLUIDO</b> : 
               <b style={{ color: '#ff00ff', fontSize: '0.65rem' }}>NO INCLUIDO</b>
             )}
          </div>
        </td>
        <td style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#888' }}>{sc.currencyCode}</td>
        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.9rem' }}>{isDiscount ? '-' : ''}{sc.amount.toLocaleString()}</td>
      </tr>
    );
  };

  if (!searchResults) return null;

  const trips = searchResults.results?.[0]?.trips || [];
  const journeysArray = Array.isArray(searchResults) ? searchResults : (searchResults.journeys || []);

  const renderFaresForJourney = (journey, tripIndex) => {
    const faresList = Array.isArray(journey.fares) ? journey.fares : (journey.fares ? Object.keys(journey.fares).map(k => ({ fareAvailabilityKey: k })) : []);
    
    return faresList.map((fareItem) => {
      const fareKey = fareItem.fareAvailabilityKey;
      const fareDetails = searchResults.faresAvailable?.[fareKey] || journey.fares?.[fareKey];
      if (!fareDetails) return null;

      const journeyId = journey.journeyKey || (journey.designator?.departure + '-' + journey.designator?.origin + '-' + journey.designator?.destination);
      const isSelected = selectedFares[tripIndex]?.fareKey === fareKey && selectedFares[tripIndex]?.uniqueId === journeyId;

      const segments = journey.segments || fareDetails.fares || [];
      const firstSeg = segments[0];
      const lastSeg = segments[segments.length - 1];
      if (!firstSeg || !lastSeg) return null;

      const carrier = firstSeg.identifier?.carrierCode || 'JA';
      const flightNum = firstSeg.identifier?.identifier || 'FLIGHT';
      const depDate = firstSeg.designator?.departure;
      const arrDate = lastSeg.designator?.arrival;

      return (
        <div key={fareKey + journeyId} className={`flight-card card ${isSelected ? 'selected' : ''}`} style={{ padding: 0, marginBottom: '1.5rem', border: isSelected ? '3px solid var(--jetsmart-cyan)' : '1px solid #ddd', background: 'white' }}>
          {/* Header del Fare */}
          <div style={{ background: 'white', padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: 'minmax(100px, 1fr) 3fr minmax(130px, 1fr)', alignItems: 'center', borderBottom: '1px solid #eee' }}>
            
            {/* Left: Radio + Product Class */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', justifyContent: 'flex-start' }}>
              <div 
                onClick={(e) => { e.stopPropagation(); onSelectFare(tripIndex, fareKey, journey); }}
                className={`radio-option ${isSelected ? 'selected' : ''}`}
                style={{ margin: 0, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}>
                <input type="radio" checked={isSelected} readOnly style={{ width: '24px', height: '24px', cursor: 'pointer' }} />
              </div>
              <div style={{ fontWeight: 950, color: 'var(--jetsmart-navy)', fontSize: '1.4rem' }}>{fareDetails.fares?.[0]?.productClass || 'TS'}</div>
            </div>
            
            {/* Center: Info Logística */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: '900px' }}>
                 {/* ORIGEN */}
                 <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', color: '#999', fontWeight: 900, textTransform: 'uppercase' }}>Origen</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 950, color: 'var(--jetsmart-navy)', lineHeight: 1 }}>{new Date(depDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--jetsmart-cyan)', fontWeight: 900 }}>{firstSeg.designator?.origin}</div>
                 </div>

                 {/* ESCALA (Solo si hay conexión) */}
                 {segments.length > 1 ? (
                   <>
                     <div style={{ height: '3px', background: isSelected ? 'var(--jetsmart-cyan)' : '#eee', flex: 0.5, borderRadius: '2px' }} />
                     <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: '0.65rem', color: '#999', fontWeight: 900, textTransform: 'uppercase' }}>Escala</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--jetsmart-navy)', lineHeight: 1 }}>{new Date(firstSeg.designator.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                        <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 900 }}>{firstSeg.designator.destination}</div>
                     </div>
                     <div style={{ textAlign: 'center', position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ height: '3px', background: isSelected ? 'var(--jetsmart-cyan)' : '#eee', width: '100%', borderRadius: '2px' }} />
                        <div style={{ position: 'absolute', background: 'white', padding: '0 8px' }}>
                           <Plane size={24} color={isSelected ? 'var(--jetsmart-cyan)' : '#ccc'} fill={isSelected ? 'var(--jetsmart-cyan)' : 'none'} style={{ transform: 'rotate(0deg)' }} />
                        </div>
                     </div>
                   </>
                 ) : (
                   /* Trayecto Directo (Un solo separador con avión) */
                   <div style={{ textAlign: 'center', position: 'relative', width: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ height: '3px', background: isSelected ? 'var(--jetsmart-cyan)' : '#eee', width: '100%', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', background: 'white', padding: '0 12px' }}>
                         <Plane size={24} color={isSelected ? 'var(--jetsmart-cyan)' : '#ccc'} fill={isSelected ? 'var(--jetsmart-cyan)' : 'none'} style={{ transform: 'rotate(0deg)' }} />
                      </div>
                   </div>
                 )}

                 {/* DESTINO */}
                 <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', color: '#999', fontWeight: 900, textTransform: 'uppercase' }}>Destino</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 950, color: 'var(--jetsmart-navy)', lineHeight: 1 }}>{new Date(arrDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--jetsmart-cyan)', fontWeight: 900 }}>{lastSeg.designator?.destination}</div>
                 </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 800, background: '#f8f9fa', padding: '4px 12px', borderRadius: '20px', border: '1px solid #eee', marginTop: '4px' }}>
                {segments.length} {segments.length > 1 ? 'TRAMOS' : 'TRAMO'}
              </div>
            </div>

            {/* Right: Price */}
            <div style={{ textAlign: 'right', fontSize: '2.4rem', fontWeight: 950, color: 'var(--jetsmart-navy)', lineHeight: 1 }}>
               {fareDetails.totals?.fareTotal?.toLocaleString() || '0'} <span style={{ fontSize: '1rem' }}>{apiSettings.money}</span>
            </div>
          </div>

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
                {['ADT', 'CHD', 'INFF'].filter(type => (searchParams.passengers[type] || 0) > 0).map((pType) => {
                  const totalForPaxType = (fareDetails.fares || []).reduce((acc, seg) => {
                    const pf = seg.passengerFares?.find(f => f.passengerType === pType);
                    if (!pf) return acc;
                    const paxSub = pf.serviceCharges.reduce((sa, sc) => [2,3,16].includes(sc.type) ? sa : (sc.type === 1 ? sa - sc.amount : sa + sc.amount), 0);
                    return acc + (paxSub * (searchParams.passengers[pType] || 0));
                  }, 0);
                  
                  return (
                    <div key={pType} style={{ background: 'white', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
                       <div style={{ background: 'var(--jetsmart-navy)', padding: '1rem 1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <User size={16} color="var(--jetsmart-cyan)" />
                            <b style={{ fontSize: '1rem', letterSpacing: '1px' }}>{pType === 'ADT' ? 'ADULTO' : pType === 'CHD' ? 'NIÑO' : 'INFANTE'} ({searchParams.passengers[pType]})</b>
                         </div>
                         <span style={{ fontWeight: 950, color: 'var(--jetsmart-cyan)', fontSize: '1.3rem' }}>{totalForPaxType.toLocaleString()} {apiSettings.money}</span>
                       </div>
                       
                       <div style={{ padding: '1.2rem' }}>
                         {(fareDetails.fares || []).map((segFare, sIdx) => {
                           const pf = segFare.passengerFares?.find(f => f.passengerType === pType);
                           if (!pf) return null;
                           return (
                             <div key={sIdx} style={{ marginBottom: '1.5rem' }}>
                               <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--jetsmart-cyan)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <Plane size={12} /> TRAMO {sIdx + 1}
                               </div>
                               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                 <thead>
                                    <tr style={{ color: '#aaa', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #eee' }}>
                                      <th style={{ textAlign: 'left', paddingBottom: '8px' }}>Servicio</th>
                                      <th style={{ textAlign: 'center', paddingBottom: '8px' }}>Moneda</th>
                                      <th style={{ textAlign: 'right', paddingBottom: '8px' }}>Valor</th>
                                    </tr>
                                 </thead>
                                 <tbody>{pf.serviceCharges.map(sc => renderChargeRow(sc))}</tbody>
                               </table>
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
    });
  };

  return (
    <section className="results-section" style={{ marginTop: '3rem' }}>
      {['IDA', 'VUELTA'].map((label, idx) => {
        const info = trips[idx] || (idx === 0 ? { journeysAvailableByMarket: { 'DIR': journeysArray } } : null);
        if (!info || !info.journeysAvailableByMarket) return null;

        return (
          <div key={label} style={{ marginBottom: '4rem' }}>
             <h3 style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--jetsmart-navy)', borderLeft: '10px solid var(--jetsmart-cyan)', paddingLeft: '1.5rem', marginBottom: '2.5rem' }}>{label}</h3>
             {Object.entries(info.journeysAvailableByMarket).map(([market, journeys]) => (
                <div key={market}>
                   {journeys.map(j => renderFaresForJourney(j, idx))}
                </div>
             ))}
          </div>
        );
      })}

      <div className="card" style={{ marginTop: '4rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowJson(!showJson)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Search size={22} color="var(--jetsmart-navy)" /><b style={{ fontSize: '1.1rem' }}>VER RESPUESTA JSON (API AUDIT)</b></div>
          {showJson ? <ChevronUp /> : <ChevronDown />}
        </div>
        {showJson && (
          <div style={{ marginTop: '2rem' }}>
            <JsonViewer src={searchResults} idPrefix="avail-json" />
          </div>
        )}
      </div>
    </section>
  );
};

export default AvailabilityResults;
