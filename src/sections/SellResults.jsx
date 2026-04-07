import React, { useState } from 'react';
import { Plane, ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, CreditCard } from 'lucide-react';
import JsonViewer from '../components/JsonViewer';
import { CHARGE_TYPES } from '../constants';

const SellResults = ({ sellResults, apiSettings }) => {
  const [showJson, setShowJson] = useState(false);
  const [jsonTab, setJsonTab] = useState('JSON');
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState([]);
  const [matchIdx, setMatchIdx] = useState(0);

  const renderChargeRow = (sc) => {
    const isDiscount = sc.type === 1;
    const isIncluded = [2, 3, 16].includes(sc.type);
    const color = isDiscount ? '#e74c3c' : 'inherit';
    return (
      <tr key={sc.type + '-' + sc.amount + Math.random()} style={{ borderBottom: '1px solid #f0f0f0', color }}>
        <td style={{ padding: '6px 0' }}>
          {sc.code && <code style={{ fontSize: '0.75rem', marginRight: '6px' }}>{sc.code}:</code>}
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

  if (!sellResults) return null;

  let sum = 0;
  const paxCounts = Object.values(sellResults.passengers).reduce((acc, p) => {
    acc[p.passengerTypeCode] = (acc[p.passengerTypeCode] || 0) + 1;
    return acc;
  }, {});

  sellResults.journeys.forEach(j => j.segments.forEach(s => s.fares[0].passengerFares.forEach(pf => {
     const count = paxCounts[pf.passengerType] || 0;
     pf.serviceCharges.forEach(sc => {
       if (sc.type === 1) sum -= sc.amount * count; 
       else if (![2,3,16].includes(sc.type)) sum += sc.amount * count;
     });
  })));

  const isValid = Math.abs(sum - sellResults.breakdown.balanceDue) < 0.01;

  return (
    <div className="sell-results-display" style={{ marginTop: '2rem' }}>
      <h3 className="section-title">DETALLES DE VENTA (SELL)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', marginBottom: '2.5rem' }}>
         <div className="card" style={{ background: 'var(--jetsmart-navy)', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ opacity: 0.8 }}>BALANCE DUE</div>
            <div style={{ fontSize: '3rem', fontWeight: 900 }}>{sellResults.breakdown.balanceDue.toLocaleString()} {apiSettings.money}</div>
            <CreditCard style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }} size={150} />
         </div>
         <div className="card" style={{ background: isValid ? '#f0f9f4' : '#fff5f5', border: `1px solid ${isValid ? '#27ae60' : '#e74c3c'}`, borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontWeight: 950, color: isValid ? '#27ae60' : '#e74c3c', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
              {isValid ? <CheckCircle size={22} /> : <AlertTriangle size={22} />} VERIFICACIÓN FINANCIERA: {isValid ? 'EXITOSA' : 'FALLIDA'}
            </div>
            <div style={{ fontSize: '1.1rem', marginTop: '10px' }}>Suma de cargos: <b>{sum.toLocaleString()}</b> {apiSettings.money}</div>
         </div>
      </div>

      {sellResults.journeys.map((j, jIdx) => (
        <div key={jIdx} className="flight-card card" style={{ borderLeft: '8px solid var(--jetsmart-cyan)', marginBottom: '1.5rem', padding: 0 }}>
          <div style={{ background: '#fcfcfc', padding: '1rem 1.5rem', borderBottom: '1px solid #eee' }}>
             <b style={{ color: 'var(--jetsmart-navy)' }}>{jIdx === 0 ? 'IDA' : 'VUELTA'}: {j.designator.origin} → {j.designator.destination}</b>
          </div>
          {j.segments.map((seg, sIdx) => (
            <div key={sIdx} style={{ padding: '1.5rem', borderBottom: sIdx < j.segments.length-1 ? '1px dashed #eee' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--jetsmart-navy)', color: 'white', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>TRAMO {sIdx + 1}</div>
                <Plane size={16} color="var(--jetsmart-cyan)" />
                <span style={{ fontWeight: 700 }}>{seg.designator.origin} → {seg.designator.destination}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {Object.keys(seg.passengerSegment).map(pKey => {
                  const pType = sellResults.passengers[pKey].passengerTypeCode;
                  const pF = seg.fares[0].passengerFares.find(f => f.passengerType === pType);
                  const pSub = pF?.serviceCharges.reduce((a,c) => [2,3,16].includes(c.type) ? a : (c.type === 1 ? a-c.amount : a+c.amount), 0) || 0;
                  return (
                    <div key={pKey} style={{ background: '#fafafa', padding: '1.2rem', borderRadius: '12px', border: '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.4rem' }}>
                        <b style={{ fontSize: '0.9rem' }}>{pType === 'ADT' ? 'ADULTO' : pType === 'CHD' ? 'NIÑO' : 'INFANTE'}</b>
                        <b style={{ color: 'var(--jetsmart-cyan)' }}>{pSub.toLocaleString()}</b>
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

      <div className="card" style={{ margin: '2rem 0' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowJson(!showJson)}>
            <b>JSON Sell results</b> {showJson ? <ChevronUp /> : <ChevronDown />}
         </div>
         {showJson && (
            <div style={{ marginTop: '1.5rem' }}>
               <div className="tabs-header" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <button className={`tab-btn ${jsonTab === 'JSON' ? 'active' : ''}`} onClick={() => setJsonTab('JSON')}>RAW</button>
                  <button className={`tab-btn ${jsonTab === 'VIEW' ? 'active' : ''}`} onClick={() => setJsonTab('VIEW')}>VIEW</button>
               </div>
               {jsonTab === 'JSON' ? (
                  <pre style={{ background: '#272822', color: '#f8f8f2', padding: '1.5rem', borderRadius: '12px', overflow: 'auto', maxHeight: '500px' }}>{JSON.stringify(sellResults, null, 2)}</pre>
               ) : (
                  <>
                    <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', background: '#f8f9fa', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }}>
                       <div style={{ position: 'relative', flex: 1 }}>
                          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                          <input type="text" placeholder="Buscar en Sell JSON..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setMatchIdx(0); }} style={{ width: '100%', paddingLeft: '40px', borderRadius: '25px', fontSize: '0.9rem', border: '1px solid #ddd' }} />
                       </div>
                       {matches.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #ddd', paddingLeft: '10px' }}>
                             <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{matchIdx + 1} / {matches.length}</span>
                             <button className="icon-btn-secondary" onClick={() => setMatchIdx(p => (p - 1 + matches.length) % matches.length)}><ChevronLeft size={16}/></button>
                             <button className="icon-btn-secondary" onClick={() => setMatchIdx(p => (p + 1) % matches.length)}><ChevronRight size={16}/></button>
                          </div>
                       )}
                    </div>
                    <JsonViewer src={sellResults} searchTerm={searchTerm} onMatchesFound={setMatches} currentMatchIndex={matchIdx} idPrefix="sell-json" />
                  </>
               )}
            </div>
         )}
      </div>
    </div>
  );
};

export default SellResults;
