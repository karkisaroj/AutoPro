import React, { useState, useEffect } from 'react';
import { Search, Car, Phone, User, Hash, ChevronRight, Users } from 'lucide-react';
import { getCustomers } from '../../services/customerService';
import { PageHeader, Avatar, Spinner } from '../../components/ui/index';

const SEARCH_TYPES = [
  { label: 'Name',           icon: User,   key: 'name'    },
  { label: 'Phone',          icon: Phone,  key: 'phone'   },
  { label: 'License ID',     icon: Hash,   key: 'licenseId' },
  { label: 'Vehicle Plate',  icon: Car,    key: 'plate'   },
];

export default function StaffSearch() {
  const [allCustomers, setAllCustomers] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchType, setSearchType]     = useState('name');
  const [query, setQuery]               = useState('');
  const [results, setResults]           = useState([]);
  const [searched, setSearched]         = useState(false);

  useEffect(() => {
    getCustomers().then(data => { setAllCustomers(data); setLoading(false); });
  }, []);

  const doSearch = () => {
    if (!query.trim()) return;
    const q = query.trim().toLowerCase();
    const found = allCustomers.filter(c => {
      if (searchType === 'name')      return c.name?.toLowerCase().includes(q);
      if (searchType === 'phone')     return c.phone?.includes(query.trim());
      if (searchType === 'licenseId') return c.licenseId?.toLowerCase().includes(q);
      if (searchType === 'plate')     return c.vehicles?.some(v => v.plateNo?.toLowerCase().includes(q));
      return false;
    });
    setResults(found);
    setSearched(true);
  };

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        eyebrow="Staff"
        title="Customer Search"
        subtitle={loading ? 'Loading customers…' : `Search across ${allCustomers.length} customer${allCustomers.length !== 1 ? 's' : ''} by name, phone, license ID, or vehicle plate.`}
      />

      {/* Search panel */}
      <div className="dash-card p-5 space-y-4">
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
              <p className="text-xs text-muted-foreground mt-1">
                No match for &ldquo;{query}&rdquo; by {SEARCH_TYPES.find(t => t.key === searchType)?.label}. Try a different term or search type.
              </p>
            </div>
          ) : (
            results.map(c => (
              <div key={c.id} className="dash-card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <Avatar name={c.name} size="lg" color="blue" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-foreground">{c.name}</h3>
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">#{c.id}</span>
                      <span className="text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 px-2 py-0.5 rounded-full">{c.tier}</span>
                    </div>
                    <div className="flex gap-4 mt-1 flex-wrap text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Phone size={10} /> {c.phone}</span>
                      {searchType === 'plate'
                        ? c.vehicles?.map(v => (
                            <span key={v.id} className="flex items-center gap-1 font-semibold text-primary">
                              <Car size={10} /> {v.plateNo} — {v.vehicleType}
                            </span>
                          ))
                        : c.vehicles?.[0] && (
                            <span className="flex items-center gap-1">
                              <Car size={10} /> {c.vehicles[0].plateNo} — {c.vehicles[0].vehicleType}
                            </span>
                          )
                      }
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-foreground">NPR {c.totalSpent?.toLocaleString()}</p>
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
            <h2 className="font-bold text-foreground">
              All Customers {loading ? '' : `(${allCustomers.length})`}
            </h2>
          </div>
          {loading ? (
            <div className="p-8 flex justify-center"><Spinner /></div>
          ) : (
            <div className="divide-y divide-border">
              {allCustomers.map(c => (
                <div key={c.id} className="flex items-center gap-4 px-5 py-3 hover:bg-card-hover transition-colors">
                  <Avatar name={c.name} size="sm" color="blue" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.vehicles?.[0] ? `${c.vehicles[0].vehicleType} · ${c.vehicles[0].plateNo}` : c.phone}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded hidden sm:block">#{c.id}</span>
                  <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
