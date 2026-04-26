import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Check, Shield, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { getStaff, createStaff, updateStaff, deleteStaff, toggleStaffStatus } from '../../services/staffService';
import { Avatar, StatusBadge, TableSkeleton, EmptyState, PageHeader, ConfirmDialog } from '../../components/ui/index';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';

const ROLES = ['Senior Mechanic', 'Junior Mechanic', 'Service Advisor', 'Parts Manager', 'Accountant', 'Admin Manager'];
const DEPTS = ['Workshop', 'Front Desk', 'Inventory', 'Finance', 'Management'];
const AVATAR_COLORS = ['violet', 'blue', 'emerald', 'amber', 'indigo'];

const EMPTY_FORM = { name: '', email: '', phone: '', role: 'Senior Mechanic', department: 'Workshop', salary: '' };

export default function AdminStaff() {
  const [staff,    setStaff]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [confirm,  setConfirm]  = useState(null); // { id, name }
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    getStaff().then(data => { setStaff(data); setLoading(false); });
  }, []);

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (s) => {
    setEditing(s.id);
    setForm({ name: s.name, email: s.email, phone: s.phone, role: s.role, department: s.department, salary: s.salary });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateStaff(editing, form);
        setStaff(prev => prev.map(s => s.id === editing ? { ...s, ...updated } : s));
      } else {
        const created = await createStaff(form);
        setStaff(prev => [...prev, created]);
      }
      setModal(false);
    } finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    const updated = await toggleStaffStatus(id);
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: updated.active } : s));
  };

  const handleDelete = async () => {
    await deleteStaff(confirm.id);
    setStaff(prev => prev.filter(s => s.id !== confirm.id));
    setConfirm(null);
  };

  const stats = [
    { label: 'Total Staff',  value: staff.length,                           color: 'violet', icon: Users         },
    { label: 'Active',       value: staff.filter(s => s.active).length,     color: 'emerald',icon: ToggleRight   },
    { label: 'On Leave',     value: staff.filter(s => !s.active).length,    color: 'red',    icon: ToggleLeft    },
    { label: 'Departments',  value: [...new Set(staff.map(s=>s.department))].length, color: 'blue', icon: Shield },
  ];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        eyebrow="HR Management"
        title="Staff Management"
        subtitle="Register, manage, and assign roles to team members."
        actions={
          <button onClick={openAdd} className="btn-primary">
            <Plus size={15} /> Add Staff Member
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} loading={loading} />)}
      </div>

      {/* Table card */}
      <div className="dash-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
          <h2 className="font-display font-bold text-foreground">Team Members</h2>
          <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-muted/30 w-60">
            <Search size={15} className="text-muted-foreground flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search staff..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                {['Staff Member', 'Role & Department', 'Contact', 'Salary', 'Joined', 'Status', ''].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <TableSkeleton cols={7} rows={5} /> : filtered.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={Users} title="No staff found" description="Add a new staff member to get started." /></td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} />
                      <div>
                        <p className="font-bold text-foreground text-sm">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="font-semibold text-foreground text-sm">{s.role}</p>
                    <p className="text-[11px] text-muted-foreground">{s.department}</p>
                  </td>
                  <td className="font-mono text-xs">{s.phone}</td>
                  <td>
                    <span className="font-bold text-foreground">NPR {Number(s.salary).toLocaleString()}</span>
                    <span className="text-muted-foreground text-[10px]">/mo</span>
                  </td>
                  <td className="text-xs text-muted-foreground">{s.joined}</td>
                  <td>
                    <button onClick={() => handleToggle(s.id)} className="cursor-pointer">
                      <StatusBadge status={s.active ? 'Active' : 'Inactive'} />
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title="Edit">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setConfirm({ id: s.id, name: s.name })} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-600 transition-colors cursor-pointer" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <Modal
          title={editing ? 'Edit Staff Member' : 'Add New Staff Member'}
          onClose={() => setModal(false)}
          icon={Users}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Full Name',    key: 'name',  type: 'text',  ph: 'Anil Shrestha',     half: false },
                { label: 'Email',        key: 'email', type: 'email', ph: 'anil@autopro.com',  half: false },
                { label: 'Phone',        key: 'phone', type: 'tel',   ph: '9841-XXX-XXX',      half: true  },
                { label: 'Salary (NPR)', key: 'salary',type: 'number',ph: '30000',             half: true  },
              ].map(({ label, key, type, ph, half }) => (
                <div key={key} className={half ? '' : 'col-span-2'}>
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={ph}
                    className="form-input"
                  />
                </div>
              ))}
              <div>
                <label className="form-label">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="form-select">
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Department</label>
                <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="form-select">
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-border">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center" disabled={saving}>
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                {editing ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      {confirm && (
        <ConfirmDialog
          title={`Remove ${confirm.name}?`}
          description="This will permanently remove this staff member from the system. This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
          danger
        />
      )}
    </div>
  );
}
