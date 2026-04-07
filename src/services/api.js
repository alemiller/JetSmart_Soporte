const getProxyUrl = (url) => {
  if (!url) return '';
  if (url.includes('partners-cert')) return '/api-cert';
  if (url.includes('partners-prod')) return '/api-prod';
  return url;
};

const safeJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (e) {
    return { error: 'Invalid JSON', raw: text };
  }
};

export const apiService = {
  async fetchToken(settings) {
    const baseUrl = getProxyUrl(settings.url);
    const res = await fetch(`${baseUrl}/api/nsk/v2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationName: "",
        credentials: {
          username: settings.username,
          alternateIdentifier: "",
          password: settings.password,
          domain: settings.domain,
          location: settings.location,
          channelType: settings.channelType
        }
      })
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(JSON.stringify(data, null, 2));
    return data; 
  },

  async search(params, settings, token) {
    const baseUrl = getProxyUrl(settings.url);
    const body = { 
      origin: params.origin, 
      destination: params.destination, 
      beginDate: params.departureDate, 
      passengers: { 
        types: [
          { type: 'ADT', count: params.passengers.ADT }, 
          { type: 'CHD', count: params.passengers.CHD }, 
          { type: 'INFF', count: params.passengers.INFF }
        ].filter(p => p.count > 0), 
        residentCountry: "CL" 
      }, 
      codes: { 
        currencyCode: settings.money, 
        sourceOrganization: settings.orgCode, 
        currentSourceOrganization: settings.orgCode 
      }, 
      filters: { 
        fareInclusionType: "Default", 
        compressionType: "Default", 
        loyalty: "MonetaryOnly", 
        exclusionType: "ExcludeUnavailable", 
        type: "All", 
        bundleControlFilter: 2, 
        maxConnections: 2 
      }, 
      taxesAndFees: true, 
      numberOfFaresPerJourney: "10" 
    };
    if (params.tripType === 'RT') body.endDate = params.returnDate;

    const res = await fetch(`${baseUrl}/api/nsk/v4/availability/search/simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify(body)
    });
    
    const data = await safeJson(res);
    if (!res.ok) throw new Error(JSON.stringify(data, null, 2));
    return data.data;
  },

  async sell(selection, paxCounts, settings, token) {
    const baseUrl = getProxyUrl(settings.url);
    const bundleCodes = selection.map(s => s.productClass).filter(c => ['SM', 'FL'].includes(c)); // Ejemplo: SM=Smart, FL=Full
    
    const res = await fetch(`${baseUrl}/api/nsk/v4/trip/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify({
        passengers: {
          types: [
            { type: 'ADT', count: paxCounts.ADT || 0, discountCode: "" },
            { type: 'CHD', count: paxCounts.CHD || 0, discountCode: "" }
            // INFF no se envía en types para JetSmart Sell si va en infantCount (on-lap)
          ].filter(p => p.count > 0)
        },
        keys: selection.map(s => ({ 
          fareAvailabilityKey: s.fareAvailabilityKey, 
          inventoryControl: "HoldSpace",
          journeyKey: s.journeyKey, 
          standbyPriorityCode: ""
        })),
        preventOverlap: true,
        sourceOrganization: settings.orgCode,
        applyServiceBundle: bundleCodes.length > 0 ? 1 : 0,
        suppressPassengerAgeValidation: true,
        currencyCode: settings.money,
        infantCount: paxCounts.INFF || 0,
        serviceBundleCodes: bundleCodes
      })
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(JSON.stringify(data, null, 2));
    return data.data;
  },

  async sellRaw(rq, settings, token) {
    const baseUrl = getProxyUrl(settings.url);
    const res = await fetch(`${baseUrl}/api/nsk/v4/trip/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify(rq)
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(JSON.stringify(data, null, 2));
    return data.data;
  },

  async commit(settings, token) {
    const baseUrl = getProxyUrl(settings.url);
    const res = await fetch(`${baseUrl}/api/nsk/v3/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify({
        currencyCode: settings.money,
        sourceOrganization: settings.orgCode
      })
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(JSON.stringify(data, null, 2));

    const getRes = await fetch(`${baseUrl}/api/nsk/v1/booking`, {
      method: 'GET',
      headers: { 'Authorization': token }
    });
    const getData = await safeJson(getRes);
    if (!getRes.ok) throw new Error(JSON.stringify(getData, null, 2));
    return getData.data;
  },

  async addContact(rq, settings, token) {
    const baseUrl = getProxyUrl(settings.url);
    const res = await fetch(`${baseUrl}/api/nsk/v1/booking/contacts`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', 'Authorization': token },
       body: JSON.stringify(rq)
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(JSON.stringify(data, null, 2));
    return data.data;
  },

  async fetchSsrAvailability(rq, settings, token) {
    const baseUrl = getProxyUrl(settings.url);
    const res = await fetch(`${baseUrl}/api/nsk/v2/booking/ssrs/availability`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', 'Authorization': token },
       body: JSON.stringify(rq)
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(JSON.stringify(data, null, 2));
    return data;
  },
  
  fetchSeatmaps: async (apiSettings, token) => {
    const baseUrl = getProxyUrl(apiSettings.url);
    const url = `${baseUrl}/api/nsk/v2/booking/seatmaps?IncludeSeatFees=true&IncludePropertyLookup=true`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Napi-Config': apiSettings.src
      }
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(JSON.stringify(data, null, 2));
    return data;
  },
  
  assignSeat: async (paxKey, unitKey, apiSettings, token) => {
    const baseUrl = getProxyUrl(apiSettings.url);
    const url = `${baseUrl}/api/nsk/v2/booking/passengers/${paxKey}/seats/${unitKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collectedCurrencyCode: apiSettings.money || "CLP",
        waiveFee: false,
        inventoryControl: "None",
        ignoreSeatSsrs: false,
        seatAssignmentMode: "PreSeatAssignment"
      })
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(JSON.stringify(data, null, 2));
    return data;
  }
};
