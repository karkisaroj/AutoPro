import { mockFetch } from './api';

let _customers = [
  { id: 1,  name: 'Ram Bahadur Thapa',   phone: '9841-111-001', email: 'ram@gmail.com',     vehicle: 'Toyota Fortuner 2021',  plateNo: 'BA 1 CHA 1234', loyaltyPts: 820,  tier: 'Gold',    joinDate: '2024-01-15', totalSpent: 82000,  visits: 12 },
  { id: 2,  name: 'Sunita Sharma',        phone: '9841-111-002', email: 'sunita@gmail.com',  vehicle: 'Honda City 2022',       plateNo: 'BA 2 KHA 5678', loyaltyPts: 450,  tier: 'Silver',  joinDate: '2024-03-20', totalSpent: 45000,  visits: 7  },
  { id: 3,  name: 'Prakash Oli',          phone: '9841-111-003', email: 'prakash@gmail.com', vehicle: 'Suzuki Swift 2020',     plateNo: 'GA 1 GA 9012',  loyaltyPts: 210,  tier: 'Bronze',  joinDate: '2024-06-10', totalSpent: 21000,  visits: 4  },
  { id: 4,  name: 'Binita Gurung',        phone: '9841-111-004', email: 'binita@gmail.com',  vehicle: 'Hyundai Creta 2023',   plateNo: 'BA 3 CHA 3456', loyaltyPts: 1250, tier: 'Platinum',joinDate: '2023-08-05', totalSpent: 125000, visits: 24 },
  { id: 5,  name: 'Saroj Karki',          phone: '9841-111-005', email: 'saroj@gmail.com',   vehicle: 'KIA Seltos 2022',      plateNo: 'BA 4 KA 7890',  loyaltyPts: 680,  tier: 'Silver',  joinDate: '2024-02-12', totalSpent: 68000,  visits: 9  },
  { id: 6,  name: 'Anita Rai',            phone: '9841-111-006', email: 'anita@gmail.com',   vehicle: 'Mahindra XUV300 2021', plateNo: 'JA 1 PA 2345',  loyaltyPts: 320,  tier: 'Bronze',  joinDate: '2025-01-08', totalSpent: 32000,  visits: 5  },
];

export const getCustomers = () => mockFetch(_customers);
export const getCustomerById = (id) => mockFetch(_customers.find(c => c.id === id));

export const createCustomer = (data) => {
  const newCustomer = {
    id: Date.now(),
    loyaltyPts: 0,
    tier: 'Bronze',
    joinDate: new Date().toISOString().split('T')[0],
    totalSpent: 0,
    visits: 0,
    ...data,
  };
  _customers = [..._customers, newCustomer];
  return mockFetch(newCustomer);
};

export const updateCustomer = (id, data) => {
  _customers = _customers.map(c => c.id === id ? { ...c, ...data } : c);
  return mockFetch(_customers.find(c => c.id === id));
};
