import React from 'react';
import { CHARGE_TYPES } from '../constants';

const FareChargeTable = ({ passengerFare }) => {
  if (!passengerFare || !passengerFare.serviceCharges || passengerFare.serviceCharges.length === 0) {
    return (
      <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '8px', fontSize: '0.7rem', color: '#999', textAlign: 'center' }}>
        No hay desglose de cargos por servicio disponible para este tramo.
      </div>
    );
  }

  const renderChargeRow = (sc) => {
    const isDiscount = sc.type === 1;
    const isIncluded = [2, 3, 16].includes(sc.type);
    const amount = sc.amount || 0;
    
    return (
      <tr key={`${sc.type}-${amount}-${Math.random()}`} style={{ borderBottom: '1px solid #f0f0f0', color: isDiscount ? '#e74c3c' : 'inherit' }}>
        <td style={{ padding: '8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
               {sc.code && <code>{sc.code}:</code>}
               {CHARGE_TYPES[sc.type] || 'Servicio'}
             </span>
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

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ color: '#aaa', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #eee' }}>
          <th style={{ textAlign: 'left', paddingBottom: '8px' }}>Servicio</th>
          <th style={{ textAlign: 'center', paddingBottom: '8px' }}>Moneda</th>
          <th style={{ textAlign: 'right', paddingBottom: '8px' }}>Valor</th>
        </tr>
      </thead>
      <tbody>
        {passengerFare.serviceCharges.map(sc => renderChargeRow(sc))}
      </tbody>
    </table>
  );
};

export default FareChargeTable;
