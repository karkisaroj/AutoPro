import { mockFetch } from './api';

let _sales = [
  {
    id: 'INV-1045', date: '2026-04-18', customerId: 1, customerName: 'Ram Bahadur Thapa',
    vehicle: 'Toyota Fortuner 2021', plateNo: 'BA 1 CHA 1234',
    items: [
      { description: 'Engine Oil Change (5W-30 Castrol)',   qty: 1, unitPrice: 3500,  total: 3500  },
      { description: 'Brake Pad Replacement (Front)',        qty: 1, unitPrice: 5800,  total: 5800  },
      { description: 'Air Filter Replacement',              qty: 1, unitPrice: 1200,  total: 1200  },
    ],
    subtotal: 10500, loyaltyDiscount: 525, total: 9975, loyaltyPoints: 99,
    paymentMethod: 'Cash', status: 'Paid', staffName: 'Anil Shrestha', notes: 'Next service in 5000km',
  },
  {
    id: 'INV-1044', date: '2026-04-17', customerId: 4, customerName: 'Binita Gurung',
    vehicle: 'Hyundai Creta 2023', plateNo: 'BA 3 CHA 3456',
    items: [
      { description: 'Full Service Package',                qty: 1, unitPrice: 12000, total: 12000 },
      { description: 'Wheel Alignment & Balancing',         qty: 1, unitPrice: 2500,  total: 2500  },
    ],
    subtotal: 14500, loyaltyDiscount: 1450, total: 13050, loyaltyPoints: 130,
    paymentMethod: 'Online', status: 'Paid', staffName: 'Manisha Thapa', notes: '',
  },
  {
    id: 'INV-1043', date: '2026-04-16', customerId: 3, customerName: 'Prakash Oli',
    vehicle: 'Suzuki Swift 2020', plateNo: 'GA 1 GA 9012',
    items: [
      { description: 'Spark Plug Replacement (4pc)',        qty: 1, unitPrice: 3200,  total: 3200  },
      { description: 'Wiper Blade Set',                     qty: 1, unitPrice: 850,   total: 850   },
    ],
    subtotal: 4050, loyaltyDiscount: 0, total: 4050, loyaltyPoints: 40,
    paymentMethod: 'Cash', status: 'Paid', staffName: 'Anil Shrestha', notes: '',
  },
  {
    id: 'INV-1042', date: '2026-04-15', customerId: 5, customerName: 'Saroj Karki',
    vehicle: 'KIA Seltos 2022', plateNo: 'BA 4 KA 7890',
    items: [
      { description: 'AC Service & Recharge',              qty: 1, unitPrice: 4500,  total: 4500  },
      { description: 'Coolant Flush & Refill',             qty: 1, unitPrice: 1800,  total: 1800  },
    ],
    subtotal: 6300, loyaltyDiscount: 315, total: 5985, loyaltyPoints: 59,
    paymentMethod: 'Card', status: 'Paid', staffName: 'Manisha Thapa', notes: 'Suggested timing belt check next visit',
  },
  {
    id: 'INV-1041', date: '2026-04-14', customerId: 2, customerName: 'Sunita Sharma',
    vehicle: 'Honda City 2022', plateNo: 'BA 2 KHA 5678',
    items: [
      { description: 'Brake Fluid Replacement',            qty: 1, unitPrice: 1500,  total: 1500  },
    ],
    subtotal: 1500, loyaltyDiscount: 0, total: 1500, loyaltyPoints: 15,
    paymentMethod: 'Cash', status: 'Pending', staffName: 'Dipak Magar', notes: '',
  },
];

export const getSales     = ()     => mockFetch(_sales);
export const getSaleById  = (id)   => mockFetch(_sales.find(s => s.id === id));

export const createSale = (data) => {
  const id = 'INV-' + (1045 + _sales.length + 1);
  const sale = {
    id,
    date: new Date().toISOString().split('T')[0],
    status: 'Paid',
    ...data,
  };
  _sales = [sale, ..._sales];
  return mockFetch(sale);
};

export const getRevenueByDay = () => mockFetch([
  { day: 'Mon', date: '2026-04-14', revenue: 18000, invoices: 3 },
  { day: 'Tue', date: '2026-04-15', revenue: 9600,  invoices: 2 },
  { day: 'Wed', date: '2026-04-16', revenue: 24500, invoices: 4 },
  { day: 'Thu', date: '2026-04-17', revenue: 13050, invoices: 2 },
  { day: 'Fri', date: '2026-04-18', revenue: 9975,  invoices: 1 },
  { day: 'Sat', date: '2026-04-19', revenue: 0,     invoices: 0 },
  { day: 'Sun', date: '2026-04-20', revenue: 0,     invoices: 0 },
]);
