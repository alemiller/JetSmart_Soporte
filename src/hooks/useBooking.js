import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DEFAULT_SEARCH, DEFAULT_SETTINGS } from '../constants';

export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState(DEFAULT_SEARCH);
  const [apiSettings, setApiSettings] = useState(() => {
    const saved = localStorage.getItem('jetsmart_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [token, setToken] = useState(localStorage.getItem('jetsmart_token') || '');
  const [searchResults, setSearchResults] = useState(null);
  const [sellResults, setSellResults] = useState(null);
  const [bookingFinal, setBookingFinal] = useState(null);
  const [passengerStatus, setPassengerStatus] = useState({});
  const [passengersData, setPassengersData] = useState({});
  const [lastSellRequest, setLastSellRequest] = useState(null);
  const [selectedFares, setSelectedFares] = useState({});

  useEffect(() => {
    localStorage.setItem('jetsmart_settings', JSON.stringify(apiSettings));
  }, [apiSettings]);

  useEffect(() => {
    localStorage.setItem('jetsmart_token', token);
  }, [token]);

  const callToken = async () => {
    setLoading(true); setError(null);
    setToken(''); 
    setSearchResults(null); setSellResults(null); setSelectedFares({});
    setLastSellRequest(null);
    try {
      const data = await apiService.fetchToken(apiSettings);
      const newToken = data.token || (data.data?.token) || (typeof data === 'string' ? data : null);
      if (!newToken) {
        throw new Error("⚠️ Sesión exitosa pero TOKEN NO ENCONTRADO en el JSON recibido:\n" + JSON.stringify(data, null, 2));
      }
      setToken(newToken);
      localStorage.setItem('jetsmart_token', newToken);
      return newToken;
    } catch (e) { 
      setError(e.message); 
      return null;
    } finally { setLoading(false); }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true); setError(null);
    if (!token) { setError("⚠️ Por favor, obtén un Token válido desde la cabecera antes de buscar vuelos."); setLoading(false); return; }
    try {
      const data = await apiService.search(searchParams, apiSettings, token);
      setSearchResults(data);
      setSellResults(null); setBookingFinal(null); setSelectedFares({});
      setLastSellRequest(null);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const handleSell = async () => {
    setLoading(true); setError(null);
    try {
      const selection = Object.values(selectedFares).map(sel => ({
        journeyKey: sel.fareData.journeyKey,
        fareAvailabilityKey: sel.fareKey
      }));
      
      const rq = {
        passengers: {
          types: [
            { type: 'ADT', count: searchParams.passengers.ADT || 0, discountCode: "" },
            { type: 'CHD', count: searchParams.passengers.CHD || 0, discountCode: "" }
          ].filter(p => p.count > 0)
        },
        keys: selection.map(s => ({ 
          fareAvailabilityKey: s.fareAvailabilityKey, 
          inventoryControl: "HoldSpace",
          journeyKey: s.journeyKey, 
          standbyPriorityCode: ""
        })),
        preventOverlap: true,
        sourceOrganization: apiSettings.orgCode,
        applyServiceBundle: 0,
        suppressPassengerAgeValidation: true,
        currencyCode: apiSettings.money,
        infantCount: searchParams.passengers.INFF || 0,
        serviceBundleCodes: []
      };
      
      setLastSellRequest(rq);

      const data = await apiService.sellRaw(rq, apiSettings, token);
      setSellResults(data);
      setPassengerStatus({});
      
      if (data && data.passengers) {
        setPassengersData(Object.keys(data.passengers).reduce((acc, key) => {
          acc[key] = { title: 'Mr', firstName: '', lastName: '', dob: '', gender: 'Male', nationality: 'AR' };
          return acc;
        }, {}));
      }
    } catch (e) { 
      setError(e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleCommit = async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiService.commit(apiSettings, token);
      setBookingFinal(data);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  // Re-integrating the passenger confirm logic to use the correct token structure
  const handleSinglePassengerConfirm = async (key, t) => {
    setPassengerStatus(prev => ({ ...prev, [key]: { status: 'loading', message: 'Confirmando...' } }));
    try {
      const pData = passengersData[key];
      const paxType = sellResults.passengers[key]?.passengerTypeCode;
      const isInfant = paxType === 'INFF';
      
      const baseUrl = apiSettings.url.includes('cert') ? '/api-cert' : '/api-prod';
      const endpoint = isInfant ? `${baseUrl}/api/nsk/v3/booking/passengers/${key}/infant` : `${baseUrl}/api/nsk/v3/booking/passengers/${key}`;

      const body = isInfant ? {
         name: { first: pData.firstName, last: pData.lastName, title: pData.title },
         dateOfBirth: pData.dob,
         gender: pData.gender,
         nationality: pData.nationality
      } : { 
         name: { first: pData.firstName, last: pData.lastName, title: pData.title },
         info: { nationality: pData.nationality, gender: pData.gender, dateOfBirth: pData.dob }
      };

      const res = await fetch(endpoint, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', 'Authorization': t }, 
        body: JSON.stringify(body) 
      });

      const d = await res.json();
      if (!res.ok) {
        setPassengerStatus(prev => ({ ...prev, [key]: { status: 'error', message: 'Error en API' } }));
        setError(`⚠️ Error al agregar pasajero ${paxType} (${key}):\n` + JSON.stringify(d, null, 2));
        return;
      }
      setPassengerStatus(prev => ({ ...prev, [key]: { status: 'success', message: 'OK' } }));
    } catch (e) { 
      setPassengerStatus(prev => ({ ...prev, [key]: { status: 'error', message: e.message } })); 
      setError(`⚠️ Excepción al confirmar pasajero: ${e.message}`);
    }
  };

  const handleAddAllPassengers = async () => {
    setLoading(true);
    let t = token || await callToken();
    const keys = Object.keys(sellResults.passengers);
    for (const k of keys) {
      await handleSinglePassengerConfirm(k, t);
      await new Promise(r => setTimeout(r, 300));
    }
    setLoading(false);
  };

  const handleReset = async () => {
    setLoading(true); setError(null);
    try {
      const baseUrl = apiSettings.url.includes('cert') ? '/api-cert' : '/api-prod';
      const res = await fetch(`${baseUrl}/api/nsk/v1/booking/reset`, { 
        method: 'DELETE', 
        headers: { 'Authorization': token } 
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(JSON.stringify(d, null, 2));
      }
      setSellResults(null); 
      setBookingFinal(null); 
      setSelectedFares({}); 
      setPassengerStatus({});
      setLastSellRequest(null);
    } catch (e) { 
      setError(e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSaveContact = async (contactRq) => {
    setLoading(true); setError(null);
    try {
      return await apiService.addContact(contactRq, apiSettings, token);
    } catch (e) { 
      setError(e.message); 
      throw e;
    } finally { setLoading(false); }
  };

  const getSsrAvailability = async () => {
    if (!sellResults) return null;
    try {
      const pKeys = Object.keys(sellResults.passengers);
      const trips = [];
      
      Object.values(sellResults.journeys).forEach(j => {
        if (j.segments) {
          j.segments.forEach(s => {
            const d = s.designator || {};
            const id = s.identifier || {};
            trips.push({
              identifier: {
                carrierCode: id.carrierCode || d.carrierCode || "",
                identifier: id.identifier || d.identifier || "",
                opSuffix: id.opSuffix || ""
              },
              origin: d.origin || "",
              destination: d.destination || "",
              departureDate: (d.departure || "").split('T')[0]
            });
          });
        }
      });

      const rq = {
        trips,
        passengerKeys: pKeys,
        currencyCode: apiSettings.money
      };
      
      return await apiService.fetchSsrAvailability(rq, apiSettings, token);
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const getSeatmaps = async () => {
    if (!token) return null;
    return await apiService.fetchSeatmaps(apiSettings, token);
  };

  const isSelectionComplete = () => {
    if (searchParams.tripType === 'OW') return !!selectedFares[0];
    return !!selectedFares[0] && !!selectedFares[1];
  };

  const handleAssignSeat = async (paxKey, unitKey) => {
    setLoading(true);
    try {
      const res = await apiService.assignSeat(paxKey, unitKey, apiSettings, token);
      return res;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading, error, searchParams, setSearchParams, apiSettings, setApiSettings,
    token, setToken, searchResults, setSearchResults, sellResults, setSellResults,
    bookingFinal, setBookingFinal, passengerStatus, setPassengerStatus,
    passengersData, setPassengersData, selectedFares, setSelectedFares, lastSellRequest,
    callToken, handleSearch, handleSell, handleCommit, handleReset, isSelectionComplete, 
    handleAddAllPassengers, handleSinglePassengerConfirm, handleSaveContact, getSsrAvailability, getSeatmaps,
    handleAssignSeat
  };
};
