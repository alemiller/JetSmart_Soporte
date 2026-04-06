import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronRight, ChevronDown, Search, ArrowUp, ArrowDown, X, Copy } from 'lucide-react';

const JsonViewer = ({ src, idPrefix = 'json' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [expandedPaths, setExpandedPaths] = useState({});
  const containerRef = useRef(null);

  // 1. Encuentra coincidencias de forma eficiente (sin recursión excesiva o ciclos infinitos)
  const matches = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    const term = searchTerm.toLowerCase();
    const results = [];
    
    const findInObj = (obj, path = '') => {
      if (!obj) return;
      
      // Control de profundidad para evitar cuelgues accidentales en objetos masivos
      if (path.split('.').length > 50) return;

      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Match en la clave
        if (key.toLowerCase().includes(term)) {
          results.push(currentPath);
        }
        
        // Match en el valor (si es primitivo)
        if (value !== null && typeof value !== 'object') {
          if (String(value).toLowerCase().includes(term)) {
            if (!results.includes(currentPath)) results.push(currentPath);
          }
        } else if (value && typeof value === 'object') {
          findInObj(value, currentPath);
        }
      });
    };

    findInObj(src);
    return results;
  }, [src, searchTerm]);

  // 2. Expandir padres cuando cambian los matches (una sola vez por cambio de búsqueda)
  useEffect(() => {
    if (matches.length > 0) {
      const newExpanded = {};
      matches.forEach(path => {
        const parts = path.split('.');
        let current = '';
        // Expandir todos los niveles excepto el último (que es el nodo mismo)
        for (let i = 0; i < parts.length; i++) {
          current = current ? `${current}.${parts[i]}` : parts[i];
          newExpanded[current] = true;
        }
      });
      setExpandedPaths(prev => ({ ...prev, ...newExpanded }));
      setCurrentMatchIndex(0);
    }
  }, [matches]);

  const toggleExpand = (path) => {
    setExpandedPaths(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const jumpToMatch = (index) => {
    if (matches.length === 0 || !matches[index]) return;
    
    const path = matches[index];
    const id = `${idPrefix}-${path}`;
    
    // Asegurar expansión inmediata antes de buscar el elemento
    const parts = path.split('.');
    let current = '';
    const newExpanded = { ...expandedPaths };
    let changed = false;
    parts.forEach(part => {
      current = current ? `${current}.${part}` : part;
      if (!newExpanded[current]) {
        newExpanded[current] = true;
        changed = true;
      }
    });
    
    if (changed) setExpandedPaths(newExpanded);

    // Scroll al elemento
    setTimeout(() => {
      const el = document.getElementById(id);
      const container = containerRef.current;
      if (el && container) {
        container.scrollTo({
          top: el.offsetTop - (container.offsetHeight / 2),
          behavior: 'smooth'
        });
      }
    }, changed ? 100 : 0);
  };

  const handleNext = () => {
    const nextIdx = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIdx);
    jumpToMatch(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(prevIdx);
    jumpToMatch(prevIdx);
  };

  const renderValue = (val, path) => {
    const matchTerm = searchTerm.toLowerCase();
    const isMatch = searchTerm && searchTerm.length >= 2 && String(val).toLowerCase().includes(matchTerm);
    const isCurrent = isMatch && matches[currentMatchIndex] === path;
    const color = typeof val === 'number' ? '#098658' : (typeof val === 'boolean' || val === null) ? '#0000ff' : '#a31515';

    return (
      <span 
        id={`${idPrefix}-${path}`} 
        style={{ 
            color, 
            background: isCurrent ? '#fff3cd' : (isMatch ? '#fffde7' : 'transparent'), 
            padding: '0 2px', 
            borderRadius: '2px', 
            border: isCurrent ? '1px solid #ffeeba' : 'none', 
            wordBreak: 'break-all' 
        }}
      >
        {typeof val === 'string' ? `"${val}"` : String(val)}
      </span>
    );
  };

  const renderNode = (key, value, path, depth) => {
    const isObject = value !== null && typeof value === 'object';
    const isExpanded = !!expandedPaths[path];
    const matchTerm = searchTerm.toLowerCase();
    const isMatch = searchTerm && searchTerm.length >= 2 && key.toLowerCase().includes(matchTerm);
    const isCurrent = isMatch && matches[currentMatchIndex] === path;

    return (
      <div key={path} style={{ marginLeft: depth > 0 ? '1.5rem' : '0', borderLeft: depth > 0 ? '1px solid #eee' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', padding: '2px 0' }}>
          {isObject ? (
            <span onClick={() => toggleExpand(path)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#888', marginTop: '4px' }}>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          ) : (
            <span style={{ width: '14px' }} />
          )}
          <span 
            id={isObject ? `${idPrefix}-${path}` : undefined}
            style={{ color: '#0451a5', fontWeight: 600, background: isCurrent ? '#fff3cd' : (isMatch ? '#fffde7' : 'transparent'), padding: '0 2px', borderRadius: '2px' }}
          >
            {key}:
          </span>
          {!isObject ? (
            <span style={{ marginLeft: '4px' }}>{renderValue(value, path)}</span>
          ) : (
            <span style={{ color: '#999', fontSize: '0.75rem', cursor: 'pointer', marginTop: '3px' }} onClick={() => toggleExpand(path)}>
               {Array.isArray(value) ? `Array(${value.length})` : 'Object'} {!isExpanded && '{ ... }'}
            </span>
          )}
        </div>
        {isObject && isExpanded && (
          <div style={{ marginBottom: '2px' }}>
            {Object.entries(value).map(([k, v]) => renderNode(k, v, path ? `${path}.${k}` : k, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px', border: '1px solid #ddd', borderRadius: '12px', background: 'white' }}>
      <div style={{ background: '#f8f9fa', padding: '1rem 1.5rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#adb5bd' }} />
            <input 
                type="text" 
                placeholder="Buscar (ej: 'fare', 'ADT', '1500')..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                style={{ width: '100%', background: 'white', border: '1px solid #ced4da', borderRadius: '8px', padding: '10px 16px 10px 42px', color: '#212529', fontSize: '0.9rem' }} 
            />
            {searchTerm && <X size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#adb5bd' }} onClick={() => setSearchTerm('')} />}
          </div>
          {matches.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#e9ecef', padding: '6px 12px', borderRadius: '6px' }}>
               <span style={{ fontSize: '0.8rem', color: '#495057', fontWeight: 700 }}>{currentMatchIndex + 1} / {matches.length}</span>
               <div style={{ display: 'flex', borderLeft: '1px solid #dee2e6', paddingLeft: '1rem', gap: '4px' }}>
                  <button onClick={handlePrev} style={{ background: 'white', border: '1px solid #ced4da', color: '#495057', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}><ArrowUp size={14} /></button>
                  <button onClick={handleNext} style={{ background: 'white', border: '1px solid #ced4da', color: '#495057', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}><ArrowDown size={14} /></button>
               </div>
            </div>
          )}
        </div>
        <button onClick={() => navigator.clipboard.writeText(JSON.stringify(src, null, 2))} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #ced4da', color: '#495057', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}><Copy size={14} /> COPIAR JSON</button>
      </div>
      <div 
        ref={containerRef} 
        style={{ background: 'white', color: '#333', padding: '2rem', borderRadius: '0 0 12px 12px', flex: 1, overflowY: 'auto', maxHeight: '700px', fontFamily: '"Cascadia Code", "Fira Code", monospace', fontSize: '0.9rem', lineHeight: '1.6', position: 'relative' }}
      >
        {Object.entries(src).map(([key, value]) => renderNode(key, value, key, 0))}
      </div>
    </div>
  );
};

export default JsonViewer;
