import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Check, Shield, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { getStaff, createStaff, updateStaff, deleteStaff, toggleStaffStatus } from '../../services/staffService';
import { Avatar, StatusBadge, TableSkeleton, EmptyState, PageHeader, ConfirmDialog } from '../../components/ui/index';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';

<<<<<<< HEAD
const ROLES = ['Senior Mechanic', 'Junior Mechanic', 'Service Advisor', 'Parts Manager', 'Accountant', 'Admin Manager'];
const DEPTS = ['Workshop', 'Front Desk', 'Inventory', 'Finance', 'Management'];
const AVATAR_COLORS = ['violet', 'blue', 'emerald', 'amber', 'indigo'];

const EMPTY_FORM = { name: '', email: '', phone: '', role: 'Senior Mechanic', department: 'Workshop', salary: '', password: '' };

export default function AdminStaff() {
  const [staff,    setStaff]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [confirm,  setConfirm]  = useState(null); // { id, name }
  const [saving,   setSaving]   = useState(false);
=======
const ROLES = ['Senior Mechanic', 'Junior Mechanic', 'Service Advisor', 'Parts Manager', 'Accountant'];
const DEPTS = ['Workshop', 'Front Desk', 'Inventory', 'Finance', 'Management'];
const AVATAR_COLORS = ['violet', 'blue', 'emerald', 'amber', 'indigo'];

const ROLE_COLOR = {
  'Senior Mechanic':  'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  'Junior Mechanic':  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  'Service Advisor':  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  'Parts Manager':    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  'Accountant':       'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
};

const EMPTY_FORM = { name: '', email: '', phone: '', role: 'Senior Mechanic', department: 'Workshop', salary: '', password: '' };

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export default function AdminStaff() {
  const [staff,     setStaff]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [modal,     setModal]     = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [confirm,   setConfirm]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);
>>>>>>> noble

  useEffect(() => {
    getStaff().then(data => { setStaff(data); setLoading(false); });
  }, []);

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

<<<<<<< HEAD
  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (s) => {
    setEditing(s.id);
    setForm({ name: s.name, email: s.email, phone: s.phone, role: s.role, department: s.department, salary: s.salary, password: '' });
=======
  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
    setModal(true);
  };

  const openEdit = (s) => {
    setEditing(s.id);
    setForm({ name: s.name, email: s.email, phone: s.phone, role: s.role, department: s.department, salary: s.salary, password: '' });
    setSaveError(null);
>>>>>>> noble
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setSaving(true);
<<<<<<< HEAD
=======
    setSaveError(null);
>>>>>>> noble
    try {
      if (editing) {
        const updated = await updateStaff(editing, form);
        setStaff(prev => prev.map(s => s.id === editing ? { ...s, ...updated } : s));
      } else {
        const created = await createStaff(form);
        setStaff(prev => [...prev, created]);
      }
      setModal(false);
<<<<<<< HEAD
    } finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    const updated = await toggleStaffStatus(id);
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: updated.active } : s));
=======
    } catch (err) {
      setSaveError(err?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    const result = await toggleStaffStatus(id);
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: result.isActive } : s));
>>>>>>> noble
  };

  const handleDelete = async () => {
    await deleteStaff(confirm.id);
    setStaff(prev => prev.filter(s => s.id !== confirm.id));
    setConfirm(null);
  };

  const stats = [
<<<<<<< HEAD
    { label: 'Total Staff',  value: staff.length,                           color: 'violet', icon: Users         },
    { label: 'Active',       value: staff.filter(s => s.active).length,     color: 'emerald',icon: ToggleRight   },
    { label: 'On Leave',     value: staff.filter(s => !s.active).length,    color: 'red',    icon: ToggleLeft    },
    { label: 'Departments',  value: [...new Set(staff.map(s=>s.department))].length, color: 'blue', icon: Shield },
=======
    { label: 'Total Staff',  value: staff.length,                                             color: 'violet',  icon: Users      },
    { label: 'Active',       value: staff.filter(s => s.active).length,                       color: 'emerald', icon: ToggleRight },
    { label: 'Inactive',     value: staff.filter(s => !s.active).length,                      color: 'red',     icon: ToggleLeft  },
    { label: 'Departments',  value: [...new Set(staff.map(s => s.department))].length,         color: 'blue',    icon: Shield      },
>>>>>>> noble
  ];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        eyebrow="HR Management"
        title="Staff Management"
