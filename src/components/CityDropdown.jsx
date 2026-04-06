import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { CITIES } from '../constants';

const CityDropdown = ({ label, value, onChange, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  
  const selectedCity = CITIES.find(c => c.code === value);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filtered = CITIES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase()) || 
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="form-group" ref={containerRef} style={{ position: 'relative', minWidth: 0, width: '100%' }}>
      <label>{label}</label>
      <div className="custom-select-trigger" onClick={() => setIsOpen(!isOpen)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', overflow: 'hidden' }}>
        <Icon size={18} color="var(--jetsmart-navy)" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {selectedCity ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', minWidth: 0 }}>
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedCity.name}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.6, marginLeft: '5px', flexShrink: 0 }}>{selectedCity.code}</span>
            </div>
          ) : (
            <span className="placeholder-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{placeholder}</span>
          )}
        </div>
        <ChevronDown size={14} color="#666" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </div>
      
      {isOpen && (
        <div className="custom-dropdown-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, background: 'white', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', marginTop: '5px', maxHeight: '300px', overflowY: 'auto' }}>
          <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
            <input 
              autoFocus 
              type="text" 
              placeholder="Buscar por ciudad o país..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              onClick={(e) => e.stopPropagation()} 
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }}
            />
          </div>
          {filtered.length > 0 ? filtered.map(c => (
            <div 
              key={c.code} 
              className="dropdown-item" 
              onClick={() => { onChange(c.code); setIsOpen(false); setSearch(''); }} 
              style={{ padding: '10px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8f9fa' }}
            >
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--jetsmart-cyan)' }}>{c.country}</div>
              </div>
              <div style={{ fontWeight: 'bold', opacity: 0.5 }}>{c.code}</div>
            </div>
          )) : (
            <div style={{ padding: '15px', textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>No se encontraron ciudades</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CityDropdown;
