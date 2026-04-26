import { mockFetch } from './api';

let _parts = [
  { id: 'PT-001', name: 'Brake Pad Set (Toyota Fortuner)',  category: 'Brakes',     price: 2800,  qty: 4,  vendor: 'NepalAuto Supplies', minQty: 10, unit: 'Set',   lastRestocked: '2026-03-15' },
  { id: 'PT-002', name: 'Engine Oil 5W-30 Castrol (5L)',    category: 'Engine',     price: 1200,  qty: 3,  vendor: 'Lubrikant Nepal',    minQty: 10, unit: 'Bottle',lastRestocked: '2026-03-20' },
  { id: 'PT-003', name: 'Air Filter (Honda City 2022)',      category: 'Filters',    price: 650,   qty: 7,  vendor: 'KTM Parts Hub',      minQty: 10, unit: 'Piece', lastRestocked: '2026-03-10' },
  { id: 'PT-004', name: 'Shock Absorber Front (KIA Seltos)', category: 'Suspension', price: 9500,  qty: 15, vendor: 'AutoZone Pvt. Ltd.', minQty: 5,  unit: 'Piece', lastRestocked: '2026-02-28' },
  { id: 'PT-005', name: 'Alternator 12V Universal',          category: 'Electrical', price: 7200,  qty: 22, vendor: 'NepalAuto Supplies', minQty: 5,  unit: 'Piece', lastRestocked: '2026-02-10' },
  { id: 'PT-006', name: 'Spark Plug Set NGK (4pc)',          category: 'Engine',     price: 1800,  qty: 8,  vendor: 'NepalAuto Supplies', minQty: 10, unit: 'Set',   lastRestocked: '2026-03-25' },
  { id: 'PT-007', name: 'Timing Belt (Hyundai i20)',         category: 'Engine',     price: 3400,  qty: 2,  vendor: 'AutoZone Pvt. Ltd.', minQty: 10, unit: 'Piece', lastRestocked: '2026-01-15' },
  { id: 'PT-008', name: 'Tyre 185/65 R15 Yokohama Earth1',  category: 'Tyres',      price: 12500, qty: 40, vendor: 'Tyre World Nepal',   minQty: 20, unit: 'Piece', lastRestocked: '2026-04-01' },
  { id: 'PT-009', name: 'Wiper Blade Set (Universal 24")',   category: 'Body',       price: 850,   qty: 18, vendor: 'KTM Parts Hub',      minQty: 10, unit: 'Set',   lastRestocked: '2026-03-05' },
  { id: 'PT-010', name: 'Coolant Rad Guard 50/50 (1L)',      category: 'Engine',     price: 480,   qty: 25, vendor: 'Lubrikant Nepal',    minQty: 15, unit: 'Bottle',lastRestocked: '2026-04-08' },
];

let _purchaseOrders = [
  { id: 'PO-2035', vendor: 'NepalAuto Supplies', date: '2026-04-12', items: 5, total: 45000, status: 'Received', notes: 'Quarterly restock' },
  { id: 'PO-2034', vendor: 'KTM Parts Hub',      date: '2026-04-08', items: 3, total: 18500, status: 'Received', notes: ''                   },
  { id: 'PO-2033', vendor: 'AutoZone Pvt. Ltd.', date: '2026-04-05', items: 7, total: 62000, status: 'Pending',  notes: 'Urgent — low stock' },
  { id: 'PO-2032', vendor: 'Tyre World Nepal',   date: '2026-03-28', items: 20,total: 250000,status: 'Received', notes: 'Season stock'       },
];

export const getParts          = ()        => mockFetch(_parts);
export const getLowStockParts  = ()        => mockFetch(_parts.filter(p => p.qty < p.minQty));
export const getPurchaseOrders = ()        => mockFetch(_purchaseOrders);

export const createPart = (data) => {
  const id = 'PT-' + String(_parts.length + 1).padStart(3, '0');
  const newPart = { id, lastRestocked: new Date().toISOString().split('T')[0], ...data, price: +data.price, qty: +data.qty, minQty: +data.minQty };
  _parts = [..._parts, newPart];
  return mockFetch(newPart);
};

export const updatePart = (id, data) => {
  _parts = _parts.map(p => p.id === id ? { ...p, ...data, price: +data.price, qty: +data.qty, minQty: +data.minQty } : p);
  return mockFetch(_parts.find(p => p.id === id));
};

export const deletePart = (id) => {
  _parts = _parts.filter(p => p.id !== id);
  return mockFetch({ success: true });
};

export const createPurchaseOrder = (data) => {
  const id = 'PO-' + (2035 + _purchaseOrders.length + 1);
  const po = { id, date: new Date().toISOString().split('T')[0], status: 'Pending', ...data, items: +data.items, total: +data.total };
  _purchaseOrders = [..._purchaseOrders, po];
  return mockFetch(po);
};
