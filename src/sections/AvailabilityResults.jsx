import React, { useState } from 'react';
import { Plane, ChevronDown, ChevronUp, Search, User } from 'lucide-react';
import JsonViewer from '../components/JsonViewer';
import { CHARGE_TYPES } from '../constants';

const AvailabilityResults = ({ searchResults, searchParams, apiSettings, selectedFares, onSelectFare }) => {
  const [showJson, setShowJson] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [webData, setWebData] = useState({});
  const [searchQueries, setSearchQueries] = useState({});

  const handleWebInputChange = (fareKey, field, value) => {
    setWebData(prev => ({
      ...prev,
      [fareKey]: {
        ...(prev[fareKey] || { basicFare: '', taxes: '', fees: '', total: '' }),
        [field]: value
      }
    }));
  };

  const calculateFareBreakdown = (fareDetails) => {
    let basic = 0;
    let taxes = 0;
    let fees = 0;

    if (!fareDetails || !fareDetails.fares) return { basic, taxes, fees, total: 0 };

    fareDetails.fares.forEach(seg => {
      // Usamos el primer tipo de pasajero (generalmente ADT) para la comparación base
      const pf = seg.passengerFares?.[0];
      if (pf && pf.serviceCharges) {
        pf.serviceCharges.forEach(sc => {
          const amount = sc.amount || 0;
          if (sc.type === 0) basic += amount;
          else if (sc.type === 1) basic -= amount; // Descuento resta de base
          else if ([3, 5].includes(sc.type)) taxes += amount;
          else fees += amount;
        });
      }
    });

    return { basic, taxes, fees, total: basic + taxes + fees };
  };

  const getComparisonData = () => {
    const listChunks = [];
    const tripResults = searchResults.results || (searchResults.journeys ? [{ trips: [{ journeysAvailableByMarket: { 'DIR': searchResults.journeys } }] }] : []);
    
    tripResults.forEach((result, tIdx) => {
       const chunk = {
         label: tIdx === 0 ? 'IDA' : 'VUELTA',
         rows: []
       };
       const tripInfo = result.trips?.[0];
       if (!tripInfo || !tripInfo.journeysAvailableByMarket) return;

       Object.values(tripInfo.journeysAvailableByMarket).forEach(journeys => {
          journeys.forEach(j => {
             const faresList = Array.isArray(j.fares) ? j.fares : (j.fares ? Object.keys(j.fares).map(k => ({ fareAvailabilityKey: k })) : []);
             
             faresList.forEach(fareItem => {
                const fKey = fareItem.fareAvailabilityKey;
                const fDetails = searchResults.faresAvailable?.[fKey] || j.fares?.[fKey];
                if (!fDetails) return;

                const breakdown = calculateFareBreakdown(fDetails);
                const segments = j.segments || fDetails.fares || [];
                const firstSeg = segments[0];
                const flightNum = (firstSeg?.identifier?.carrierCode || 'JA') + (firstSeg?.identifier?.identifier || '');
                const productClass = fDetails.fares?.[0]?.productClass || 'TS';

                chunk.rows.push({
                  key: fKey,
                  productClass,
                  flightNum,
                  origin: firstSeg?.designator?.origin,
                  destination: segments[segments.length - 1]?.designator?.destination,
                  api: breakdown,
                  web: webData[fKey] || { basicFare: '', taxes: '', fees: '', total: '' }
                });
             });
          });
       });
       if (chunk.rows.length > 0) listChunks.push(chunk);
    });
    return listChunks;
  };

  const downloadReport = (filteredData) => {
    let csv = "Tramo;Tarifas;Vuelo;Origen;Destino;API Basic Fare;API Taxes;API Fees;API Total;WEB Basic Fare;WEB Taxes;WEB Fees;WEB Total\n";
    
    filteredData.forEach(chunk => {
      chunk.rows.forEach(row => {
        csv += `${chunk.label};${row.productClass};${row.flightNum};${row.origin};${row.destination};${row.api.basic};${row.api.taxes};${row.api.fees};${row.api.total};`;
        csv += `${row.web.basicFare || 0};${row.web.taxes || 0};${row.web.fees || 0};${row.web.total || 0}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Comparativa_Tarifas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderChargeRow = (sc) => {
    const isDiscount = sc.type === 1;
    const isIncluded = [2, 3, 16].includes(sc.type);
    const amount = sc.amount || 0;
    return (
      <tr key={`${sc.type}-${amount}-${Math.random()}`} style={{ borderBottom: '1px solid #f0f0f0', color: isDiscount ? '#e74c3c' : 'inherit' }}>
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
        <td style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#888' }}>{sc.currencyCode || '-'}</td>
        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.9rem' }}>{isDiscount ? '-' : ''}{amount.toLocaleString()}</td>
      </tr>
    );
  };

  if (!searchResults) return null;

  const tripResults = searchResults.results || (searchResults.journeys ? [{ trips: [{ journeysAvailableByMarket: { 'DIR': searchResults.journeys } }] }] : []);

  const renderFaresForJourney = (journey, tripIndex) => {
    if (!journey) return null;
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
          <div style={{ background: 'white', padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: 'minmax(100px, 1fr) 3fr minmax(130px, 1fr)', alignItems: 'center', borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', justifyContent: 'flex-start' }}>
              <div onClick={(e) => { e.stopPropagation(); onSelectFare(tripIndex, fareKey, journey); }} className={`radio-option ${isSelected ? 'selected' : ''}`} style={{ margin: 0, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}>
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
                   if (sIdx === segments.length - 1) return null; // No hay escala después del último tramo
                   const nextSeg = segments[sIdx + 1];
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
                             <Plane size={24} color={isSelected ? 'var(--jetsmart-cyan)' : '#ccc'} fill={isSelected ? 'var(--jetsmart-cyan)' : 'none'} style={{ transform: 'rotate(0deg)' }} />
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
                    const paxSub = (pf.serviceCharges || []).reduce((sa, sc) => {
                      const amount = sc.amount || 0;
                      return [2,3,16].includes(sc.type) ? sa : (sc.type === 1 ? sa - amount : sa + amount);
                    }, 0);
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
                         {segments.map((seg, sIdx) => {
                           const fareSeg = fareDetails.fares?.[sIdx] || (sIdx === 0 ? fareDetails.fares?.[0] : null);
                           const pf = fareSeg?.passengerFares?.find(f => f.passengerType === pType);
                           
                           return (
                             <div key={sIdx} style={{ marginBottom: '1.5rem' }}>
                               <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--jetsmart-cyan)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <Plane size={12} /> TRAMO {sIdx + 1}: {seg.designator?.origin} → {seg.designator?.destination}
                                 {(!pf || !pf.serviceCharges) && sIdx > 0 && <span style={{ marginLeft: '10px', color: '#aaa', fontSize: '0.6rem' }}>(TASAS CONSOLIDADAS EN TRAMO 1)</span>}
                               </div>
                               
                               {pf && pf.serviceCharges && pf.serviceCharges.length > 0 ? (
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
                               ) : (
                                 sIdx === 0 || (fareSeg && pf) ? (
                                   <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '8px', fontSize: '0.7rem', color: '#999', textAlign: 'center' }}>
                                      No hay desglose de cargos por servicio disponible para este tramo.
                                   </div>
                                 ) : null
                               )}
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


  const comparisonChunks = getComparisonData();

  const filteredChunks = comparisonChunks.map(chunk => ({
    ...chunk,
    rows: chunk.rows.filter(row => {
      const q = (searchQueries[chunk.label] || '').toLowerCase();
      const rowText = `${row.productClass} ${row.flightNum} ${row.origin} ${row.destination} ${row.key}`.toLowerCase();
      return rowText.includes(q);
    })
  }));

  return (
    <section className="results-section" style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', borderBottom: '2px solid #eee', paddingBottom: '2px' }}>
        {['DESGLOSE TARIFAS', 'COMPARACIÓN TARIFAS'].map((label, idx) => (
          <button key={idx} onClick={() => setActiveTab(idx)} style={{ padding: '1rem 2.5rem', background: activeTab === idx ? 'var(--jetsmart-navy)' : 'transparent', color: activeTab === idx ? 'white' : '#777', border: 'none', borderRadius: '12px 12px 0 0', fontWeight: 900, cursor: 'pointer', transition: 'all 0.3s ease', fontSize: '0.9rem', position: 'relative', bottom: activeTab === idx ? '-2px' : '0' }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className="fade-in">
          {tripResults.map((result, tripIndex) => {
            const label = tripIndex === 0 ? 'Ida' : 'Vuelta';
            const tripInfo = result.trips?.[0];
            if (!tripInfo || !tripInfo.journeysAvailableByMarket) return null;
            return (
              <div key={tripIndex} style={{ marginBottom: '4rem' }}>
                 <h3 style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--jetsmart-navy)', borderLeft: '10px solid var(--jetsmart-cyan)', paddingLeft: '1.5rem', marginBottom: '2.5rem' }}>{label}</h3>
                 {Object.entries(tripInfo.journeysAvailableByMarket).map(([market, journeys]) => (
                    <div key={market}>{journeys.map(j => renderFaresForJourney(j, tripIndex))}</div>
                 ))}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 1 && (
        <div className="fade-in card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
             <h2 style={{ color: 'var(--jetsmart-navy)', fontWeight: 950, margin: 0 }}>Comparativa (Auditoría)</h2>
             <button className="primary" onClick={() => downloadReport(filteredChunks)} style={{ background: '#27ae60', padding: '0.8rem 2rem' }}>DESCARGAR EXCEL FILTRADO (.csv)</button>
          </div>
          
          {filteredChunks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
               <Search size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
               <p>No se encontraron vuelos disponibles.</p>
            </div>
          ) : (
            filteredChunks.map((chunk) => (
              <div key={chunk.label} style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ background: 'var(--jetsmart-cyan)', color: 'var(--jetsmart-navy)', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 950, fontSize: '1.1rem' }}>
                     TRAMO: {chunk.label}
                  </div>
                  <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
                     <Search size={18} color="#999" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                     <input 
                       type="text" 
                       placeholder={`Filtrar tabla ${chunk.label} por vuelo, fare key...`} 
                       value={searchQueries[chunk.label] || ''}
                       onChange={(e) => setSearchQueries(p => ({ ...p, [chunk.label]: e.target.value }))}
                       style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                     />
                  </div>
                </div>
                {chunk.rows.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', background: '#f9f9f9', borderRadius: '12px', color: '#999' }}>
                    No hay resultados que coincidan con la búsqueda en {chunk.label}.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="comparison-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                      <thead>
                        <tr>
                          <th rowSpan="2" style={{ border: '1px solid #ddd', padding: '12px', whiteSpace: 'nowrap' }}>Tarifa</th>
                          <th rowSpan="2" style={{ border: '1px solid #ddd', padding: '12px', whiteSpace: 'nowrap' }}>Vuelo</th>
                          <th rowSpan="2" style={{ border: '1px solid #ddd', padding: '12px', minWidth: '150px' }}>Fare Key</th>
                          <th colSpan="4" style={{ border: '1px solid #ddd', padding: '12px', background: '#f0faff' }}>API ({apiSettings.money})</th>
                          <th colSpan="4" style={{ border: '1px solid #ddd', padding: '12px', background: '#fffcf0' }}>WEB ({apiSettings.money})</th>
                        </tr>
                        <tr>
                          <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '0.75rem' }}>Basic</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '0.75rem' }}>Taxes</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '0.75rem' }}>Fees</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '0.75rem', fontWeight: 900 }}>Total</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '0.75rem' }}>Basic</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '0.75rem' }}>Taxes</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '0.75rem' }}>Fees</th>
                          <th style={{ border: '1px solid #ddd', padding: '8px', fontSize: '0.75rem', fontWeight: 900 }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chunk.rows.map((row, rIdx) => (
                          <tr key={row.key + rIdx}>
                            <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 900, color: 'var(--jetsmart-navy)' }}>{row.productClass}</td>
                            <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 700, color: '#666', fontSize: '0.85rem' }}>{row.flightNum} ({row.origin}-{row.destination})</td>
                            <td style={{ border: '1px solid #ddd', padding: '12px', fontSize: '0.65rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#888' }} title={row.key}>
                              {row.key}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '12px', whiteSpace: 'nowrap' }}>{row.api.basic.toLocaleString()}</td>
                            <td style={{ border: '1px solid #ddd', padding: '12px', whiteSpace: 'nowrap' }}>{row.api.taxes.toLocaleString()}</td>
                            <td style={{ border: '1px solid #ddd', padding: '12px', whiteSpace: 'nowrap' }}>{row.api.fees.toLocaleString()}</td>
                            <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 900, background: '#f9f9f9', whiteSpace: 'nowrap' }}>{row.api.total.toLocaleString()}</td>
                            {['basicFare', 'taxes', 'fees', 'total'].map(f => (
                              <td key={f} style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <input type="text" value={row.web[f]} onChange={(e) => handleWebInputChange(row.key, f, e.target.value)} placeholder="0" style={{ width: '100%', padding: '8px', border: '1px solid #eee', textAlign: 'center', fontSize: '0.85rem' }} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <div className="card" style={{ marginTop: '4rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowJson(!showJson)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Search size={22} color="var(--jetsmart-navy)" /><b style={{ fontSize: '1.1rem' }}>VER RESPUESTA JSON (API AUDIT)</b></div>
          {showJson ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {showJson && <div style={{ marginTop: '2rem' }}><JsonViewer src={searchResults} idPrefix="avail-json" /></div>}
      </div>
    </section>
  );
};

export default AvailabilityResults;
