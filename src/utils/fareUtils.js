/**
 * Calculates a simplified breakdown of a fare object.
 * Sums basic fare, taxes, and fees for the first passenger type (usually ADT).
 * Used for comparison and display purposes.
 */
export const calculateFareBreakdown = (fareDetails) => {
  let basic = 0;
  let taxes = 0;
  let fees = 0;

  if (!fareDetails || !fareDetails.fares) return { basic, taxes, fees, total: 0 };

  fareDetails.fares.forEach(seg => {
    // Usamos el primer tipo de pasajero (generalmente ADT) para la comparación base
    const pf = seg.passengerFares?.[0];
    if (pf && pf.serviceCharges) {
      pf.serviceCharges.forEach(sc => {
        const amount = sc.amount || 0;
        if (sc.type === 0) basic += amount;
        else if (sc.type === 1) basic -= amount; // Descuento resta de base
        else if ([3, 5].includes(sc.type)) taxes += amount;
        else fees += amount;
      });
    }
  });

  return { basic, taxes, fees, total: basic + taxes + fees };
};

/**
 * Generates and downloads a CSV report from filtered comparison data.
 */
export const downloadReport = (filteredData) => {
  let csv = "Tramo;Tarifas;Vuelo;Origen;Destino;API Basic Fare;API Taxes;API Fees;API Total;WEB Basic Fare;WEB Taxes;WEB Fees;WEB Total\n";
  
  filteredData.forEach(chunk => {
    chunk.rows.forEach(row => {
      csv += `${chunk.label};${row.productClass};${row.flightNum};${row.origin};${row.destination};${row.api.basic};${row.api.taxes};${row.api.fees};${row.api.total};`;
      csv += `${row.web.basicFare || 0};${row.web.taxes || 0};${row.web.fees || 0};${row.web.total || 0}\n`;
    });
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `Comparativa_Tarifas_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
