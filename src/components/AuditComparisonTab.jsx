import React, { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { downloadReport } from '../utils/fareUtils';

const AuditComparisonTab = ({ comparisonChunks, apiSettings, webData, onWebInputChange }) => {
  const [searchQueries, setSearchQueries] = useState({});

  const filteredChunks = comparisonChunks.map(chunk => ({
    ...chunk,
    rows: chunk.rows.filter(row => {
      const q = (searchQueries[chunk.label] || '').toLowerCase();
      const rowText = `${row.productClass} ${row.flightNum} ${row.origin} ${row.destination} ${row.key}`.toLowerCase();
      return rowText.includes(q);
    })
  }));

  const allVuelosDisponibles = filteredChunks.some(chunk => chunk.rows.length > 0);

  return (
    <div className="fade-in card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
         <h2 style={{ color: 'var(--jetsmart-navy)', fontWeight: 950, margin: 0 }}>Comparativa (Auditoría)</h2>
         <button className="primary" onClick={() => downloadReport(filteredChunks)} style={{ background: '#27ae60', padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
           <Download size={18} /> DESCARGAR EXCEL FILTRADO (.csv)
         </button>
      </div>
      
      {!allVuelosDisponibles ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
           <Search size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
           <p>No se encontraron vuelos disponibles o que coincidan con los filtros.</p>
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
                            <input 
                              type="text" 
                              value={row.web[f]} 
                              onChange={(e) => onWebInputChange(row.key, f, e.target.value)} 
                              placeholder="0" 
                              style={{ width: '100%', padding: '8px', border: '1px solid #eee', textAlign: 'center', fontSize: '0.85rem' }} 
                            />
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
  );
};

export default AuditComparisonTab;
