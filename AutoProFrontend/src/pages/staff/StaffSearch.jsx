import React, { useState } from 'react';
import { Search, Car, Phone, User, Hash, ChevronRight, Users } from 'lucide-react';
import { PageHeader, Avatar } from '../../components/ui/index';

const ALL_CUSTOMERS = [
  { id: 'C-001', name: 'Ram Bahadur Thapa',  phone: '9841001001', vehicle: 'BA 3 PA 8888 — Toyota Corolla 2019', email: 'ram@gmail.com',    totalSpent: 42500, visits: 8  },
  { id: 'C-002', name: 'Sunita Thapa Magar', phone: '9852002002', vehicle: 'BA 2 KA 1234 — Honda City 2021',     email: 'sunita@gmail.com', totalSpent: 28000, visits: 9  },
  { id: 'C-003', name: 'Gopal Sharma',       phone: '9800003333', vehicle: 'BA 1 JA 5678 — Hyundai i20 2022',   email: 'gopal@gmail.com',  totalSpent: 9500,  visits: 3  },
  { id: 'C-004', name: 'Priya Basnet',       phone: '9861002002', vehicle: 'BA 4 CHA 9876 — KIA Sportage 2020', email: 'priya@gmail.com',  totalSpent: 38000, visits: 11 },
  { id: 'C-005', name: 'Niraj Pandey',       phone: '9868004444', vehicle: 'BA 1 DA 2345 — Maruti Swift 2018',  email: 'niraj@gmail.com',  totalSpent: 19800, visits: 5  },
  { id: 'C-006', name: 'Dinesh Tamang',      phone: '9870005555', vehicle: 'BA 2 GHA 3456 — Suzuki Alto 2021',  email: 'dinesh@gmail.com', totalSpent: 8500,  visits: 4  },
];

const SEARCH_TYPES = [
  { label: 'Name',           icon: User,   key: 'name'    },
  { label: 'Phone',          icon: Phone,  key: 'phone'   },
  { label: 'Customer ID',    icon: Hash,   key: 'id'      },
  { label: 'Vehicle Number', icon: Car,    key: 'vehicle' },
];

export default function StaffSearch() {
  const [searchType, setSearchType] = useState('name');
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [searched, setSearched]     = useState(false);

  const doSearch = () => {
    if (!query.trim()) return;
    const q = query.trim().toLowerCase();
    const found = ALL_CUSTOMERS.filter(c => c[searchType]?.toLowerCase().includes(q));
    setResults(found);
    setSearched(true);
  };

  return (
    <div className="space-y-6 page-enter">
      <PageHeader eyebrow="Staff" title="Customer Search" subtitle="Find any customer by name, phone, ID, or vehicle plate number." />

      {/* Search panel */}
      <div className="dash-card p-5 space-y-4">
        {/* Type pills */}
        <div className="flex gap-2 flex-wrap">
          {SEARCH_TYPES.map(({ label, icon: Icon, key }) => (
            <button
              key={key}
              onClick={() => { setSearchType(key); setQuery(''); setSearched(false); setResults([]); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                searchType === key
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder={`Search by ${SEARCH_TYPES.find(t => t.key === searchType)?.label}…`}
              className="form-input pl-10"
            />
          </div>
          <button onClick={doSearch} className="btn-primary">
            <Search size={15} /> Search
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-semibold">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>

          {results.length === 0 ? (
            <div className="dash-card p-10 text-center">
              <Search size={32} className="mx-auto text-muted-foreground mb-3" />
              <p className="font-bold text-foreground">No customers found</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different search term or type</p>
            </div>
          ) : (
            results.map(c => (
              <div key={c.id} className="dash-card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <Avatar name={c.name} size="lg" color="blue" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-foreground">{c.name}</h3>
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{c.id}</span>
                    </div>
                    <div className="flex gap-4 mt-1 flex-wrap text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Phone size={10} /> {c.phone}</span>
                      <span className="flex items-center gap-1"><Car size={10} /> {c.vehicle}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-foreground">NPR {c.totalSpent.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{c.visits} visits</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All customers list when not searching */}
      {!searched && (
        <div className="dash-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Users size={16} className="text-primary" />
            <h2 className="font-bold text-foreground">All Customers ({ALL_CUSTOMERS.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {ALL_CUSTOMERS.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3 hover:bg-card-hover transition-colors cursor-pointer">
                <Avatar name={c.name} size="sm" color="blue" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.vehicle}</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded hidden sm:block">{c.id}</span>
                <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
