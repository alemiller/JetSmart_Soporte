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
    const res = await fetch(`${baseUrl}/api/nsk/v4/trip/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify({
        passengers: {
          types: [
            { type: 'ADT', count: paxCounts.ADT || 0, discountCode: "" },
            { type: 'CHD', count: paxCounts.CHD || 0, discountCode: "" },
            { type: 'INFF', count: paxCounts.INFF || 0, discountCode: "" }
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
        applyServiceBundle: 0,
        suppressPassengerAgeValidation: true,
        currencyCode: settings.money,
        infantCount: paxCounts.INFF || 0,
        serviceBundleCodes: []
      })
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
  }
};
