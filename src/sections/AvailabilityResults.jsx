import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import JsonViewer from '../components/JsonViewer';
import FlightSearchResultCard from '../components/FlightSearchResultCard';
import AuditComparisonTab from '../components/AuditComparisonTab';
import { calculateFareBreakdown } from '../utils/fareUtils';

const AvailabilityResults = ({ searchResults, searchParams, apiSettings, selectedFares, onSelectFare }) => {
  const [showJson, setShowJson] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [webData, setWebData] = useState({});

  const handleWebInputChange = (fareKey, field, value) => {
    setWebData(prev => ({
      ...prev,
      [fareKey]: {
        ...(prev[fareKey] || { basicFare: '', taxes: '', fees: '', total: '' }),
        [field]: value
      }
    }));
  };

  const getComparisonData = useMemo(() => {
    if (!searchResults) return [];
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

                chunk.rows.push({
                  key: fKey,
                  productClass: fDetails.fares?.[0]?.productClass || 'TS',
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
  }, [searchResults, webData]);

  if (!searchResults) return null;

  const tripResults = searchResults.results || (searchResults.journeys ? [{ trips: [{ journeysAvailableByMarket: { 'DIR': searchResults.journeys } }] }] : []);

  return (
    <section className="results-section" style={{ marginTop: '3rem' }}>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', borderBottom: '2px solid #eee', paddingBottom: '2px' }}>
        {['DESGLOSE TARIFAS', 'COMPARACIÓN TARIFAS'].map((label, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveTab(idx)} 
            style={{ 
              padding: '1rem 2.5rem', 
              background: activeTab === idx ? 'var(--jetsmart-navy)' : 'transparent', 
              color: activeTab === idx ? 'white' : '#777', 
              border: 'none', 
              borderRadius: '12px 12px 0 0', 
              fontWeight: 900, 
              cursor: 'pointer', 
              transition: 'all 0.3s ease', 
              fontSize: '0.9rem', 
              position: 'relative', 
              bottom: activeTab === idx ? '-2px' : '0' 
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab 0: Fare Breakdown Search Results */}
      {activeTab === 0 && (
        <div className="fade-in">
          {tripResults.map((result, tripIndex) => {
            const label = tripIndex === 0 ? 'Ida' : 'Vuelta';
            const tripInfo = result.trips?.[0];
            if (!tripInfo || !tripInfo.journeysAvailableByMarket) return null;
            
            return (
              <div key={tripIndex} style={{ marginBottom: '4rem' }}>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--jetsmart-navy)', borderLeft: '10px solid var(--jetsmart-cyan)', paddingLeft: '1.5rem', marginBottom: '2.5rem' }}>
                  {label}
                </h3>
                {Object.entries(tripInfo.journeysAvailableByMarket).map(([market, journeys]) => (
                  <div key={market}>
                    {journeys.map(j => {
                      const faresList = Array.isArray(j.fares) ? j.fares : (j.fares ? Object.keys(j.fares).map(k => ({ fareAvailabilityKey: k })) : []);
                      return faresList.map(fareItem => {
                        const fareKey = fareItem.fareAvailabilityKey;
                        const journeyId = j.journeyKey || (j.designator?.departure + '-' + j.designator?.origin + '-' + j.designator?.destination);
                        const isSelected = selectedFares[tripIndex]?.fareKey === fareKey && selectedFares[tripIndex]?.uniqueId === journeyId;
                        
                        return (
                          <FlightSearchResultCard 
                            key={fareKey + journeyId}
                            journey={j}
                            fareKey={fareKey}
                            fareDetails={searchResults.faresAvailable?.[fareKey] || j.fares?.[fareKey]}
                            tripIndex={tripIndex}
                            isSelected={isSelected}
                            onSelect={onSelectFare}
                            paxCounts={searchParams.passengers}
                            apiSettings={apiSettings}
                          />
                        );
                      });
                    })}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 1: Audit Comparison */}
      {activeTab === 1 && (
        <AuditComparisonTab 
          comparisonChunks={getComparisonData}
          apiSettings={apiSettings}
          webData={webData}
          onWebInputChange={handleWebInputChange}
        />
      )}

      {/* JSON Audit Section */}
      <div className="card" style={{ marginTop: '4rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowJson(!showJson)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Search size={22} color="var(--jetsmart-navy)" />
            <b style={{ fontSize: '1.1rem' }}>VER RESPUESTA JSON (API AUDIT)</b>
          </div>
          {showJson ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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
