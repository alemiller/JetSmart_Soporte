import React, { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { downloadReport } from '../utils/fareUtils';
import styles from './AuditComparisonTab.module.css';

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
    <div className={`fade-in card ${styles.tabContainer}`}>
      <div className={styles.headerActions}>
         <h2 className={styles.tabTitle}>Comparativa (Auditoría)</h2>
         <button className={styles.downloadBtn} onClick={() => downloadReport(filteredChunks)}>
           <Download size={18} /> DESCARGAR EXCEL FILTRADO (.csv)
         </button>
      </div>
      
      {!allVuelosDisponibles ? (
        <div className={styles.emptyResults}>
           <Search size={48} className={styles.emptyIcon} />
           <p>No se encontraron vuelos disponibles o que coincidan con los filtros.</p>
        </div>
      ) : (
        filteredChunks.map((chunk) => (
          <div key={chunk.label} className={styles.segmentBlock}>
            <div className={styles.segmentHeader}>
              <div className={styles.segmentBadge}>
                 TRAMO: {chunk.label}
              </div>
              <div className={styles.searchWrapper}>
                 <Search size={18} color="#999" className={styles.searchIcon} />
                 <input 
                   type="text" 
                   placeholder={`Filtrar tabla ${chunk.label} por vuelo, fare key...`} 
                   value={searchQueries[chunk.label] || ''}
                   onChange={(e) => setSearchQueries(p => ({ ...p, [chunk.label]: e.target.value }))}
                   className={styles.searchInput}
                 />
              </div>
            </div>
            
            {chunk.rows.length === 0 ? (
              <div className={styles.emptyResults} style={{ background: '#f9f9f9', borderRadius: '12px' }}>
                No hay resultados que coincidan con la búsqueda en {chunk.label}.
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.auditTable}>
                  <thead>
                    <tr>
                      <th rowSpan="2">Tarifa</th>
                      <th rowSpan="2">Vuelo</th>
                      <th rowSpan="2" style={{ minWidth: '150px' }}>Fare Key</th>
                      <th colSpan="4" className={styles.headerApi}>API ({apiSettings.money})</th>
                      <th colSpan="4" className={styles.headerWeb}>WEB ({apiSettings.money})</th>
                    </tr>
                    <tr>
                      <th className={styles.subHeader}>Basic</th>
                      <th className={styles.subHeader}>Taxes</th>
                      <th className={styles.subHeader}>Fees</th>
                      <th className={`${styles.subHeader} ${styles.totalHeader}`}>Total</th>
                      <th className={styles.subHeader}>Basic</th>
                      <th className={styles.subHeader}>Taxes</th>
                      <th className={styles.subHeader}>Fees</th>
                      <th className={`${styles.subHeader} ${styles.totalHeader}`}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.rows.map((row, rIdx) => (
                      <tr key={row.key + rIdx}>
                        <td className={styles.fareCell}>{row.productClass}</td>
                        <td className={styles.flightCell}>{row.flightNum} ({row.origin}-{row.destination})</td>
                        <td className={styles.keyCell} title={row.key}>
                          {row.key}
                        </td>
                        <td>{row.api.basic.toLocaleString()}</td>
                        <td>{row.api.taxes.toLocaleString()}</td>
                        <td>{row.api.fees.toLocaleString()}</td>
                        <td className={styles.totalApiCell}>{row.api.total.toLocaleString()}</td>
                        {['basicFare', 'taxes', 'fees', 'total'].map(f => (
                          <td key={f}>
                            <input 
                              type="text" 
                              value={row.web[f]} 
                              onChange={(e) => onWebInputChange(row.key, f, e.target.value)} 
                              placeholder="0" 
                              className={styles.webInput}
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
