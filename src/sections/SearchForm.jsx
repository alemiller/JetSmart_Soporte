import React from 'react';
import { MapPin, Users } from 'lucide-react';
import CityDropdown from '../components/CityDropdown';

const SearchForm = ({ searchParams, setSearchParams, onSearch, loading }) => {
  const isFormInvalid = () => {
    const { origin, destination, departureDate, returnDate, tripType, passengers } = searchParams;
    const hasBaseData = origin && destination && departureDate && (passengers.ADT >= 1);
    
    if (tripType === 'OW') {
      return !hasBaseData;
    } else {
      return !(hasBaseData && returnDate);
    }
  };

  return (
    <section className="card" style={{ marginTop: '-2rem' }}>
      <form className="search-form" onSubmit={onSearch} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
        
        {/* Fila 1: Tipo de Viaje (2 columnas fijas 50/50, Alineado a la izquierda) */}
        <div className={`radio-option ${searchParams.tripType === 'OW' ? 'selected' : ''}`} 
          onClick={() => setSearchParams(p => ({ ...p, tripType: 'OW' }))}
          style={{ 
            justifyContent: 'flex-start', 
            padding: '1rem 1.5rem',
            background: searchParams.tripType === 'OW' ? 'rgba(0,175,236,0.1)' : 'white', 
            border: searchParams.tripType === 'OW' ? '2px solid var(--jetsmart-cyan)' : '2px solid #eee' 
          }}>
          <input type="radio" checked={searchParams.tripType === 'OW'} readOnly /> Solo ida
        </div>
        <div className={`radio-option ${searchParams.tripType === 'RT' ? 'selected' : ''}`} 
          onClick={() => setSearchParams(p => ({ ...p, tripType: 'RT' }))}
          style={{ 
            justifyContent: 'flex-start', 
            padding: '1rem 1.5rem',
            background: searchParams.tripType === 'RT' ? 'rgba(0,175,236,0.1)' : 'white', 
            border: searchParams.tripType === 'RT' ? '2px solid var(--jetsmart-cyan)' : '2px solid #eee' 
          }}>
          <input type="radio" checked={searchParams.tripType === 'RT'} readOnly /> Ida y vuelta
        </div>

        {/* Fila 2: Localizaciones (Izq) y Fechas (Der) con ancho fijo total */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', minWidth: 0 }}>
          <CityDropdown label="Origen" value={searchParams.origin} onChange={(v) => setSearchParams(p => ({ ...p, origin: v }))} placeholder="Origen" icon={MapPin} />
          <CityDropdown label="Destino" value={searchParams.destination} onChange={(v) => setSearchParams(p => ({ ...p, destination: v }))} placeholder="Destino" icon={MapPin} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', minWidth: 0 }}>
          <div className="form-group" style={{ width: '100%' }}>
            <label>Fecha Salida</label>
            <div className="date-input-wrapper" onClick={(e) => { const i = e.currentTarget.querySelector('input'); if(i.showPicker) i.showPicker(); else i.click(); }}>
              <input type="date" value={searchParams.departureDate} onChange={e => setSearchParams(p => ({ ...p, departureDate: e.target.value }))} style={{ paddingLeft: '1rem', width: '100%' }} />
            </div>
          </div>
          <div className="form-group" style={{ width: '100%', opacity: searchParams.tripType === 'OW' ? 0.4 : 1, pointerEvents: searchParams.tripType === 'OW' ? 'none' : 'auto' }}>
            <label>Fecha Regreso</label>
            <div className="date-input-wrapper" onClick={(e) => { const i = e.currentTarget.querySelector('input'); if(i.showPicker) i.showPicker(); else i.click(); }}>
              <input type="date" value={searchParams.returnDate} onChange={e => setSearchParams(p => ({ ...p, returnDate: e.target.value }))} style={{ paddingLeft: '1rem', width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Fila 3: Pasajeros (100% width) */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Pasajeros</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', background: '#f8f9fa', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eee' }}>
            <div className="pax-counter" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.7 }}><Users size={14} /><label style={{ margin: 0, fontSize: '0.75rem' }}>Adultos</label></div>
              <input type="number" min="0" value={searchParams.passengers.ADT} onChange={e=>setSearchParams(p=>({...p, passengers:{...p.passengers, ADT:parseInt(e.target.value) || 0}}))} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div className="pax-counter" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.7 }}><Users size={14} /><label style={{ margin: 0, fontSize: '0.75rem' }}>Niños</label></div>
              <input type="number" min="0" value={searchParams.passengers.CHD} onChange={e=>setSearchParams(p=>({...p, passengers:{...p.passengers, CHD:parseInt(e.target.value) || 0}}))} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div className="pax-counter" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.7 }}><Users size={14} /><label style={{ margin: 0, fontSize: '0.75rem' }}>Infantes</label></div>
              <input type="number" min="0" value={searchParams.passengers.INFF} onChange={e=>setSearchParams(p=>({...p, passengers:{...p.passengers, INFF:parseInt(e.target.value) || 0}}))} style={{ width: '100%', padding: '6px' }} />
            </div>
          </div>
        </div>

        <button type="submit" className="primary" disabled={loading || isFormInvalid()} style={{ gridColumn: '1 / -1', marginTop: '1rem', padding: '1.2rem', opacity: (loading || isFormInvalid()) ? 0.6 : 1 }}>
          {loading ? 'BUSCANDO...' : 'BUSCAR VUELOS DISPONIBLES'}
        </button>
      </form>
    </section>
  );
};

export default SearchForm;
