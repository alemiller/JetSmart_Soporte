import React, { useState } from 'react';
import Header from './sections/Header';
import SearchForm from './sections/SearchForm';
import AvailabilityResults from './sections/AvailabilityResults';
import SellResults from './sections/SellResults';
import PassengerForms from './sections/PassengerForms';
import AdditionalServices from './sections/AdditionalServices';
import BookingResult from './sections/BookingResult';
import SettingsModal from './sections/SettingsModal';
import { useBooking } from './hooks/useBooking';
import { CheckCircle2, RotateCcw, Search, ChevronDown, ChevronUp } from 'lucide-react';
import JsonViewer from './components/JsonViewer';

const App = () => {
  const {
    loading, error, searchParams, setSearchParams, apiSettings, setApiSettings,
    token, searchResults, sellResults, bookingFinal, passengerStatus,
    passengersData, setPassengersData, selectedFares, setSelectedFares, lastSellRequest,
    callToken, handleSearch, handleSell, handleCommit, handleReset, isSelectionComplete, 
    handleAddAllPassengers, handleSinglePassengerConfirm, handleSaveContact, getSsrAvailability, getSeatmaps,
    handleAssignSeat
  } = useBooking();

  const [showSettings, setShowSettings] = useState(false);
  const [showSellJson, setShowSellJson] = useState(false);
  
  // Scroll to top when error occurs
  React.useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  return (
    <div className="app">
      <Header 
        loading={loading} 
        onRefresh={callToken} 
        onOpenSettings={() => setShowSettings(true)} 
        token={token}
      />

      <main className="container">
        {error && (
          <div className="alert-error" style={{ background: '#fff5f5', color: '#c53030', padding: '1.2rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #feb2b2', fontWeight: 600 }}>
            <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>⚠️ ERROR EN LA SOLICITUD:</div>
            <pre style={{ margin: 0, fontSize: '0.8rem', whiteSpace: 'pre-wrap', overflowX: 'auto', background: 'rgba(0,0,0,0.05)', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', color: '#822727' }}>
              {error}
            </pre>
          </div>
        )}
        
        <SearchForm 
          searchParams={searchParams} 
          setSearchParams={setSearchParams} 
          onSearch={handleSearch} 
          loading={loading} 
        />

        <AvailabilityResults 
          searchResults={searchResults} 
          searchParams={searchParams}
          apiSettings={apiSettings}
          selectedFares={selectedFares}
          onSelectFare={(idx, key, data) => {
            const uniqueId = data.journeyKey || (data.designator?.departure + '-' + data.designator?.origin + '-' + data.designator?.destination);
            setSelectedFares(p => ({...p, [idx]: {fareKey: key, fareData: data, uniqueId}}));
          }}
        />

        {isSelectionComplete() && (
           <div className="card" style={{ background: 'var(--jetsmart-navy)', color: 'white', display: 'flex', justifyContent: 'space-between', padding: '2rem', marginTop: '3rem', alignItems: 'center', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {sellResults ? <CheckCircle2 color="#27ae60" size={40} /> : <div style={{ width: 14, height: 14, background: 'var(--jetsmart-yellow)', borderRadius: '50%' }} />}
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>PASO 4: SELL (Venta Temporal)</h3>
              </div>
              {lastSellRequest ? (
                <button className="secondary" onClick={handleReset} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', background: 'transparent', padding: '0.8rem 2rem', cursor: 'pointer' }}>
                  <RotateCcw size={18} style={{ marginRight: '8px' }}/> REFRESH SESSION
                </button>
              ) : (
                <button className="primary" onClick={handleSell} disabled={loading} style={{ padding: '1rem 3rem', fontSize: '1.1rem', cursor: 'pointer' }}>
                  {loading ? 'Solicitando...' : 'SOLICITAR VENTA (SELL)'}
                </button>
              )}
           </div>
        )}

        {lastSellRequest && (
          <div className="card" style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowSellJson(!showSellJson)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Search size={22} color="var(--jetsmart-navy)" />
                <b style={{ fontSize: '1.1rem' }}>VER PETICIÓN (RQ) SELL AUDIT</b>
              </div>
              {showSellJson ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {showSellJson && (
              <div style={{ marginTop: '2rem' }}>
                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>Esta es la estructura exacta enviada a <code>/nsk/v4/trip/sell</code>:</p>
                <JsonViewer src={lastSellRequest} idPrefix="sell-rq-json" />
              </div>
            )}
          </div>
        )}

        <SellResults 
          sellResults={sellResults} 
          apiSettings={apiSettings} 
        />

        <PassengerForms 
          sellResults={sellResults}
          passengersData={passengersData}
          setPassengersData={setPassengersData}
          passengerStatus={passengerStatus}
          onAddPassenger={(key) => handleSinglePassengerConfirm(key, token)}
          onAddAll={handleAddAllPassengers}
          onCommit={handleCommit}
          committing={loading}
        />

        {sellResults && (
           <AdditionalServices 
             sellResults={sellResults}
             apiSettings={apiSettings}
             onSaveContact={handleSaveContact}
             onGetSsrAvailability={getSsrAvailability}
             onGetSeatmaps={getSeatmaps}
             onAssignSeat={handleAssignSeat}
           />
        )}

        {sellResults && (
           <div className="card" style={{ marginTop: '3rem', background: '#f8f9fa', padding: '3rem', textAlign: 'center', borderRadius: '30px', border: '2px solid var(--jetsmart-navy)' }}>
              <h2 style={{ color: 'var(--jetsmart-navy)', fontWeight: 950, marginBottom: '1.5rem' }}>BLOQUE FINAL: CERRAR RESERVA</h2>
              <p style={{ color: '#666', marginBottom: '2rem' }}>Una vez completados los pasos anteriores, puedes proceder a confirmar la reserva definitiva en NAPI.</p>
              <button 
                className="primary" 
                onClick={handleCommit} 
                disabled={loading} 
                style={{ padding: '1.5rem 5rem', fontSize: '1.4rem', boxShadow: '0 10px 25px rgba(0,175,236,0.3)' }}
              >
                {loading ? 'Confirmando...' : 'CONFIRMAR Y CERRAR RESERVA (COMMIT)'}
              </button>
           </div>
        )}

        <BookingResult bookingFinal={bookingFinal} />
      </main>

      <SettingsModal 
        show={showSettings} 
        onClose={() => setShowSettings(false)}
        settings={apiSettings}
        setSettings={setApiSettings}
        onSave={() => { callToken(); setShowSettings(false); }}
        loading={loading}
      />
    </div>
  );
};

export default App;