<<<<<<< HEAD
        subtitle="Register, manage, and assign roles to team members."
=======
        subtitle="Register, manage, and assign roles to your team members."
>>>>>>> noble
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
<<<<<<< HEAD
              placeholder="Search staff..."
=======
              placeholder="Search by name, role…"
>>>>>>> noble
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
<<<<<<< HEAD
                <tr><td colSpan={7}><EmptyState icon={Users} title="No staff found" description="Add a new staff member to get started." /></td></tr>
=======
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={Users} title="No staff found" description="Add a new staff member to get started." />
                  </td>
                </tr>
>>>>>>> noble
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
<<<<<<< HEAD
                    <p className="font-semibold text-foreground text-sm">{s.role}</p>
                    <p className="text-[11px] text-muted-foreground">{s.department}</p>
=======
                    <span className={`badge text-[10px] font-semibold ${ROLE_COLOR[s.role] || 'bg-muted text-muted-foreground'}`}>
                      {s.role}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-1">{s.department}</p>
>>>>>>> noble
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
<<<<<<< HEAD
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title="Edit">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setConfirm({ id: s.id, name: s.name })} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-600 transition-colors cursor-pointer" title="Delete">
=======
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setConfirm({ id: s.id, name: s.name })}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove"
                      >
>>>>>>> noble
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
<<<<<<< HEAD
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
              {!editing && (
                <div className="col-span-2">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Staff@123"
                    className="form-input"
                  />
                </div>
              )}
              <div>
                <label className="form-label">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="form-select">
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Department</label>
                <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="form-select">
=======

            {saveError && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2">
                {saveError}
              </div>
            )}

            {/* Personal Details */}
            <SectionDivider label="Personal Details" />
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Anil Shrestha"
                  className="form-input"
                />
              </div>
              <div className="col-span-2">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="anil@autopro.com"
                  className="form-input"
                  disabled={!!editing}
                />
                {editing && (
                  <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed after registration.</p>
                )}
              </div>
            </div>

            {/* Position */}
            <SectionDivider label="Position" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="form-select"
                >
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
                {form.role && (
                  <span className={`text-[10px] mt-1.5 px-2 py-0.5 rounded-full inline-block font-semibold ${ROLE_COLOR[form.role] || 'bg-muted text-muted-foreground'}`}>
                    {form.role}
                  </span>
                )}
              </div>
              <div>
                <label className="form-label">Department</label>
                <select
                  value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className="form-select"
                >
>>>>>>> noble
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

<<<<<<< HEAD
            <div className="flex gap-3 pt-2 border-t border-border">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center" disabled={saving}>
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
=======
            {/* Contact & Compensation */}
            <SectionDivider label="Contact & Compensation" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="98XX-XXX-XXX"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Monthly Salary (NPR)</label>
                <input
                  type="number"
                  value={form.salary}
                  onChange={e => setForm(f => ({ ...f, salary: e.target.value }))}
                  placeholder="30000"
                  className="form-input"
                />
              </div>
            </div>

            {/* Password — add only */}
            {!editing && (
              <>
                <SectionDivider label="Account Access" />
                <div>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Minimum 6 characters"
                    className="form-input"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Staff will use this to log into the staff portal.
                  </p>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2 border-t border-border">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center" disabled={saving}>
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Check size={15} />
                }
>>>>>>> noble
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
<<<<<<< HEAD
          description="This will permanently remove this staff member from the system. This action cannot be undone."
=======
          description="This will deactivate the staff member's account. This action cannot be undone."
>>>>>>> noble
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
          danger
        />
      )}
    </div>
  );
}
