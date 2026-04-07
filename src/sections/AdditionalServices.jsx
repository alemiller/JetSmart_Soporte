import React, { useState } from 'react';
import { Luggage, Package, User, Check, Crown, Briefcase, PlusCircle, CreditCard, Plane, Search, X, Filter, Activity, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import JsonViewer from '../components/JsonViewer';
import styles from './AdditionalServices.module.css';

const AdditionalServices = ({ sellResults, apiSettings, onSaveContact, onGetSsrAvailability, onGetSeatmaps, onAssignSeat }) => {
  const [activeStep, setActiveStep] = useState(0); // 0: Contactos, 1: SSR, 2: Seats
  const [ssrs, setSsrs] = useState(null);
  const [loadingSsrs, setLoadingSsrs] = useState(false);
  const [errorSsr, setErrorSsr] = useState(null);
  const [ssrSearch, setSsrSearch] = useState('');
  const [ssrCategory, setSsrCategory] = useState('ALL');
  const [showSsrJson, setShowSsrJson] = useState(false);
  const [seatmap, setSeatmap] = useState(null);
  const [loadingSeatmap, setLoadingSeatmap] = useState(false);
  const [errorSeatmap, setErrorSeatmap] = useState(null);
  const [showAuditStep8, setShowAuditStep8] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState({}); // { paxKey: unitKey }
  const [activePaxKey, setActivePaxKey] = useState(null);
  const [savingSeats, setSavingSeats] = useState(false);
  const [seatSaveSuccess, setSeatSaveSuccess] = useState(false);
  
  // Obtener lista de pasajeros del PNR
  const paxKeys = React.useMemo(() => sellResults?.passengers ? Object.keys(sellResults.passengers) : [], [sellResults]);
  const passengersList = React.useMemo(() => paxKeys.map(k => {
    const p = sellResults.passengers[k];
    const nameData = p.names?.[0] || {};
    return {
      key: k,
      name: (nameData.firstName || '') + ' ' + (nameData.lastName || ''),
      number: p.passengerNumber
    };
  }), [paxKeys, sellResults]);

  // Inicializar pasajero activo
  React.useEffect(() => {
    if (paxKeys.length > 0 && !activePaxKey) {
      setActivePaxKey(paxKeys[0]);
    }
  }, [paxKeys, activePaxKey]);

  const handleSeatClick = (u) => {
    if (u.availability !== 5) return;
    if (!activePaxKey) return;
    
    // Evitar que dos personas elijan el mismo asiento
    const isAlreadyTakenByOther = Object.entries(selectedSeats).some(([pk, uk]) => pk !== activePaxKey && uk === u.unitKey);
    if (isAlreadyTakenByOther) return;

    setSelectedSeats(prev => ({ ...prev, [activePaxKey]: u.unitKey }));
    
    // Avanzar al siguiente pasajero automáticamente
    const currentIndex = paxKeys.indexOf(activePaxKey);
    if (currentIndex < paxKeys.length - 1) {
      setActivePaxKey(paxKeys[currentIndex + 1]);
    }
  };

  const handleSaveSeats = async () => {
    setSavingSeats(true);
    setSeatSaveSuccess(false);
    try {
      for (const paxKey of paxKeys) {
        const unitKey = selectedSeats[paxKey];
        if (unitKey) {
          await onAssignSeat(paxKey, unitKey);
        }
      }
      setSeatSaveSuccess(true);
      setTimeout(() => setSeatSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Error asignando asientos: ' + e.message);
    } finally {
      setSavingSeats(false);
    }
  };

  const isSeatsComplete = paxKeys.length > 0 && paxKeys.every(k => selectedSeats[k]);
  
  const [contactForm, setContactForm] = useState({
    contactTypeCode: 'P',
    title: 'Mr',
    firstName: '',
    lastName: '',
    cultureCode: 'pt-CO',
    emailAddress: '',
    phone: '',
    distributionOption: 2,
    customerNumber: '',
    lineOne: '',
    lineTwo: '',
    city: '',
    postalCode: '',
    countryCode: 'AR',
    provinceState: '',
    companyName: ''
  });

  const [savingContact, setSavingContact] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch SSRs only when entering the step and if not already fetched
  React.useEffect(() => {
    if (activeStep === 1 && !ssrs && !loadingSsrs) {
      const fetchSsrs = async () => {
        setLoadingSsrs(true);
        setErrorSsr(null);
        try {
          const data = await onGetSsrAvailability();
          setSsrs(data || {});
        } catch (e) {
          setErrorSsr(e.message);
          console.error("Error fetching SSRs:", e);
        } finally {
          setLoadingSsrs(false);
        }
      };
      fetchSsrs();
    }
  }, [activeStep, ssrs, loadingSsrs, onGetSsrAvailability]);

  if (!sellResults) return null;

  const allPassengers = sellResults.passengers ? Object.values(sellResults.passengers) : [];

  const handleSave = async () => {
    setSavingContact(true);
    setSaveSuccess(false);
    try {
      const rq = {
        contactTypeCode: contactForm.contactTypeCode,
        phoneNumbers: [{ type: "Home", number: contactForm.phone }],
        cultureCode: contactForm.cultureCode,
        address: {
          lineOne: contactForm.lineOne,
          lineTwo: contactForm.lineTwo,
          lineThree: "",
          countryCode: contactForm.countryCode,
          provinceState: contactForm.provinceState,
          city: contactForm.city,
          postalCode: contactForm.postalCode
        },
        emailAddress: contactForm.emailAddress,
        customerNumber: contactForm.customerNumber,
        sourceOrganization: apiSettings.orgCode,
        distributionOption: contactForm.distributionOption,
        companyName: contactForm.companyName,
        name: {
          first: contactForm.firstName,
          middle: "",
          last: contactForm.lastName,
          title: contactForm.title,
          suffix: ""
        }
      };
      
      await onSaveContact(rq);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingContact(false);
    }
  };

  const handleClear = () => {
    setContactForm({
      contactTypeCode: 'P', title: 'Mr', firstName: '', lastName: '', 
      cultureCode: 'pt-CO', emailAddress: '', phone: '', distributionOption: 2,
      customerNumber: '', lineOne: '', lineTwo: '', city: '', postalCode: '',
      countryCode: 'AR', provinceState: '', companyName: ''
    });
  };

  // Step 8: Fetch seatmap when entering
  React.useEffect(() => {
    if (activeStep === 2 && !seatmap && !loadingSeatmap && !errorSeatmap) {
      const loadData = async () => {
        setLoadingSeatmap(true);
        setErrorSeatmap(null);
        try {
          const res = await onGetSeatmaps();
          setSeatmap(res);
        } catch (e) {
          setErrorSeatmap(e.message || 'Error fetching seatmap');
        } finally {
          setLoadingSeatmap(false);
        }
      };
      loadData();
    }
  }, [activeStep, seatmap, loadingSeatmap, errorSeatmap, onGetSeatmaps]);

  const updateField = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  // Helper to render real SSR list from NAPI structure
  const renderSsrList = () => {
    if (loadingSsrs) return <div style={{ textAlign: 'center', padding: '3rem' }}><p>Buscando disponibilidad en NAPI...</p><div className="loading-spinner" style={{ margin: 'auto' }}></div></div>;
    
    if (errorSsr) return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#e74c3c' }}>
        <p style={{ fontWeight: 'bold' }}>Error al obtener disponibilidad de SSRs:</p>
        <pre style={{ fontSize: '0.7rem', background: '#fff0f0', padding: '15px', borderRadius: '12px', border: '1px solid #ffccbc', maxWidth: '80%', margin: '15px auto', overflow: 'auto', textAlign: 'left', lineHeight: '1.4' }}>{errorSsr}</pre>
        <button className="secondary" onClick={() => { setSsrs(null); setErrorSsr(null); }} style={{ height: '40px', padding: '0 30px' }}>REINTENTAR CONSULTA</button>
      </div>
    );
    
    // Extract unique SSRs 
    const ssrMap = new Map();
    const journeyList = ssrs?.data?.journeySsrs || ssrs?.journeySsrs || [];
    const segmentList = ssrs?.data?.segmentSsrs || ssrs?.segmentSsrs || [];
    
    const pKeys = Object.keys(sellResults.passengers);
    const firstPaxKey = pKeys[0];

    const processSsrList = (list) => {
      if (!list || !Array.isArray(list)) return;
      list.forEach(item => {
        if (item.ssrs && Array.isArray(item.ssrs)) {
          item.ssrs.forEach(s => {
            if (!ssrMap.has(s.ssrCode)) {
              let price = 0;
              if (s.passengersAvailability) {
                const pAvail = s.passengersAvailability[firstPaxKey] || Object.values(s.passengersAvailability)[0];
                price = pAvail?.price ?? 0;
              }
              ssrMap.set(s.ssrCode, {
                code: s.ssrCode,
                name: s.name || s.ssrCode,
                price: price,
                feeCode: s.feeCode
              });
            }
          });
        }
      });
    };

    processSsrList(journeyList);
    processSsrList(segmentList);

    const fullList = Array.from(ssrMap.values());

    if (fullList.length === 0) return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
        <p>No se encontraron SSRs disponibles para esta ruta/pasajeros ({pKeys.length} pax).</p>
        <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee', maxWidth: '800px', margin: '20px auto', textAlign: 'left' }}>
          <b style={{ fontSize: '0.7rem', color: 'var(--jetsmart-navy)' }}>DEBUG: ESTRUCTURA RECIBIDA DE NAPI</b>
          <pre style={{ fontSize: '0.65rem', overflow: 'auto', maxHeight: '250px', marginTop: '10px', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
            {JSON.stringify(ssrs, null, 2)}
          </pre>
        </div>
        <button className="secondary" onClick={() => { setSsrs(null); }} style={{ marginTop: '10px', height: '40px', padding: '0 30px' }}>REINTENTAR CONSULTA</button>
      </div>
    );

    // Filtering logic
    const filteredEntries = fullList.filter(s => {
      const matchSearch = s.code.toLowerCase().includes(ssrSearch.toLowerCase()) || 
                          s.name.toLowerCase().includes(ssrSearch.toLowerCase());
      
      let matchCat = true;
      const code = s.code.toUpperCase();
      if (ssrCategory === 'BAG') matchCat = code.includes('BAG') || code.includes('SPQ') || code.includes('2PI');
      else if (ssrCategory === 'WCH') matchCat = code.startsWith('WC') || code.startsWith('WCH') || ['BLND', 'DEAF', 'SRVA', 'ADAE', 'DEPA', 'DEPU', 'INAD'].includes(code);
      else if (ssrCategory === 'ST') matchCat = code.startsWith('ST');
      else if (ssrCategory === 'FLX') matchCat = code.includes('FLX') || code.includes('VIP') || code.includes('PB') || code.includes('AP') || code.includes('MOD') || code.includes('RFND');
      else if (ssrCategory === 'OTHER') matchCat = !code.includes('BAG') && !code.includes('SPQ') && !code.includes('2PI') && !code.startsWith('WC') && !code.startsWith('ST') && !code.includes('FLX') && !code.includes('VIP') && !code.includes('PB') && !code.includes('AP');
      
      return matchSearch && (ssrCategory === 'ALL' || matchCat);
    });

    const categoriesList = [
      { id: 'ALL', label: 'TODO', icon: <Package size={14} /> },
      { id: 'BAG', label: 'EQUIPAJE', icon: <Luggage size={14} /> },
      { id: 'WCH', label: 'ASISTENCIA', icon: <Activity size={14} /> },
      { id: 'ST', label: 'ASIENTOS', icon: <Plane size={14} /> },
      { id: 'FLX', label: 'FLEX/VIP', icon: <Crown size={14} /> },
      { id: 'OTHER', label: 'OTROS', icon: <PlusCircle size={14} /> }
    ];

    return (
      <div style={{ width: '100%' }}>
        {/* Herramientas de Filtro */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8f9fa', padding: '1.2rem', borderRadius: '18px', border: '1px solid #eee' }}>
           <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
             <div style={{ flex: 1, position: 'relative' }}>
               <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
               <input 
                 className="form-control" 
                 placeholder="Busca por código o nombre (ej: XBAG, Silla de ruedas...)" 
                 value={ssrSearch}
                 onChange={e => setSsrSearch(e.target.value)}
                 style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.9rem' }}
               />
               {ssrSearch && (
                 <X 
                   size={16} 
                   onClick={() => setSsrSearch('')}
                   style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#666' }} 
                 />
               )}
             </div>
             <div style={{ fontSize: '0.8rem', color: '#666', background: '#fff', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #eee', fontWeight: 600 }}>
               {filteredEntries.length} SERVICIOS
             </div>
           </div>
           
           <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
             {categoriesList.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSsrCategory(cat.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '25px', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    backgroundColor: ssrCategory === cat.id ? 'var(--jetsmart-navy)' : '#eee',
                    color: ssrCategory === cat.id ? 'white' : '#666'
                  }}
                >
                  {cat.icon} {cat.label}
                </button>
             ))}
           </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#fafafa', borderRadius: '20px', border: '2px dashed #ddd' }}>
            <Filter size={40} color="#ccc" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#999' }}>Ningún servicio coincide con tu búsqueda actual.</p>
            <button className="secondary" onClick={() => { setSsrSearch(''); setSsrCategory('ALL'); }} style={{ fontSize: '0.8rem' }}>LIMPIAR FILTROS</button>
          </div>
        ) : (
          <div className={styles.ssrGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
            {filteredEntries.map((s) => (
              <div key={s.code} className={styles.ssrCard} style={{ WebkitUserSelect: 'none', position: 'relative', background: 'white', padding: '1rem', borderRadius: '18px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.3s' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.6rem', color: 'var(--jetsmart-cyan)', fontWeight: 950 }}>
                   #{s.code}
                </div>
                
                <div style={{ marginBottom: '0.8rem', padding: '10px', background: '#f5faff', borderRadius: '50%', color: 'var(--jetsmart-navy)' }}>
                  {s.code.includes('BAG') || s.code.includes('SPQ') ? <Luggage size={20} /> : 
                   s.code.startsWith('WC') ? <Activity size={20} /> :
                   s.code.startsWith('ST') ? <Plane size={20} /> :
                   s.code.includes('VIP') || s.code.includes('PB') ? <Crown size={20} /> :
                   <PlusCircle size={20} />}
                </div>

                <b style={{ fontSize: '0.7rem', height: '2.2rem', display: 'block', overflow: 'hidden', lineHeight: '1.2', color: '#444' }}>{s.name}</b>
                <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f0f0f0', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <span style={{ fontSize: '1rem', fontWeight: 950, color: 'var(--jetsmart-navy)' }}>
                      {s.price.toLocaleString()} <span style={{ fontSize: '0.7rem' }}>{apiSettings.money}</span>
                   </span>
                   <button className="secondary" style={{ width: '100%', padding: '5px', height: '30px', fontSize: '0.7rem' }}>AGREGAR</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className={styles.servicesContainer}>
      <div className={styles.serviceHeader}>
        <h2 className={styles.serviceTitle}>
          <Package size={28} color="var(--jetsmart-cyan)" />
          PASOS OPCIONALES: MEJORA TU VIAJE
        </h2>
        <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
          MÁS SERVICIOS = MÁS AUDITORÍA
        </span>
      </div>

      <div className={styles.serviceStepper}>
        {[
          { icon: <Briefcase size={18} />, label: '6. CONTACTOS' },
          { icon: <PlusCircle size={18} />, label: '7. SSR' },
          { icon: <Plane size={18} />, label: '8. ASIENTOS' }
        ].map((step, idx) => (
          <button 
            key={idx} 
            className={`${styles.stepButton} ${activeStep === idx ? styles.stepActive : ''}`}
            onClick={() => setActiveStep(idx)}
          >
            {step.icon} {step.label}
          </button>
        ))}
      </div>

      <div className={styles.contentArea}>
        {/* Paso 6: Contactos */}
        {activeStep === 0 && (
          <div className={styles.paxBaggageGrid} style={{ gridTemplateColumns: '1fr' }}>
             {/* Contacto Principal (P) */}
             <div className={styles.paxBaggageCard}>
                <div className={styles.paxBaggageName}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} /> GESTIÓN DE CONTACTO
                  </div>
                  <select 
                    value={contactForm.contactTypeCode} 
                    onChange={e => updateField('contactTypeCode', e.target.value)}
                    style={{ padding: '4px 10px', borderRadius: '10px', fontSize: '0.7rem' }}
                  >
                    <option value="P">Principal (P)</option>
                    <option value="A">Travel Agency (A)</option>
                    <option value="I">Facturación (I)</option>
                    <option value="B">Payer (B)</option>
                  </select>
                </div>
                
                <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                   {/* Sección 1: Nombre */}
                   <div style={{ padding: '1rem', background: '#fcfcfc', borderRadius: '16px', border: '1px solid #eee' }}>
                      <b style={{ fontSize: '0.75rem', display: 'block', marginBottom: '1rem', color: 'var(--jetsmart-cyan)' }}>NOMBRE Y CULTURA</b>
                      <div style={{ display: 'grid', gap: '1rem' }}>
                         <div className="form-group">
                            <label style={{ fontSize: '0.65rem' }}>Título</label>
                            <input value={contactForm.title} onChange={e => updateField('title', e.target.value)} style={{ width: '100%', padding: '0.6rem' }} />
                         </div>
                         <div className="form-group">
                            <label style={{ fontSize: '0.65rem' }}>Nombre (First)</label>
                            <input value={contactForm.firstName} onChange={e => updateField('firstName', e.target.value)} placeholder="Alejandro" style={{ width: '100%', padding: '0.6rem' }} />
                         </div>
                         <div className="form-group">
                            <label style={{ fontSize: '0.65rem' }}>Apellido (Last)</label>
                            <input value={contactForm.lastName} onChange={e => updateField('lastName', e.target.value)} placeholder="Miller" style={{ width: '100%', padding: '0.6rem' }} />
                         </div>
                         <div className="form-group">
                            <label style={{ fontSize: '0.65rem' }}>Culture (cultureCode)</label>
                            <input value={contactForm.cultureCode} onChange={e => updateField('cultureCode', e.target.value)} style={{ width: '100%', padding: '0.6rem' }} />
                         </div>
                      </div>
                   </div>

                   {/* Sección 2: Comunicación y Técnica */}
                   <div style={{ padding: '1rem', background: '#fcfcfc', borderRadius: '16px', border: '1px solid #eee' }}>
                      <b style={{ fontSize: '0.75rem', display: 'block', marginBottom: '1rem', color: 'var(--jetsmart-cyan)' }}>CANALES Y TÉCNICO</b>
                      <div style={{ display: 'grid', gap: '1rem' }}>
                         <div className="form-group">
                            <label style={{ fontSize: '0.65rem' }}>Email Principal</label>
                            <input value={contactForm.emailAddress} onChange={e => updateField('emailAddress', e.target.value)} placeholder="correo@ejemplo.com" style={{ width: '100%', padding: '0.6rem' }} />
                         </div>
                         <div className="form-group">
                            <label style={{ fontSize: '0.65rem' }}>Teléfono (Número)</label>
                            <input value={contactForm.phone} onChange={e => updateField('phone', e.target.value)} placeholder="54 11..." style={{ width: '100%', padding: '0.6rem' }} />
                         </div>
                         <div className="form-group">
                            <label style={{ fontSize: '0.65rem' }}>Dist. Option</label>
                            <input type="number" value={contactForm.distributionOption} onChange={e => updateField('distributionOption', parseInt(e.target.value))} style={{ width: '100%', padding: '0.6rem' }} />
                         </div>
                         <div className="form-group">
                            <label style={{ fontSize: '0.65rem' }}>Cust. Number</label>
                            <input value={contactForm.customerNumber} onChange={e => updateField('customerNumber', e.target.value)} style={{ width: '100%', padding: '0.6rem' }} />
                         </div>
                      </div>
                   </div>

                   {/* Sección 3: Dirección */}
                   <div style={{ padding: '1rem', background: '#fcfcfc', borderRadius: '16px', border: '1px solid #eee' }}>
                      <b style={{ fontSize: '0.75rem', display: 'block', marginBottom: '1rem', color: 'var(--jetsmart-cyan)' }}>DIRECCIÓN (ADDRESS)</b>
                      <div style={{ display: 'grid', gap: '0.8rem' }}>
                         <input value={contactForm.lineOne} onChange={e => updateField('lineOne', e.target.value)} placeholder="Line One" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }} />
                         <input value={contactForm.lineTwo} onChange={e => updateField('lineTwo', e.target.value)} placeholder="Line Two" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }} />
                         <div style={{ display: 'flex', gap: '4px' }}>
                           <input value={contactForm.city} onChange={e => updateField('city', e.target.value)} placeholder="City" style={{ flex: 2, padding: '0.5rem', fontSize: '0.8rem' }} />
                           <input value={contactForm.postalCode} onChange={e => updateField('postalCode', e.target.value)} placeholder="Postal" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }} />
                         </div>
                         <div style={{ display: 'flex', gap: '4px' }}>
                           <input value={contactForm.countryCode} onChange={e => updateField('countryCode', e.target.value)} placeholder="Country" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }} />
                           <input value={contactForm.provinceState} onChange={e => updateField('provinceState', e.target.value)} placeholder="Prov" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }} />
                         </div>
                         <div style={{ marginTop: '0.5rem' }}>
                            <label style={{ fontSize: '0.6rem', color: '#999' }}>Empresa (Company Name)</label>
                            <input value={contactForm.companyName} onChange={e => updateField('companyName', e.target.value)} placeholder="JetSmart Corp" style={{ width: '100%', padding: '0.5rem', fontSize: '0.7rem' }} />
                         </div>
                      </div>
                   </div>
                </div>
                <div style={{ padding: '1rem 2rem', background: '#f8f9fa', borderTop: '1px solid #eee', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                   {saveSuccess && <span style={{ color: '#27ae60', alignSelf: 'center', fontSize: '0.8rem', fontWeight: 900 }}>✓ CONTACTO GUARDADO</span>}
                   <button 
                     className="secondary" 
                     onClick={handleClear}
                     style={{ height: '44px', padding: '0 25px', display: 'flex', alignItems: 'center' }}
                   >
                     LIMPIAR
                   </button>
                   <button 
                     className="primary" 
                     onClick={handleSave}
                     disabled={savingContact}
                     style={{ height: '44px', padding: '0 35px', display: 'flex', alignItems: 'center' }}
                   >
                     {savingContact ? 'GUARDANDO...' : 'GUARDAR CONTACTO'}
                   </button>
                </div>
             </div>

             {/* Opción de agregar otro */}
             <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button className="secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px', borderStyle: 'dashed' }}>
                   <PlusCircle size={18} /> AGREGAR CONTACTO ADICIONAL (A, I, B...)
                </button>
             </div>
          </div>
        )}

        {/* Paso 7: SSRs */}
        {activeStep === 1 && (
          <>
            {renderSsrList()}
            {/* SSR Audit Section */}
            {ssrs && (
              <div className="card" style={{ marginTop: '3rem', padding: '1.2rem', background: '#fff', borderRadius: '18px', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowSsrJson(!showSsrJson)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Search size={22} color="var(--jetsmart-navy)" />
                    <b style={{ fontSize: '1rem' }}>VER RESPUESTA JSON SSR (API AUDIT)</b>
                  </div>
                  {showSsrJson ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {showSsrJson && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <JsonViewer src={ssrs} idPrefix="ssr-audit-json" />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Paso 8: Asientos */}
        {activeStep === 2 && (
          <>
            <div className={styles.seatMapContainer}>
             {loadingSeatmap && <div style={{ textAlign: 'center', padding: '3rem' }}><p>Obteniendo mapa de asientos NAPI...</p><div className="loading-spinner" style={{ margin: 'auto' }}></div></div>}
             {errorSeatmap && (
               <div style={{ textAlign: 'center', padding: '2rem', color: '#e74c3c' }}>
                 <p style={{ fontWeight: 700 }}>Error: {errorSeatmap}</p>
                 <button className="secondary" onClick={() => setErrorSeatmap(null)} style={{ marginTop: '15px' }}>REINTENTAR</button>
               </div>
             )}
             
             {!loadingSeatmap && !errorSeatmap && seatmap?.data?.[0]?.seatMap && (() => {
               const mapData = seatmap.data[0].seatMap;
               const allUnits = [];
               
               // Extraer todas las unidades de todos los decks/compartidmentos
               Object.values(mapData.decks || {}).forEach(deck => {
                 Object.values(deck.compartments || {}).forEach(comp => {
                   (comp.units || []).forEach(unit => {
                     if (unit.type === 1) allUnits.push(unit); // Tipo 1 = Asiento
                   });
                 });
               });

               // Agrupar por Y (Filas)
               const rowsMap = allUnits.reduce((acc, unit) => {
                 if (!acc[unit.y]) acc[unit.y] = [];
                 acc[unit.y].push(unit);
                 return acc;
               }, {});

               const sortedY = Object.keys(rowsMap).sort((a, b) => Number(a) - Number(b));

               return (
                 <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '2rem' }}>
                   <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <h3 style={{ margin: 0, fontWeight: 950, color: 'var(--jetsmart-navy)' }}>
                        {mapData.name} - {mapData.departureStation} ➔ {mapData.arrivalStation}
                      </h3>
                      <p style={{ color: '#666', fontSize: '0.85rem' }}>Equipamiento: {mapData.equipmentType} ({mapData.availableUnits} asientos disponibles)</p>
                   </div>

                      {/* Leyenda de Asientos */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className={`${styles.seat} ${styles.seatPremium}`} style={{ width: '25px', height: '25px', cursor: 'default' }}></div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>LEGROOM / PREMIUM</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className={styles.seat} style={{ width: '25px', height: '25px', cursor: 'default' }}></div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>DISPONIBLE</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className={`${styles.seat} ${styles.seatUnavailable}`} style={{ width: '25px', height: '25px', cursor: 'default' }}></div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>OCUPADO / BLOQUEADO</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className={styles.seat} style={{ width: '25px', height: '25px', background: 'var(--jetsmart-cyan)', borderColor: 'var(--jetsmart-navy)', color: 'white', cursor: 'default' }}></div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>SELECCIONADO</span>
                        </div>
                      </div>

                      {/* Selector de Pasajeros */}
                      <div style={{ background: '#f0f2f5', padding: '15px', borderRadius: '15px', marginBottom: '25px', display: 'flex', gap: '10px', overflowX: 'auto' }}>
                        {passengersList.map(p => {
                          const hasSeat = selectedSeats[p.key];
                          const isActive = activePaxKey === p.key;
                          return (
                            <button
                              key={p.key}
                              onClick={() => setActivePaxKey(p.key)}
                              style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: isActive ? '2px solid var(--jetsmart-navy)' : '2px solid transparent',
                                background: isActive ? 'var(--jetsmart-navy)' : (hasSeat ? '#eefdf0' : 'white'),
                                color: isActive ? 'white' : 'var(--jetsmart-navy)',
                                fontSize: '0.85rem',
                                fontWeight: 950,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                boxShadow: isActive ? '0 5px 15px rgba(0,0,0,0.2)' : 'none'
                              }}
                            >
                              {isActive ? <Crown size={16} /> : (hasSeat ? <Check size={16} color="#28a745" /> : <User size={16} />)}
                              {p.number}. {p.name}
                              {hasSeat && <span style={{ marginLeft: '5px', fontSize: '0.7rem', opacity: 0.8 }}>({selectedSeats[p.key].split('!').slice(-2, -1)})</span>}
                            </button>
                          );
                        })}
                      </div>

                      <div className={styles.planeBody} style={{ margin: 'auto', maxWidth: '400px' }}>
                         {/* Cabecera de letras */}
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 40px) 30px repeat(3, 40px)', gap: '10px', marginBottom: '15px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 900, color: '#999' }}>
                            <span>A</span><span>B</span><span>C</span><span></span><span>D</span><span>E</span><span>F</span>
                         </div>
                         
                         {sortedY.map((y) => {
                           const unitsRow = rowsMap[y];
                           const rowNum = unitsRow[0].designator.replace(/[A-Z]/g, '');
                           
                           const renderUnit = (letter) => {
                             const u = unitsRow.find(unit => unit.designator.endsWith(letter));
                             if (!u) {
                               return <div className={`${styles.seat} ${styles.seatUnavailable}`} title="No disponible por configuración">{letter}</div>;
                             }

                             // Verificar si este asiento está seleccionado por algún pasajero
                             const assignedPaxKey = Object.keys(selectedSeats).find(pk => selectedSeats[pk] === u.unitKey);
                             const isSelectedByMe = assignedPaxKey === activePaxKey;
                             const isSelectedByAny = !!assignedPaxKey;

                             const isPremium = u.properties?.some(p => p.code === 'LEGROOM' && p.value === 'True');
                             const isAvailable = u.availability === 5;

                             return (
                               <div 
                                 key={u.unitKey} 
                                 onClick={() => handleSeatClick(u)}
                                 className={`
                                   ${styles.seat} 
                                   ${!isAvailable ? styles.seatUnavailable : ''} 
                                   ${isPremium ? styles.seatPremium : ''}
                                 `}
                                 style={isSelectedByAny ? {
                                   background: isSelectedByMe ? 'var(--jetsmart-cyan)' : '#e0e0e0',
                                   borderColor: 'var(--jetsmart-navy)',
                                   color: isSelectedByMe ? 'white' : '#666',
                                   transform: 'scale(1.1)',
                                   boxShadow: '0 5px 15px rgba(0,175,236,0.4)',
                                   zIndex: 2
                                 } : {}}
                                 title={`${u.designator} - ${isAvailable ? 'Disponible' : 'Ocupado'}`}
                               >
                                 {isSelectedByAny ? passengersList.find(p => p.key === assignedPaxKey)?.name.charAt(0) : letter}
                               </div>
                             );
                           };

                           return (
                             <div key={y} className={styles.seatGrid} style={{ marginBottom: '8px' }}>
                               {[ 'A', 'B', 'C' ].map(letter => <React.Fragment key={letter}>{renderUnit(letter)}</React.Fragment>)}
                               <div className={styles.aisle}>{rowNum}</div>
                               {[ 'D', 'E', 'F' ].map(letter => <React.Fragment key={letter}>{renderUnit(letter)}</React.Fragment>)}
                             </div>
                           );
                         })}
                      </div>

                      {/* Botón de Guardado */}
                      <div style={{ marginTop: '3rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                         {seatSaveSuccess && <span style={{ color: '#27ae60', fontSize: '0.9rem', fontWeight: 900 }}>✓ ASIENTOS ASIGNADOS CORRECTAMENTE</span>}
                         <button 
                           className="primary"
                           disabled={!isSeatsComplete || savingSeats}
                           onClick={handleSaveSeats}
                           style={{
                             height: '54px',
                             padding: '0 45px',
                             fontSize: '1.1rem',
                             fontWeight: 950,
                             borderRadius: '20px',
                             boxShadow: isSeatsComplete && !savingSeats ? '0 10px 20px rgba(0,175,236,0.3)' : 'none'
                           }}
                         >
                           {savingSeats ? 'ASIGNANDO...' : (seatSaveSuccess ? '¡GUARDADO!' : 'CONFIRMAR Y AGREGAR ASIENTOS')}
                         </button>
                      </div>
                   </div>
                 );
               })()}

          </div>

          {/* Consolidated Step 8 Technical Audit (Full Width) */}
          {(sellResults || seatmap) && (
            <div className="card" style={{ marginTop: '4rem', width: '100%', padding: '1.5rem', background: '#fff', borderRadius: '24px', border: '1px solid #eee' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowAuditStep8(!showAuditStep8)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Activity size={22} color="var(--jetsmart-navy)" />
                    <b style={{ fontSize: '1.1rem' }}>CONSOLA TÉCNICA - PASO 8 (API AUDIT)</b>
                  </div>
                  {showAuditStep8 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
               </div>

               {showAuditStep8 && (
                 <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {seatmap && (
                      <div>
                         <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '10px 18px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900, color: 'var(--jetsmart-navy)', borderLeft: '4px solid var(--jetsmart-cyan)' }}>
                            RESPUESTA JSON: SEATMAP (AIRCRAFT LAYOUT & FEES)
                         </div>
                         <JsonViewer src={seatmap} idPrefix="audit-step8-map" />
                      </div>
                    )}
                    
                    {sellResults && (
                      <div>
                         <div style={{ marginBottom: '1rem', background: '#f8f9fa', padding: '10px 18px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900, color: '#999', borderLeft: '4px solid #ddd' }}>
                            REFERENCIA: SELL / SEGMENTOS (IDENTIFICADORES)
                         </div>
                         <JsonViewer src={sellResults} idPrefix="audit-step8-sell" />
                      </div>
                    )}
                 </div>
               )}
            </div>
          )}
        </>
      )}
      </div>
    </section>
  );
};

const BaggageOption = ({ icon, title, desc, price, selected }) => (
  <div className={`${styles.bagOption} ${selected ? styles.bagSelected : ''}`}>
    <div className={styles.bagIcon}>{icon}</div>
    <div className={styles.bagInfo}>
      <b className={styles.bagTitle}>{title}</b>
      <span className={styles.bagDesc}>{desc}</span>
    </div>
    <div className={styles.bagPrice}>{price}</div>
  </div>
);

const SsrCard = ({ icon, name, price }) => (
  <div className={styles.ssrCard}>
    <div className={styles.ssrIcon}>{icon}</div>
    <b className={styles.ssrName}>{name}</b>
    <span className={styles.ssrPrice}>{price}</span>
    <button className="secondary" style={{ padding: '6px 15px', fontSize: '0.7rem' }}>AGREGAR</button>
  </div>
);

export default AdditionalServices;
