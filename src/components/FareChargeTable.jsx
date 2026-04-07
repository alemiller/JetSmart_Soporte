import React from 'react';
import { CHARGE_TYPES } from '../constants';
import styles from './FareChargeTable.module.css';

const FareChargeTable = ({ passengerFare }) => {
  if (!passengerFare || !passengerFare.serviceCharges || passengerFare.serviceCharges.length === 0) {
    return <div className={styles.noCharges}>No hay desglose de cargos por servicio disponible para este tramo.</div>;
  }

  const renderChargeRow = (sc) => {
    const isDiscount = sc.type === 1;
    const isIncluded = [2, 3, 16].includes(sc.type);
    const amount = sc.amount || 0;
    
    return (
      <tr key={`${sc.type}-${amount}-${Math.random()}`} className={`${styles.chargeRow} ${isDiscount ? styles.subtraction : ''}`}>
        <td className={styles.cellLeft}>
          <div className={styles.chargeContent}>
             <span className={styles.serviceLabel}>
               {sc.code && <code>{sc.code}:</code>}
               {CHARGE_TYPES[sc.type] || 'Servicio'}
             </span>
             <span className={styles.typeBadge}>({sc.type})</span>
             {sc.type === 1 && <b className={`${styles.badge} ${styles.subtraction}`}>RESTA</b>}
             {sc.type !== 0 && sc.type !== 1 && (
               isIncluded ? 
               <b className={`${styles.badge} ${styles.included}`}>INCLUIDO</b> : 
               <b className={`${styles.badge} ${styles.notIncluded}`}>NO INCLUIDO</b>
             )}
          </div>
        </td>
        <td className={styles.currencyCell}>{sc.currencyCode || '-'}</td>
        <td className={styles.amountCell}>{isDiscount ? '-' : ''}{amount.toLocaleString()}</td>
      </tr>
    );
  };

  return (
    <table className={styles.tableContainer}>
      <thead>
        <tr className={styles.tableHeader}>
          <th className={`${styles.headerCell} ${styles.cellLeft}`}>Servicio</th>
          <th className={`${styles.headerCell} ${styles.cellCenter}`}>Moneda</th>
          <th className={`${styles.headerCell} ${styles.cellRight}`}>Valor</th>
        </tr>
      </thead>
      <tbody>
        {passengerFare.serviceCharges.map(sc => renderChargeRow(sc))}
      </tbody>
    </table>
  );
};

export default FareChargeTable;
