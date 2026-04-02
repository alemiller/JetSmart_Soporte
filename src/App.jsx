import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Plane, Clock, Settings, AlertCircle, ChevronRight, Info, ChevronDown, ChevronUp, Code, X, MapPin, Search as SearchIcon, Eye, ChevronLeft, Calendar, User, Users, RefreshCw, CheckCircle2, FileJson, Package, CreditCard, ShieldCheck, ShieldAlert, RotateCcw, Baby, CheckCircle, AlertTriangle } from 'lucide-react';

const CHARGE_TYPES = {
  0: "FarePrice", 1: "Discount", 2: "IncludedTravelFee", 3: "IncludedTax", 4: "TravelFee",
  5: "Tax", 6: "ServiceCharge", 7: "PromotionDiscount", 8: "ConnectionAdjustmentAmount",
  9: "AddOnsPrice", 10: "FarePoints", 11: "DiscountPoints", 16: "IncludedAddOnsFee",
  17: "AddOnsFee", 18: "AddOnsMarkup", 19: "FareSurcharge", 21: "AddOnsCancelFee",
  22: "Calculated", 23: "Note", 24: "Points", 25: "DynamicFareAdjustment"
};

const CITIES = [
  // Chile
  { name: 'Santiago', code: 'SCL', country: 'Chile' }, { name: 'Arica', code: 'ARI', country: 'Chile' },
  { name: 'Iquique', code: 'IQQ', country: 'Chile' }, { name: 'Calama', code: 'CJC', country: 'Chile' },
  { name: 'Antofagasta', code: 'ANF', country: 'Chile' }, { name: 'La Serena', code: 'LSC', country: 'Chile' },
  { name: 'Concepción', code: 'CCP', country: 'Chile' }, { name: 'Temuco', code: 'ZCO', country: 'Chile' },
  { name: 'Puerto Montt', code: 'PMC', country: 'Chile' }, { name: 'Balmaceda', code: 'BBA', country: 'Chile' },
  { name: 'Punta Arenas', code: 'PUQ', country: 'Chile' }, { name: 'Valdivia', code: 'ZAL', country: 'Chile' },
  { name: 'Puerto Natales', code: 'PNT', country: 'Chile' },
  // Argentina
  { name: 'Buenos Aires (Aeroparque)', code: 'AEP', country: 'Argentina' }, { name: 'Buenos Aires (Ezeiza)', code: 'EZE', country: 'Argentina' },
  { name: 'Bariloche', code: 'BRC', country: 'Argentina' }, { name: 'Córdoba', code: 'COR', country: 'Argentina' },
  { name: 'Mendoza', code: 'MDZ', country: 'Argentina' }, { name: 'Salta', code: 'SLA', country: 'Argentina' },
  { name: 'Iguazú', code: 'IGR', country: 'Argentina' }, { name: 'Neuquén', code: 'NQN', country: 'Argentina' },
  { name: 'Tucumán', code: 'TUC', country: 'Argentina' }, { name: 'Ushuaia', code: 'USH', country: 'Argentina' },
  { name: 'Posadas', code: 'PSS', country: 'Argentina' }, { name: 'Jujuy', code: 'JUJ', country: 'Argentina' },
  // Perú
  { name: 'Lima', code: 'LIM', country: 'Perú' }, { name: 'Cusco', code: 'CUZ', country: 'Perú' },
  { name: 'Arequipa', code: 'AQP', country: 'Perú' }, { name: 'Piura', code: 'PIU', country: 'Perú' },
  { name: 'Tarapoto', code: 'TPP', country: 'Perú' }, { name: 'Trujillo', code: 'TRU', country: 'Perú' },
  { name: 'Chiclayo', code: 'CIX', country: 'Perú' }, { name: 'Iquitos', code: 'IQT', country: 'Perú' },
  { name: 'Cajamarca', code: 'CJA', country: 'Perú' }, { name: 'Talara', code: 'TYL', country: 'Perú' },
  // Colombia
  { name: 'Bogotá', code: 'BOG', country: 'Colombia' }, { name: 'Medellín', code: 'MDE', country: 'Colombia' },
  { name: 'Cartagena', code: 'CTG', country: 'Colombia' }, { name: 'Santa Marta', code: 'SMR', country: 'Colombia' },
  { name: 'Cali', code: 'CLO', country: 'Colombia' }, { name: 'Pereira', code: 'PEI', country: 'Colombia' },
  { name: 'Cúcuta', code: 'CUC', country: 'Colombia' }, { name: 'Bucaramanga', code: 'BGA', country: 'Colombia' },
  { name: 'San Andrés', code: 'ADZ', country: 'Colombia' },
  // Brasil
  { name: 'Rio de Janeiro', code: 'GIG', country: 'Brasil' }, { name: 'São Paulo', code: 'GRU', country: 'Brasil' },
  { name: 'Florianópolis', code: 'FLN', country: 'Brasil' }, { name: 'Curitiba', code: 'CWB', country: 'Brasil' },
  { name: 'Foz do Iguaçu', code: 'IGU', country: 'Brasil' }, { name: 'Porto Alegre', code: 'POA', country: 'Brasil' },
  // Otros
  { name: 'Montevideo', code: 'MVD', country: 'Uruguay' }, { name: 'Asunción', code: 'ASU', country: 'Paraguay' },
  { name: 'Quito', code: 'UIO', country: 'Ecuador' }, { name: 'Guayaquil', code: 'GYE', country: 'Ecuador' },
  { name: 'Punta Cana', code: 'PUJ', country: 'República Dominicana' }, { name: 'Santo Domingo', code: 'SDQ', country: 'República Dominicana' }
];

