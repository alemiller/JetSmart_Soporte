export const CITIES = [
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

export const CHARGE_TYPES = {
  0: 'FarePrice',
  1: 'Discount',
  2: 'IncludedTravelFee',
  3: 'IncludedTax',
  4: 'TravelFee',
  5: 'Tax',
  6: 'ServiceCharge',
  7: 'PromotionDiscount',
  8: 'ConnectionAdjustmentAmount',
  9: 'AddOnsPrice',
  10: 'FarePoints',
  11: 'DiscountPoints',
  16: 'IncludedAddOnsFee',
  17: 'AddOnsFee',
  18: 'AddOnsMarkup',
  19: 'FareSurcharge',
  21: 'AddOnsCancelFee',
  22: 'Calculated',
  23: 'Note',
  24: 'Points',
  25: 'DynamicFareAdjustment'
};

export const DEFAULT_PASSENGERS = { ADT: 0, CHD: 0, INFF: 0 };

export const DEFAULT_SEARCH = {
  origin: '',
  destination: '',
  departureDate: '',
  returnDate: '',
  tripType: 'RT',
  passengers: DEFAULT_PASSENGERS
};

export const DEFAULT_SETTINGS = {
  url: 'https://partners-cert.api.jetsmart.com',
  username: 'IT_ALEJANDROM',
  password: 'HwLN8s@KXW',
  domain: 'DEF',
  location: 'WWW',
  channelType: 'Web',
  money: 'ARS',
  orgCode: 'JA',
  isCustomPassword: false
};
