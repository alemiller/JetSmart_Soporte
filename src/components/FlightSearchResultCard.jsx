import React from 'react';
import { Plane, User } from 'lucide-react';
import FareChargeTable from './FareChargeTable';
import styles from './FlightSearchResultCard.module.css';

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
    <div className={`${styles.cardContainer} ${isSelected ? styles.selected : ''}`}>
      {/* Header with times and prices */}
      <div className={styles.cardHeader}>
        <div className={styles.fareInfo}>
          <div onClick={(e) => { e.stopPropagation(); onSelect(tripIndex, fareKey, journey); }} className={`radio-option ${isSelected ? 'selected' : ''}`}>
            <input type="radio" checked={isSelected} readOnly className="radio-dot" />
          </div>
          <div className={styles.productClass}>{fareDetails.fares?.[0]?.productClass || 'TS'}</div>
        </div>

        <div className={styles.flightPath}>
          <div className={styles.segmentsList}>
             <div className={styles.station}>
                <div className={styles.label}>Origen</div>
                <div className={styles.time}>{depDate ? new Date(depDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}</div>
                <div className={styles.cityCode}>{firstSeg.designator?.origin || '-'}</div>
             </div>
             
             {segments.map((seg, sIdx) => {
               if (sIdx === segments.length - 1) return null;
               return (
                 <React.Fragment key={sIdx}>
                   <div className={`${styles.line} ${isSelected ? styles.lineSelected : ''}`} />
                   <div className={styles.scaleInfo}>
                      <div className={styles.label}>Escala</div>
                      <div className={styles.scaleTime}>{seg.designator?.arrival ? new Date(seg.designator.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}</div>
                      <div className={styles.scaleCity}>{seg.designator?.destination || '-'}</div>
                   </div>
                   <div className={styles.planeContainer}>
                      <div className={`${styles.fullLine} ${isSelected ? styles.lineSelected : ''}`} />
                      <div className={styles.planeIconWrapper}>
                         <Plane size={24} color={isSelected ? 'var(--jetsmart-cyan)' : '#ccc'} fill={isSelected ? 'var(--jetsmart-cyan)' : 'none'} />
                      </div>
                   </div>
                 </React.Fragment>
               );
             })}

             <div className={styles.station}>
                <div className={styles.label}>Destino</div>
                <div className={styles.time}>{arrDate ? new Date(arrDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}</div>
                <div className={styles.cityCode}>{lastSeg.designator?.destination || '-'}</div>
             </div>
          </div>
          <div className={styles.paxSummary}>
            {segments.length} {segments.length > 1 ? 'TRAMOS' : 'TRAMO'}
          </div>
        </div>

        <div className={styles.totalPrice}>
           {(fareDetails.totals?.fareTotal || 0).toLocaleString()} <span className={styles.currency}>{apiSettings.money}</span>
        </div>
      </div>

      {/* Details when expanded (selected) */}
      {isSelected && (
        <div className={styles.detailsArea}>
           <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div className={`${styles.infoBadge} ${styles.fareKeyBadge}`}>
                <span className={styles.badgeLabel}>FARE KEY:</span> <b>{fareKey}</b>
              </div>
              <div className={`${styles.infoBadge} ${styles.vueloBadge}`}>
                <span className={styles.badgeLabel}>VUELO:</span> <b>{carrier}{flightNum}</b>
              </div>
              <div className={`${styles.infoBadge} ${styles.claseBadge}`}>
                <span className={styles.badgeLabel}>CLASE:</span> <b>{fareDetails.fares?.[0]?.classOfService || 'T'}</b>
              </div>
           </div>

          <div className={styles.paxBreakdownGrid}>
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
                <div key={pType} className={styles.paxCard}>
                   <div className={styles.paxHeader}>
                     <div className={styles.paxTypeInfo}>
                        <User size={16} color="var(--jetsmart-cyan)" />
                        <b className={styles.paxTypeName}>{pType === 'ADT' ? 'ADULTO' : pType === 'CHD' ? 'NIÑO' : 'INFANTE'} ({paxCounts[pType]})</b>
                     </div>
                     <span className={styles.paxTotal}>{totalForPaxType.toLocaleString()} {apiSettings.money}</span>
                   </div>
                   <div className={styles.segBreakdown}>
                     {segments.map((seg, sIdx) => {
                       const fareSeg = fareDetails.fares?.[sIdx] || (sIdx === 0 ? fareDetails.fares?.[0] : null);
                       const pf = fareSeg?.passengerFares?.find(f => f.passengerType === pType);

                       return (
                         <div key={sIdx} style={{ marginBottom: '1.5rem' }}>
                           <div className={styles.segTitle}>
                             <Plane size={12} /> TRAMO {sIdx + 1}: {seg.designator?.origin} → {seg.designator?.destination}
                             {(!pf || !pf.serviceCharges) && sIdx > 0 && <span className={styles.consolidatedLabel}>(TASAS CONSOLIDADAS EN TRAMO 1)</span>}
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