const JsonViewer = ({ src, searchTerm, currentMatchIndex, onMatchesFound, idPrefix = "json" }) => {
  const [expandedPaths, setExpandedPaths] = useState(new Set(['root']));
  const [matches, setMatches] = useState([]);
  const allPaths = useMemo(() => {
    const paths = []; try {
      const recurse = (obj, path = 'root') => {
        if (typeof obj === 'object' && obj !== null) {
          Object.keys(obj).forEach(key => {
            const newPath = `${path}.${key}`;
            paths.push({ path: newPath, key, value: obj[key], isObject: typeof obj[key] === 'object' && obj[key] !== null });
            recurse(obj[key], newPath);
          });
        }
      };
      recurse(src);
    } catch (e) { console.error("Recurse error", e); }
    return paths;
  }, [src]);
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 1) { setMatches([]); onMatchesFound([]); return; }
    try {
      const term = searchTerm.toLowerCase();
      const f = allPaths.filter(p => (p.key || '').toLowerCase().includes(term) || (typeof p.value === 'string' && (p.value).toLowerCase().includes(term)) || (typeof p.value === 'number' && p.value.toString().includes(searchTerm))).map(m => m.path);
      setMatches(f); onMatchesFound(f);
    } catch (e) { console.error("Search error", e); }
  }, [searchTerm, allPaths, onMatchesFound]);
  useEffect(() => {
    if (matches.length > 0 && currentMatchIndex >= 0 && currentMatchIndex < matches.length) {
      const matchPath = matches[currentMatchIndex];
      const segments = (matchPath || '').split('.');
      const newExpanded = new Set(expandedPaths);
      let current = '';
      segments.forEach((seg, i) => { current = current ? `${current}.${seg}` : seg; if (i < segments.length - 1) newExpanded.add(current); });
      setExpandedPaths(newExpanded);
      setTimeout(() => { const el = document.getElementById(`${idPrefix}-path-${matchPath}`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
    }
  }, [currentMatchIndex, matches, idPrefix]);
  const togglePath = (path) => { const newSet = new Set(expandedPaths); if (newSet.has(path)) newSet.delete(path); else newSet.add(path); setExpandedPaths(newSet); };
  const renderNode = (data, name, path = 'root') => {
    const isObject = typeof data === 'object' && data !== null;
    const isExpanded = expandedPaths.has(path);
    const isCurrentMatch = matches[currentMatchIndex] === path;
    const hasMatchInChildren = matches.some(m => (m || '').startsWith(path + '.') && !isExpanded);
    return (
      <div key={path} className="json-tree-node" style={{ marginLeft: path === 'root' ? 0 : '1.2rem' }}>
        <div id={`${idPrefix}-path-${path}`} className={`json-node-row ${isCurrentMatch ? 'current-match' : ''} ${hasMatchInChildren ? 'child-has-match' : ''}`} style={{ display: 'flex', alignItems: 'center', padding: '2px 4px', borderRadius: '4px', background: isCurrentMatch ? '#fff3cd' : 'transparent', border: isCurrentMatch ? '1px solid #ffeeba' : 'none', fontSize: '0.85rem' }}>
          {isObject ? (<button onClick={() => togglePath(path)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', marginRight: '4px' }}>{isExpanded ? <ChevronDown size={14} color="#666" /> : <ChevronRight size={14} color="#00afec" />}</button>) : <div style={{ width: '18px' }} />}
          <span style={{ color: '#881391', fontWeight: 'bold', marginRight: '4px' }}>{name}:</span>
          {!isObject ? (<span style={{ color: typeof data === 'string' ? '#c41a16' : '#1c00cf' }}>{JSON.stringify(data) || 'undefined'}</span>) : (<span style={{ color: '#aaa', fontSize: '0.75rem' }}>{Array.isArray(data) ? `[${data.length}]` : `{${Object.keys(data).length}}`}</span>)}
        </div>
        {isObject && isExpanded && (<div className="json-node-children" style={{ borderLeft: '1px solid #eee', marginLeft: '8px' }}>{Object.keys(data).map(key => renderNode(data[key], key, `${path}.${key}`))}</div>)}
      </div>
    );
  };
  return <div className="json-custom-viewer" style={{ fontFamily: 'monospace', overflow: 'auto', maxHeight: '500px', padding: '10px' }}>{renderNode(src, 'Response')}</div>;
};

const CityDropdown = ({ label, value, onChange, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const selectedCity = CITIES.find(c => c.code === value);
  useEffect(() => {
    const h = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const filtered = CITIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="form-group" ref={containerRef} style={{ position: 'relative' }}>
      <label>{label}</label>
      <div className="custom-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <Icon size={18} color="var(--jetsmart-navy)" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedCity ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', minWidth: 0 }}>
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedCity.name}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.6, marginLeft: '5px' }}>{selectedCity.code}</span>
            </div>
          ) : (
            <span className="placeholder-text">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={14} color="#666" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </div>
      {isOpen && (
        <div className="custom-dropdown-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, background: 'white', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', marginTop: '5px', maxHeight: '300px', overflowY: 'auto' }}>
          <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
            <input autoFocus type="text" placeholder="Buscar por ciudad o país..." value={search} onChange={(e) => setSearch(e.target.value)} onClick={(e) => e.stopPropagation()} />
          </div>
          {filtered.map(c => (
            <div key={c.code} className="dropdown-item" onClick={() => { onChange(c.code); setIsOpen(false); setSearch(''); }} style={{ padding: '10px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8f9fa' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--jetsmart-cyan)' }}>{c.country}</div>
              </div>
              <div style={{ fontWeight: 'bold', opacity: 0.5 }}>{c.code}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jetsmart_token') || '');
  const [searchResults, setSearchResults] = useState(null);
  const [sellResults, setSellResults] = useState(null);
  const [selectedFares, setSelectedFares] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [showJsonResponse, setShowJsonResponse] = useState(false);
  const [showSellJsonResponse, setShowSellJsonResponse] = useState(false);
  const [passengersData, setPassengersData] = useState({});
  const [addingPassengers, setAddingPassengers] = useState(false);
  const [passengerStatus, setPassengerStatus] = useState({}); 
  const [bookingFinal, setBookingFinal] = useState(null);
  const [committing, setCommitting] = useState(false);

  const [activeJsonTab, setActiveJsonTab] = useState('JSON');
  const [jsonSearchTerm, setJsonSearchTerm] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [matches, setMatches] = useState([]);

  const [sellActiveJsonTab, setSellActiveJsonTab] = useState('JSON');
  const [sellJsonSearchTerm, setSellJsonSearchTerm] = useState('');
  const [sellCurrentMatchIndex, setSellCurrentMatchIndex] = useState(-1);
  const [sellMatches, setSellMatches] = useState([]);
  
  const [apiSettings, setApiSettings] = useState({
    url: 'https://partners-cert.api.jetsmart.com', username: 'IT_ALEJANDROM', password: 'HwLN8s@KXW', isCustomPassword: false,
    domain: 'DEF', location: 'WWW', channelType: 'Web', money: 'ARS', orgCode: 'JA'
  });

  const [searchParams, setSearchParams] = useState({
    tripType: 'RT', origin: '', destination: '', beginDate: '', endDate: '',
    passengers: { ADT: 1, CHD: 0, INFF: 0 },
    infantBirthdays: []
  });

  const handlePassengerChange = (type, value) => {
    const count = parseInt(value);
    setSearchParams(prev => {
      const nb = [...prev.infantBirthdays];
      if (type === 'INFF') { if (count > nb.length) while (nb.length < count) nb.push(""); else nb.length = count; }
      return { ...prev, passengers: { ...prev.passengers, [type]: count }, infantBirthdays: nb };
    });
  };

  const getProxyUrl = (url) => url.includes('cert') ? '/api-cert' : (url.includes('prod') ? '/api-prod' : url);

  const callToken = async () => {
    try {
      setLoading(true); setError(null);
      const r = await fetch(`${getProxyUrl(apiSettings.url)}/api/nsk/v2/token`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ applicationName: "", credentials: { username: apiSettings.username, password: apiSettings.password, domain: apiSettings.domain, location: apiSettings.location, channelType: apiSettings.channelType } })});
      const d = await r.json();
      if (r.ok && d.data?.token) { setToken(d.data.token); localStorage.setItem('jetsmart_token', d.data.token); setShowSettings(false); return d.data.token; }
      else throw new Error(JSON.stringify(d, null, 2));
    } catch (e) { setError("Token Error: " + e.message); return null; } finally { setLoading(false); }
  };

  const isFormValid = () => {
    const { origin, destination, beginDate, endDate, tripType, passengers } = searchParams;
    const totalPaxes = passengers.ADT + passengers.CHD + passengers.INFF;
    if (!origin || !destination || !beginDate || totalPaxes === 0) return false;
    if (tripType === 'RT' && !endDate) return false;
    return true;
  };

  const isSelectionComplete = () => {
    if (!selectedFares) return false;
    if (searchParams.tripType === 'OW') return !!selectedFares[0];
    return !!selectedFares[0] && !!selectedFares[1];
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!isFormValid()) { setError("Por favor completa todos los campos."); return; }
    setError(null); setLoading(true); setSearchResults(null); setSellResults(null); setSelectedFares({});
    let t = token || await callToken(); setLoading(true);
    if (!t) { setLoading(false); return; }
    try {
      const body = { origin: searchParams.origin, destination: searchParams.destination, beginDate: searchParams.beginDate, passengers: { types: [{ type: 'ADT', count: searchParams.passengers.ADT }, { type: 'CHD', count: searchParams.passengers.CHD }, { type: 'INFF', count: searchParams.passengers.INFF }].filter(p => p.count > 0), residentCountry: "CL" }, codes: { currencyCode: apiSettings.money, sourceOrganization: apiSettings.orgCode, currentSourceOrganization: apiSettings.orgCode }, filters: { fareInclusionType: "Default", compressionType: "Default", loyalty: "MonetaryOnly", exclusionType: "ExcludeUnavailable", type: "All", bundleControlFilter: 2, maxConnections: 2 }, taxesAndFees: true, numberOfFaresPerJourney: "10" };
      if (searchParams.tripType === 'RT') body.endDate = searchParams.endDate;
      const r = await fetch(`${getProxyUrl(apiSettings.url)}/api/nsk/v4/availability/search/simple`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': t }, body: JSON.stringify(body) });
      const d = await r.json();
      console.log("Search API Response:", d);
      if (r.ok && d.data) setSearchResults(d.data);
      else throw new Error(JSON.stringify(d, null, 2));
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const initPassengersData = (paxObj) => {
    const data = {};
    Object.values(paxObj).forEach(pax => {
      data[pax.passengerKey] = {
        firstName: '', lastName: '', gender: 'Male', title: 'MR',
        dateOfBirth: '', nationality: 'AR', residentCountry: 'AR',
        infant: { firstName: '', lastName: '', gender: 'Male', dateOfBirth: '', nationality: 'AR' }
      };
    });
    setPassengersData(data);
    setPassengerStatus({});
  };

  const handleSell = async () => {
    setError(null); setLoading(true); setSellResults(null);
    let t = token || await callToken(); setLoading(true);
    if (!t) { setLoading(false); return; }
    try {
      const keys = Object.values(selectedFares).map(sel => ({ journeyKey: sel.journeyKey, fareAvailabilityKey: sel.fareAvailabilityKey, standbyPriorityCode: "", inventoryControl: "HoldSpace" }));
      const body = { preventOverlap: true, keys, suppressPassengerAgeValidation: true, passengers: { types: [{ type: 'ADT', count: searchParams.passengers.ADT }, { type: 'CHD', count: searchParams.passengers.CHD }, { type: 'INFF', count: searchParams.passengers.INFF }].filter(p => p.count > 0), residentCountry: "CL" }, currencyCode: apiSettings.money, infantCount: searchParams.passengers.INFF, promotionCode: "", sourceOrganization: apiSettings.orgCode, serviceBundleCodes: ["", ""], applyServiceBundle: 0 };
      const r = await fetch(`${getProxyUrl(apiSettings.url)}/api/nsk/v4/trip/sell`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': t }, body: JSON.stringify(body) });
      const d = await r.json();
      if (r.ok && d.data) { 
        setSellResults(d.data); initPassengersData(d.data.passengers);
      } else throw new Error(JSON.stringify(d, null, 2));
    } catch (e) { setError("Sell Error: " + e.message); } finally { setLoading(false); }
  };

  const handleSinglePassengerConfirm = async (key) => {
    let t = token || await callToken();
    if (!t) return;
    setPassengerStatus(prev => ({ ...prev, [key]: { status: 'loading', message: 'Confirmando...' } }));
    const pData = passengersData[key];
    const pax = sellResults.passengers[key];
    const hasInfantData = pData.infant.firstName && pData.infant.lastName && pData.infant.dateOfBirth;
    try {
      const body = { name: { first: pData.firstName, last: pData.lastName, title: pData.title, middle: "", suffix: "" }, info: { nationality: pData.nationality, residentCountry: pData.residentCountry, gender: pData.gender, dateOfBirth: pData.dateOfBirth, familyNumber: 0 }, customerNumber: "", discountCode: "", program: { code: "", levelCode: "", number: "" } };
      const r = await fetch(`${getProxyUrl(apiSettings.url)}/api/nsk/v3/booking/passengers/${key}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': t }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error?.message || d.message || "Error API");
      if (pax.passengerTypeCode === 'ADT' && hasInfantData) {
        const infBody = { name: { first: pData.infant.firstName, last: pData.infant.lastName, title: "", middle: "", suffix: "" }, gender: pData.infant.gender, dateOfBirth: pData.infant.dateOfBirth, nationality: pData.infant.nationality, residentCountry: pData.residentCountry };
        await fetch(`${getProxyUrl(apiSettings.url)}/api/nsk/v3/booking/passengers/${key}/infant`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': t }, body: JSON.stringify(infBody) });
      }
      setPassengerStatus(prev => ({ ...prev, [key]: { status: 'success', message: 'OK (200)' } }));
    } catch (e) { setPassengerStatus(prev => ({ ...prev, [key]: { status: 'error', message: e.message } })); }
  };

  const handleAddPassengers = async () => {
    setAddingPassengers(true);
    const keys = Object.keys(sellResults.passengers);
    for (const k of keys) { await new Promise(r => setTimeout(r, 400)); await handleSinglePassengerConfirm(k); }
    setAddingPassengers(false);
  };

  const handleCommit = async () => {
    setCommitting(true); setBookingFinal(null);
    let t = token || await callToken();
    if (!t) return;
    try {
      const body = { receivedBy: "API_JET_TEST", notifyContacts: false };
      const r = await fetch(`${getProxyUrl(apiSettings.url)}/api/nsk/v3/booking`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': t }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Commit Error");
      const rGet = await fetch(`${getProxyUrl(apiSettings.url)}/api/nsk/v1/booking`, { method: 'GET', headers: { 'Authorization': t } });
      const dGet = await rGet.json();
      if (rGet.ok && dGet.data) setBookingFinal(dGet.data);
      else throw new Error("PNR error");
    } catch (e) { setError(e.message); } finally { setCommitting(false); }
  };

  const handleReset = async () => {
    setLoading(true); try { 
      let t = token || await callToken();
      if (t) await fetch(`${getProxyUrl(apiSettings.url)}/api/nsk/v1/booking/reset`, { method: 'DELETE', headers: { 'Authorization': t } });
      setSellResults(null); setSelectedFares({}); setBookingFinal(null);
    } catch (e) { setSellResults(null); setSelectedFares({}); } finally { setLoading(false); }
  };

  const loadSampleData = async () => {
    setLoading(true); try { 
      const d = await (await fetch('/resources/simpleSearchOW_conexion.json')).json(); 
      setSearchResults(d.data); setSelectedFares({}); setSellResults(null);
      setSearchParams(p => ({ ...p, tripType: 'OW', origin: 'LIM', destination: 'CTG', beginDate: '2026-05-09', passengers: { ADT: 2, CHD: 1, INFF: 0 } })); 
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const loadSampleSell = async () => {
    setLoading(true); try { 
      const d = await (await fetch('/resources/sell.json')).json(); 
      setSellResults(d.data); initPassengersData(d.data.passengers);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const renderChargeRow = (sc) => {
    const isDiscount = sc.type === 1;
    const isIncluded = [2, 3, 16].includes(sc.type);
    const color = isDiscount ? '#e74c3c' : 'inherit';
    
    return (
      <tr key={sc.type + '-' + sc.amount + Math.random()} style={{ borderBottom: '1px solid #f0f0f0', color }}>
        <td style={{ padding: '6px 0' }}>
          {CHARGE_TYPES[sc.type] || 'Servicio'} 
          <span style={{ opacity: 0.5, fontSize: '0.65rem' }}> ({sc.type})</span>
          {sc.type === 1 && <span style={{ color: '#e74c3c', fontSize: '0.6rem', fontWeight: 900 }}> RESTA</span>}
          {sc.type !== 0 && sc.type !== 1 && (
            isIncluded ? 
            <span style={{ color: '#27ae60', fontSize: '0.6rem', fontWeight: 900, marginLeft: '4px' }}> INCLUIDO</span> : 
            <span style={{ color: '#ff00ff', fontSize: '0.6rem', fontWeight: 900, marginLeft: '4px' }}> NO INCLUIDO</span>
          )}
        </td>
        <td style={{ textAlign: 'right', fontWeight: 600 }}>
          {isDiscount ? '-' : ''}{sc.amount.toLocaleString()}
        </td>
      </tr>
    );
  };

  const renderFlightList = (marketKey, listLabel, tripIndex) => {
    const market = searchResults?.results?.[0]?.trips?.[tripIndex]?.journeysAvailableByMarket?.[marketKey];
    if (!market) return null;
    return (
      <div className="market-section">
        <h3 className="section-title">{listLabel}</h3>
        <div className="flight-list">
          {market.map((journey) => (
            <div key={journey.journeyKey} className="flight-card card">
              <div className="flight-header" style={{ justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="flight-time-main">{new Date(journey.designator.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                  <div className="flight-city-main">{journey.designator.origin}</div>
                </div>
                {journey.segments.map((seg, idx) => (
                   <React.Fragment key={idx}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: idx === 0 && journey.segments.length > 1 ? '#e67e22' : '#00afec', fontWeight: 'bold' }}>{journey.segments.length > 1 ? `TRAMO ${idx+1}` : 'DIRECTO'}</div>
                        <Plane size={18} color="var(--jetsmart-navy)" />
                        <div style={{ fontSize: '0.65rem', color: '#999' }}>{seg.identifier.carrierCode}{seg.identifier.identifier}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div className={idx === journey.segments.length - 1 ? "flight-time-main" : ""}>
                           {new Date(seg.designator.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                        <div className={idx === journey.segments.length - 1 ? "flight-city-main" : ""} style={{ color: 'var(--jetsmart-cyan)' }}>{seg.designator.destination}</div>
                      </div>
                   </React.Fragment>
                ))}
              </div>
              <div className="fares-container" style={{ textAlign: 'left' }}>
                {journey.fares.map((fareRef) => {
                  const fareData = searchResults?.faresAvailable?.[fareRef.fareAvailabilityKey];
                  if (!fareData) return null;
                  const selection = selectedFares[tripIndex];
                  const isSelected = selection && selection.journeyKey === journey.journeyKey && selection.fareAvailabilityKey === fareRef.fareAvailabilityKey;
                  return (
                    <div key={fareRef.fareAvailabilityKey} className={`fare-option ${isSelected ? 'selected' : ''}`}>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }} onClick={() => { if (sellResults) return; setSelectedFares(p => { const n = {...p}; if (isSelected) delete n[tripIndex]; else n[tripIndex] = { journeyKey: journey.journeyKey, fareAvailabilityKey: fareRef.fareAvailabilityKey }; return n; }); }}>
                        <div style={{ display: 'flex', alignItems: 'center', height: '1.4rem', marginRight: '1rem', cursor: 'pointer' }}><div className={`radio-indicator ${isSelected ? 'active' : ''}`} /></div>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--jetsmart-navy)' }}>{fareData?.fares?.[0]?.productClass}</div>
                            <div style={{ fontSize: '0.7rem', color: '#666', fontFamily: 'monospace', fontWeight: 700 }}>CLASE: {fareData?.fares?.[0]?.classOfService} | FB: {fareData?.fares?.[0]?.fareBasisCode}</div>
                            <div style={{ fontSize: '0.6rem', color: '#aaa', fontFamily: 'monospace', marginTop: '2px' }}>KEY: {fareRef.fareAvailabilityKey}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: isSelected ? 'var(--jetsmart-navy)' : 'var(--jetsmart-cyan)' }}>{fareData.totals?.fareTotal?.toLocaleString()} {apiSettings.money}</div>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="fare-details-expanded" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px dashed #eee' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                            {['ADT', 'CHD', 'INFF'].filter(type => searchParams.passengers[type] > 0).map((pType) => {
                               // Calculate total for this pax type across all segments
                               const totalForPaxType = fareData.fares.reduce((acc, seg) => {
                                 const pf = seg.passengerFares.find(f => f.passengerType === pType);
                                 if (!pf) return acc;
                                 const paxSubtotal = pf.serviceCharges.reduce((sa, sc) => [2,3,16].includes(sc.type) ? sa : (sc.type === 1 ? sa - sc.amount : sa + sc.amount), 0);
                                 return acc + (paxSubtotal * (searchParams.passengers[pType] || 0));
                               }, 0);

                               return (
                                  <div key={pType} style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 8px 15px rgba(0,0,0,0.03)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--jetsmart-navy)', marginBottom: '1rem', paddingBottom: '0.6rem' }}>
                                       <b style={{ color: 'var(--jetsmart-navy)', fontSize: '1rem' }}>{pType === 'ADT' ? 'ADULTO' : pType === 'CHD' ? 'NIÑO' : 'INFANTE'} ({searchParams.passengers[pType]})</b>
                                       <span style={{ fontWeight: 900, color: 'var(--jetsmart-cyan)', fontSize: '1.1rem' }}>{totalForPaxType.toLocaleString()} {apiSettings.money}</span>
                                    </div>
                                    
                                    {fareData.fares.map((segFare, sIdx) => {
                                      const pf = segFare.passengerFares.find(f => f.passengerType === pType);
                                      if (!pf) return null;
                                      return (
                                        <div key={sIdx} style={{ marginBottom: '1.5rem', lastChild: { marginBottom: 0 } }}>
                                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#555', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Plane size={12} /> TRAMO {sIdx + 1}
                                          </div>
                                          <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                                            <thead><tr style={{ borderBottom: '1px solid #eee', color: '#888' }}><th style={{ textAlign: 'left', fontWeight: 500 }}>CARGO</th><th style={{ textAlign: 'right', fontWeight: 500 }}>VALOR</th></tr></thead>
                                            <tbody>
                                              {pf.serviceCharges.map(sc => renderChargeRow(sc))}
                                            </tbody>
                                          </table>
                                        </div>
                                      );
                                    })}
                                  </div>
                               );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSellResults = () => {
    if (!sellResults) return null;
    let sum = 0;
    const ignored = [2,3,16];
    
    // Count passenger types to multiply charges correctly
    const paxCounts = Object.values(sellResults.passengers).reduce((acc, p) => {
      acc[p.passengerTypeCode] = (acc[p.passengerTypeCode] || 0) + 1;
      return acc;
    }, {});

    sellResults.journeys.forEach(j => j.segments.forEach(s => s.fares[0].passengerFares.forEach(pf => {
       const count = paxCounts[pf.passengerType] || 0;
       pf.serviceCharges.forEach(sc => {
         if (ignored.includes(sc.type)) return;
         const amt = sc.amount * count;
         if (sc.type === 1) sum -= amt; else sum += amt;
       });
    })));
    const isValid = Math.abs(sum - sellResults.breakdown.balanceDue) < 0.01;
    return (
      <div className="sell-results-display" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
           <h3 className="section-title" style={{ color: '#27ae60', margin: 0 }}>CONFIRMACIÓN SELL</h3>
           <button className="secondary" onClick={handleReset} style={{ color: '#e74c3c', borderColor: '#e74c3c' }}><RotateCcw size={14} style={{ marginRight: '6px' }}/> RESET SESSION</button>
        </div>
        
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'2rem' }}>
           <div className="card" style={{ background:'var(--jetsmart-navy)', color:'white', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize:'0.8rem', opacity: 0.8 }}>BALANCE DUE (GDS)</div>
              <div style={{ fontSize:'2.5rem', fontWeight:900 }}>{sellResults.breakdown.balanceDue.toLocaleString()} {sellResults.currencyCode}</div>
              <CreditCard style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }} size={100} />
           </div>
           <div className="card" style={{ background: isValid ? '#f0f9f4' : '#fff5f5', border: `1px solid ${isValid ? '#27ae60' : '#e74c3c'}` }}>
              <div style={{ fontWeight:900, color: isValid ? '#27ae60' : '#e74c3c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isValid ? <CheckCircle size={18} /> : <AlertTriangle size={18} />} 
                VERIFICACIÓN FINANCIERA: {isValid ? 'EXITOSA' : 'FALLIDA'}
              </div>
              <div style={{ fontSize:'0.9rem', marginTop: '5px' }}>Calculado: <b>{sum.toLocaleString()}</b> {sellResults.currencyCode}</div>
           </div>
        </div>
        
        {sellResults.journeys.map((j, jIdx) => (
          <div key={jIdx} className="flight-card card" style={{ borderLeft: '8px solid var(--jetsmart-cyan)', marginBottom: '1.5rem', padding: 0 }}>
            <div style={{ background: '#fcfcfc', padding: '1rem 1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
               <b style={{ color: 'var(--jetsmart-navy)' }}>{jIdx === 0 ? 'IDA' : 'VUELTA'}: {j.designator.origin} → {j.designator.destination}</b>
            </div>
            {j.segments.map((seg, sIdx) => (
              <div key={sIdx} style={{ padding: '1.5rem', borderBottom: sIdx < j.segments.length-1 ? '1px dashed #eee' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <div style={{ background: 'var(--jetsmart-navy)', color: 'white', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>TRAMO {sIdx + 1}</div>
                  <Plane size={16} color="var(--jetsmart-cyan)" />
                  <span style={{ fontWeight: 700 }}>{seg.designator.origin} → {seg.designator.destination}</span>
                  <span style={{ fontSize: '0.8rem', background: '#eee', padding: '2px 8px', borderRadius: '4px' }}>{seg.identifier.carrierCode}{seg.identifier.identifier}</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  {Object.keys(seg.passengerSegment).map(pKey => {
                    const pI = sellResults.passengers[pKey];
                    const pF = seg.fares[0].passengerFares.find(f => f.passengerType === pI.passengerTypeCode);
                    const pS = seg.passengerSegment[pKey];
                    
                    const pSub = pF?.serviceCharges.reduce((a,c) => [2,3,16].includes(c.type) ? a : (c.type === 1 ? a-c.amount : a+c.amount), 0) || 0;

                    return (
                      <div key={pKey} style={{ background: '#fafafa', padding: '1rem', borderRadius: '10px', border: '1px solid #eee' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <b style={{ fontSize: '0.85rem' }}>{pI.passengerTypeCode === 'ADT' ? 'ADULTO' : pI.passengerTypeCode === 'CHD' ? 'NIÑO' : 'INFANTE'}</b>
                          <span style={{ fontWeight: 800, color: 'var(--jetsmart-navy)' }}>{pSub.toLocaleString()}</span>
                        </div>
                        
                        {pS.ssrs && pS.ssrs.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '0.8rem' }}>
                            {pS.ssrs.map((s, idx) => (
                              <span key={idx} style={{ fontSize: '0.65rem', background: 'var(--jetsmart-cyan)', color: 'white', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>{s.ssrCode}</span>
                            ))}
                          </div>
                        )}

                        <table style={{ width: '100%', fontSize: '0.7rem' }}>
                          <tbody>
                            {pF?.serviceCharges.map(sc => renderChargeRow(sc))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderBookingResult = () => {
    if (!bookingFinal) return null;
    let sum = 0;
    const ignored = [2,3,16];
    const paxCounts = Object.values(bookingFinal.passengers).reduce((acc, p) => {
      acc[p.passengerTypeCode] = (acc[p.passengerTypeCode] || 0) + 1;
      return acc;
    }, {});

    bookingFinal.journeys.forEach(j => j.segments.forEach(s => s.fares?.[0]?.passengerFares.forEach(pf => {
       const count = paxCounts[pf.passengerType] || 0;
       pf.serviceCharges.forEach(sc => {
         if (ignored.includes(sc.type)) return;
         const amt = sc.amount * count;
         if (sc.type === 1) sum -= amt; else sum += amt;
       });
    })));

    const balance = bookingFinal.breakdown.balanceDue || bookingFinal.breakdown.totalAmount;
    const isValid = Math.abs(sum - balance) < 0.01;

    return (
      <div style={{ marginTop: '2.5rem', animation: 'fadeIn 0.5s ease' }}>
        <div style={{ background: 'var(--jetsmart-navy)', color: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginBottom: '2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
           <CheckCircle2 color="var(--jetsmart-yellow)" size={48} style={{ marginBottom: '1rem' }} />
           <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem' }}>¡RESERVA CONFIRMADA!</h2>
           <p style={{ opacity: 0.8, fontSize: '1.1rem' }}>Localizador de Reserva (PNR)</p>
           <div style={{ fontSize: '4rem', fontWeight: 950, letterSpacing: '4px', textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>{bookingFinal.recordLocator}</div>
           <CreditCard style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05 }} size={150} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'2rem' }}>
           <div className="card" style={{ background:'var(--jetsmart-navy)', color:'white', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize:'0.8rem', opacity: 0.8 }}>TOTAL PAGADO</div>
              <div style={{ fontSize:'2.5rem', fontWeight: 900, color: 'var(--jetsmart-yellow)' }}>{(bookingFinal.breakdown.balanceDue || bookingFinal.breakdown.totalAmount).toLocaleString()} {bookingFinal.currencyCode}</div>
              <CreditCard style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }} size={100} />
           </div>
           <div className="card" style={{ background: isValid ? '#f0f9f4' : '#fff5f5', border: `1px solid ${isValid ? '#27ae60' : '#e74c3c'}` }}>
              <div style={{ fontWeight:900, color: isValid ? '#27ae60' : '#e74c3c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isValid ? <CheckCircle size={18} /> : <AlertTriangle size={18} />} 
                VERIFICACIÓN FINANCIERA: {isValid ? 'EXITOSA' : 'FALLIDA'}
              </div>
              <div style={{ fontSize:'0.9rem', marginTop: '5px' }}>Calculado: <b>{sum.toLocaleString()}</b> {bookingFinal.currencyCode}</div>
           </div>
        </div>

        <h3 className="section-title">DETALLES DEL ITINERARIO (PNR)</h3>
        {bookingFinal.journeys.map((j, jIdx) => (
          <div key={jIdx} className="flight-card card" style={{ borderLeft: '11px solid var(--jetsmart-yellow)', marginBottom: '1.5rem', padding: 0 }}>
            <div style={{ background: '#fcfcfc', padding: '1rem 1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
               <b style={{ color: 'var(--jetsmart-navy)' }}>{jIdx === 0 ? 'IDA' : 'VUELTA'}: {j.designator.origin} → {j.designator.destination}</b>
            </div>
            {j.segments.map((seg, sIdx) => (
              <div key={sIdx} style={{ padding: '1.5rem', borderBottom: sIdx < j.segments.length-1 ? '1px dashed #eee' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <div style={{ background: 'var(--jetsmart-navy)', color: 'white', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>TRAMO {sIdx + 1}</div>
                  <Plane size={16} color="var(--jetsmart-yellow)" />
                  <span style={{ fontWeight: 700 }}>{seg.designator.origin} → {seg.designator.destination}</span>
                  <span style={{ fontSize: '0.8rem', background: '#eee', padding: '2px 8px', borderRadius: '4px' }}>{seg.identifier.carrierCode}{seg.identifier.identifier}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  {Object.keys(seg.passengerSegment).map(pKey => {
                    const pI = bookingFinal.passengers[pKey];
                    const pF = seg.fares?.[0]?.passengerFares.find(f => f.passengerType === pI.passengerTypeCode);
                    const pS = seg.passengerSegment[pKey];
                    const pSub = pF?.serviceCharges.reduce((a,c) => [2,3,16].includes(c.type) ? a : (c.type === 1 ? a-c.amount : a+c.amount), 0) || 0;
                    return (
                      <div key={pKey} style={{ background: '#fafafa', padding: '1rem', borderRadius: '10px', border: '1px solid #eee' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <b style={{ fontSize: '0.85rem' }}>{pI.names?.[0]?.first || 'Pax'} {pI.names?.[0]?.last || pKey} ({pI.passengerTypeCode === 'ADT' ? 'ADULTO' : pI.passengerTypeCode === 'CHD' ? 'NIÑO' : 'INFANTE'})</b>
                          <span style={{ fontWeight: 800, color: 'var(--jetsmart-navy)' }}>{pSub.toLocaleString()}</span>
                        </div>
                        {pS.ssrs && pS.ssrs.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '0.8rem' }}>
                            {pS.ssrs.map((s, idx) => (
                              <span key={idx} style={{ fontSize: '0.65rem', background: 'var(--jetsmart-cyan)', color: 'white', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>{s.ssrCode}</span>
                            ))}
                          </div>
                        )}
                        <table style={{ width: '100%', fontSize: '0.7rem' }}>
                          <tbody>{pF?.serviceCharges.map(sc => renderChargeRow(sc))}</tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app">
      <header style={{ background: 'white', borderBottom: '3px solid var(--jetsmart-cyan)', padding: '0.8rem 0', sticky: 'top', zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <img src="/resources/JetSmart_logo.png" alt="JetSmart" style={{ height: '100px', width: 'auto' }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--jetsmart-navy)', letterSpacing: '5px', opacity: 0.8, marginTop: '20px' }}>API DEBUG</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="icon-btn-secondary" onClick={callToken} disabled={loading} title="Actualizar Token"><RefreshCw size={20} className={loading ? 'spinning' : ''} /></button>
            <button onClick={() => setShowSettings(true)} className="icon-btn-secondary" title="Configuración"><Settings size={20} /></button>
          </div>
        </div>
      </header>

      <main className="container">
        {error && <div className="alert-error" style={{ background: '#fff5f5', color: '#c53030', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>{error}</div>}
        
        <section className="card" style={{ marginTop: '-2rem' }}>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Tipo de viaje</label>
              <div className="radio-group" style={{ gap: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div className={`radio-option ${searchParams.tripType === 'OW' ? 'selected' : ''}`} onClick={() => setSearchParams(p => ({ ...p, tripType: 'OW' }))}><input type="radio" checked={searchParams.tripType === 'OW'} readOnly /> Solo ida</div>
                <div className={`radio-option ${searchParams.tripType === 'RT' ? 'selected' : ''}`} onClick={() => setSearchParams(p => ({ ...p, tripType: 'RT' }))}><input type="radio" checked={searchParams.tripType === 'RT'} readOnly /> Ida y vuelta</div>
              </div>
            </div>
            <CityDropdown label="Origen" value={searchParams.origin} onChange={(v) => setSearchParams(p => ({ ...p, origin: v }))} placeholder="Selecciona origen" icon={MapPin} />
            <CityDropdown label="Destino" value={searchParams.destination} onChange={(v) => setSearchParams(p => ({ ...p, destination: v }))} placeholder="Selecciona destino" icon={Plane} />
            <div className="form-group">
              <label>Fecha ida</label>
              <input type="date" value={searchParams.beginDate} onClick={(e) => e.target.showPicker()} onChange={(e) => setSearchParams(p => ({ ...p, beginDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Fecha vuelta {searchParams.tripType === 'RT' ? '*' : ''}</label>
              <input type="date" value={searchParams.endDate} onClick={(e) => e.target.showPicker()} onChange={(e) => setSearchParams(p => ({ ...p, endDate: e.target.value }))} disabled={searchParams.tripType === 'OW'} style={{ opacity: searchParams.tripType === 'OW' ? 0.4 : 1 }} />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Pasajeros</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select value={searchParams.passengers.ADT} onChange={(e) => handlePassengerChange('ADT', e.target.value)} style={{ flex: 1 }}>{[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n} ADT</option>)}</select>
                <select value={searchParams.passengers.CHD} onChange={(e) => handlePassengerChange('CHD', e.target.value)} style={{ flex: 1 }}>{[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n} CHD</option>)}</select>
                <select value={searchParams.passengers.INFF} onChange={(e) => handlePassengerChange('INFF', e.target.value)} style={{ flex: 1 }}>{[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n} INF</option>)}</select>
              </div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><button type="submit" className="primary" disabled={loading}>{loading ? 'Buscando...' : 'BUSCAR VUELOS'}</button></div>
          </form>
        </section>

        {searchResults && (
          <section className="results-area" style={{ marginTop: '2rem' }}>
            {renderFlightList(`${searchParams.origin}|${searchParams.destination}`, "Ida", 0)}
            {searchParams.tripType === 'RT' && renderFlightList(`${searchParams.destination}|${searchParams.origin}`, "Vuelta", 1)}

            <div className="card" style={{ margin: '2rem 0' }}>
               <div style={{ display:'flex', justifyContent:'space-between', cursor:'pointer' }} onClick={()=>setShowJsonResponse(!showJsonResponse)}><b>JSON Responses (Availability)</b>{showJsonResponse?<ChevronUp/>:<ChevronDown/>}</div>
               {showJsonResponse && (
                  <div style={{ marginTop:'1.5rem' }}>
                     <div className="tabs-header" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button className={`tab-btn ${activeJsonTab === 'JSON' ? 'active' : ''}`} onClick={() => setActiveJsonTab('JSON')}>RAW</button>
                        <button className={`tab-btn ${activeJsonTab === 'VIEW' ? 'active' : ''}`} onClick={() => setActiveJsonTab('VIEW')}>VIEW</button>
                     </div>
                     {activeJsonTab === 'JSON' ? ( 
                        <pre style={{ background: '#272822', color: '#f8f8f2', padding: '1.5rem', borderRadius: '8px', fontSize: '0.8rem', overflow: 'auto', maxHeight: '450px' }}>{JSON.stringify(searchResults, null, 2)}</pre> 
                     ) : ( 
                        <>
                          <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', background: '#f8f9fa', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }}>
                             <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                <input type="text" placeholder="Buscar en el árbol JSON... (ej: 'Fare', 'SCL', 'ADT')" value={jsonSearchTerm} onChange={(e) => { setJsonSearchTerm(e.target.value); setCurrentMatchIndex(0); }} style={{ width: '100%', paddingLeft: '40px', borderRadius: '25px', fontSize: '0.9rem', border: '1px solid #ddd' }} />
                             </div>
                             {matches.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #ddd', paddingLeft: '10px' }}>
                                   <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', fontWeight: 600 }}>{currentMatchIndex + 1} / {matches.length}</span>
                                   <button className="icon-btn-secondary" onClick={() => setCurrentMatchIndex(p => (p - 1 + matches.length) % matches.length)}><ChevronLeft size={16}/></button>
                                   <button className="icon-btn-secondary" onClick={() => setCurrentMatchIndex(p => (p + 1) % matches.length)}><ChevronRight size={16}/></button>
                                </div>
                             )}
                          </div>
                          <JsonViewer src={searchResults} searchTerm={jsonSearchTerm} onMatchesFound={setMatches} currentMatchIndex={currentMatchIndex} idPrefix="avail-json" /> 
                        </>
                     )}
                  </div>
               )}
            </div>

            {isSelectionComplete() && (
               <div className="card" style={{ background: sellResults ? 'var(--jetsmart-navy)' : 'var(--jetsmart-navy)', color: 'white', display: 'flex', justifyContent: 'space-between', padding: '2rem', marginTop: '2rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {sellResults ? <CheckCircle2 color="#27ae60" size={32} /> : <div style={{ width: 12, height: 12, background: 'var(--jetsmart-yellow)', borderRadius: '50%' }} />}
                    <h3 style={{ margin: 0 }}>PASO 4: SELL</h3>
                  </div>
                  {sellResults ? (
                    <button className="secondary" onClick={handleReset} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', background: 'transparent' }}><RotateCcw size={16} style={{ marginRight: '8px' }}/> RESET SESSION</button>
                  ) : (
                    <button className="primary" onClick={handleSell} disabled={loading}>{loading ? 'Solicitando...' : 'SOLICITAR VENTA (SELL)'}</button>
                  )}
               </div>
            )}

            {sellResults && (
              <section className="pax-docs" style={{ marginTop: '2rem' }}>
                {renderSellResults()}
                <div className="card" style={{ margin: '2rem 0' }}>
                   <div style={{ display:'flex', justifyContent:'space-between', cursor:'pointer' }} onClick={()=>setShowSellJsonResponse(!showSellJsonResponse)}><b>JSON Sell results</b>{showSellJsonResponse?<ChevronUp/>:<ChevronDown/>}</div>
                   {showSellJsonResponse && (
                      <div style={{ marginTop:'1.5rem' }}>
                         <div className="tabs-header" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <button className={`tab-btn ${sellActiveJsonTab === 'JSON' ? 'active' : ''}`} onClick={() => setSellActiveJsonTab('JSON')}>RAW</button>
                            <button className={`tab-btn ${sellActiveJsonTab === 'VIEW' ? 'active' : ''}`} onClick={() => setSellActiveJsonTab('VIEW')}>VIEW</button>
                         </div>
                         {sellActiveJsonTab === 'JSON' ? ( 
                            <pre style={{ background: '#272822', color: '#f8f8f2', padding: '1.5rem', borderRadius: '8px', fontSize: '0.8rem', overflow: 'auto', maxHeight: '450px' }}>{JSON.stringify(sellResults, null, 2)}</pre> 
                         ) : ( 
                            <>
                              <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', background: '#f8f9fa', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }}>
                                 <div style={{ position: 'relative', flex: 1 }}>
                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                    <input type="text" placeholder="Buscar en el árbol de Sell JSON..." value={sellJsonSearchTerm} onChange={(e) => { setSellJsonSearchTerm(e.target.value); setSellCurrentMatchIndex(0); }} style={{ width: '100%', paddingLeft: '40px', borderRadius: '25px', fontSize: '0.9rem', border: '1px solid #ddd' }} />
                                 </div>
                                 {sellMatches.length > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #ddd', paddingLeft: '10px' }}>
                                       <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', fontWeight: 600 }}>{sellCurrentMatchIndex + 1} / {sellMatches.length}</span>
                                       <button className="icon-btn-secondary" onClick={() => setSellCurrentMatchIndex(p => (p - 1 + sellMatches.length) % sellMatches.length)}><ChevronLeft size={16}/></button>
                                       <button className="icon-btn-secondary" onClick={() => setSellCurrentMatchIndex(p => (p + 1) % sellMatches.length)}><ChevronRight size={16}/></button>
                                    </div>
                                 )}
                              </div>
                              <JsonViewer src={sellResults} searchTerm={sellJsonSearchTerm} onMatchesFound={setSellMatches} currentMatchIndex={sellCurrentMatchIndex} idPrefix="sell-json" /> 
                            </>
                         )}
                      </div>
                   )}
                </div>

                <h3 className="section-title">DATOS PASAJEROS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                  {Object.keys(sellResults.passengers).map((key, i) => {
                    const st = passengerStatus[key] || { status: 'pending' };
                    const pD = passengersData[key] || {};
                    return (
                      <div key={key} className="card" style={{ borderLeft: st.status==='success'?'12px solid #27ae60':'1px solid #ccc' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem', alignItems: 'center' }}>
                          <b style={{ color: 'var(--jetsmart-navy)', fontSize: '1.1rem' }}>P{i+1}: {sellResults.passengers[key].passengerTypeCode}</b>
                          <button className="primary" onClick={()=>handleSinglePassengerConfirm(key)} disabled={st.status==='success' || addingPassengers} style={{ padding: '0.4rem 1.5rem', fontSize: '0.8rem' }}>{st.status==='success' ? 'Agregado' : 'Agregar'}</button>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem' }}>
                           <div className="form-group"><label>Título</label><select value={pD.title} onChange={e=>setPassengersData(p=>({...p, [key]:{...p[key], title:e.target.value}}))}><option value="MR">Sr.</option><option value="MRS">Sra.</option><option value="MS">Srta.</option></select></div>
                           <div className="form-group"><label>Género</label><select value={pD.gender} onChange={e=>setPassengersData(p=>({...p, [key]:{...p[key], gender:e.target.value}}))}><option value="Male">Masculino</option><option value="Female">Femenino</option></select></div>
                           <div className="form-group"><label>Nombre</label><input value={pD.firstName} onChange={e=>setPassengersData(p=>({...p, [key]:{...p[key], firstName:e.target.value}}))} /></div>
                           <div className="form-group" style={{ gridColumn:'span 2' }}><label>Apellido</label><input value={pD.lastName} onChange={e=>setPassengersData(p=>({...p, [key]:{...p[key], lastName:e.target.value}}))} /></div>
                           <div className="form-group"><label>Nacionalidad</label><select value={pD.nationality} onChange={e=>setPassengersData(p=>({...p, [key]:{...p[key], nationality:e.target.value}}))}><option value="AR">Argentina</option><option value="CL">Chile</option><option value="PE">Perú</option></select></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                   <button className="primary" onClick={handleAddPassengers} disabled={Object.values(passengerStatus).some(s=>s.status==='success')}>Confirmar todos</button>
                </div>
                {Object.keys(passengerStatus).length === Object.keys(sellResults.passengers).length && Object.values(passengerStatus).every(s=>s.status==='success') && !bookingFinal && (
                   <div style={{ marginTop:'4rem', padding:'3rem', border:'5px solid var(--jetsmart-yellow)', textAlign:'center', borderRadius:'20px' }}>
                      <h2 style={{ color: 'var(--jetsmart-navy)' }}>CERRAR RESERVA</h2>
                      <button className="primary" onClick={handleCommit} disabled={committing} style={{ padding:'1.5rem 5rem', fontSize:'1.5rem' }}>COMMIT 1 (CREAR PNR)</button>
                   </div>
                )}
                {renderBookingResult()}
              </section>
            )}
          </section>
        )}
      </main>

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" style={{ width: '850px', maxWidth: '95%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}><b style={{ color: 'var(--jetsmart-navy)' }}>Configuración de API</b><X onClick={() => setShowSettings(false)} style={{ cursor: 'pointer' }} /></div>
            <div style={{ display: 'grid', gap: '1.2rem' }}>
              <div className="form-group"><label>Entorno (Base URL)</label><select value={apiSettings.url} onChange={e => setApiSettings(p => ({...p, url: e.target.value}))}><option value="https://partners-cert.api.jetsmart.com">CERTIFICACIÓN (CERT)</option><option value="https://partners-prod.api.jetsmart.com">PRODUCCIÓN (PROD)</option></select></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                 <div className="form-group"><label>Usuario</label><input type="text" value={apiSettings.username} onChange={e => setApiSettings(p => ({...p, username: e.target.value}))} /></div>
                 <div className="form-group">
                   <label>Contraseña</label>
                   {!apiSettings.isCustomPassword ? (
                     <select value={apiSettings.password} onChange={e => e.target.value === "CUSTOM" ? setApiSettings(p => ({ ...p, isCustomPassword: true, password: '' })) : setApiSettings(p => ({ ...p, password: e.target.value }))}>
                       <option value="">Seleccionar...</option>
                       <option value="mBfzjCe!!3">mBfzjCe!!3</option>
                       <option value="HwLN8s@KXW">HwLN8s@KXW</option>
                       <option value="CUSTOM">Configurar Manualmente...</option>
                     </select>
                   ) : (
                     <div style={{ display: 'flex', gap: '0.4rem' }}>
                       <input type="password" value={apiSettings.password} onChange={e => setApiSettings(p => ({ ...p, password: e.target.value }))} style={{ flex: 1 }} />
                       <button onClick={() => setApiSettings(p => ({ ...p, isCustomPassword: false, password: '' }))} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={18} /></button>
                     </div>
                   )}
                 </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem' }}>
                 <div className="form-group"><label>Dominio</label><input type="text" value={apiSettings.domain} onChange={e => setApiSettings(p => ({...p, domain: e.target.value}))} /></div>
                 <div className="form-group"><label>Locación</label><input type="text" value={apiSettings.location} onChange={e => setApiSettings(p => ({...p, location: e.target.value}))} /></div>
                 <div className="form-group"><label>Canal</label><input type="text" value={apiSettings.channelType} onChange={e => setApiSettings(p => ({...p, channelType: e.target.value}))} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                 <div className="form-group"><label>Moneda</label><input type="text" value={apiSettings.money} onChange={e => setApiSettings(p => ({...p, money: e.target.value}))} /></div>
                 <div className="form-group"><label>Org Code</label><input type="text" value={apiSettings.orgCode} onChange={e => setApiSettings(p => ({...p, orgCode: e.target.value}))} /></div>
              </div>
              <button className="primary" disabled={loading} onClick={() => { callToken(); setShowSettings(false); }} style={{ marginTop: '1rem' }}>{loading ? 'Validando...' : 'Guardar y Obtener Token'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
