import React, { useState, useEffect } from 'react';
import { User, Car, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { PageHeader, Spinner } from '../../components/ui/index';
import { useAuth } from '../../context/AuthContext';
import { getCustomerById, updateCustomer, addVehicle, removeVehicle } from '../../services/customerService';

const EMPTY_VEHICLE = { vehicleType: '', plateNo: '', registrationDate: '' };

export default function CustomerProfile() {
  const { user } = useAuth();
  const [customer,    setCustomer]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [editing,     setEditing]     = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', licenseId: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg,  setProfileMsg]  = useState(null);

  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehicleForm,  setVehicleForm]  = useState(EMPTY_VEHICLE);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [vehicleError, setVehicleError] = useState(null);
  const [removingId,   setRemovingId]   = useState(null);

  const load = () => {
    if (!user?.profileId) { setLoading(false); return; }
    getCustomerById(user.profileId)
      .then(c => {
        setCustomer(c);
        setProfileForm({ name: c.name, phone: c.phone, licenseId: c.licenseId || '' });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(load, [user]);

  const startEdit = () => { setProfileMsg(null); setEditing(true); };
  const cancelEdit = () => {
    setProfileForm({ name: customer.name, phone: customer.phone, licenseId: customer.licenseId || '' });
    setEditing(false);
  };

  const saveProfile = async () => {
    if (!profileForm.name.trim() || !profileForm.phone.trim()) return;
    setSavingProfile(true);
    try {
      await updateCustomer(customer.id, profileForm);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
      setEditing(false);
      load();
    } catch (err) {
      setProfileMsg({ type: 'error', text: err?.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const saveVehicle = async () => {
    if (!vehicleForm.vehicleType.trim() || !vehicleForm.plateNo.trim()) {
      setVehicleError('Vehicle type and plate number are required.');
      return;
    }
    setSavingVehicle(true);
    setVehicleError(null);
    try {
      await addVehicle(customer.id, {
        vehicleType: vehicleForm.vehicleType.trim(),
        plateNo: vehicleForm.plateNo.trim(),
        registrationDate: vehicleForm.registrationDate
          ? new Date(vehicleForm.registrationDate + 'T00:00:00Z').toISOString()
          : null,
      });
      setShowAddVehicle(false);
      setVehicleForm(EMPTY_VEHICLE);
      load();
    } catch (err) {
      setVehicleError(err?.message || 'Failed to add vehicle.');
    } finally {
      setSavingVehicle(false);
    }
  };

  const deleteVehicle = async (vehicleId) => {
    setRemovingId(vehicleId);
    try {
      await removeVehicle(customer.id, vehicleId);
      load();
    } catch {
      // silently ignore
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <PageHeader eyebrow="Customer" title="My Profile" subtitle="Manage your personal details and vehicles." />
      <Spinner />
    </div>
  );

  if (!customer) return (
    <div className="space-y-6">
      <PageHeader eyebrow="Customer" title="My Profile" subtitle="Manage your personal details and vehicles." />
      <p className="text-muted-foreground text-sm">Could not load profile.</p>
    </div>
  );

  return (
    <div className="space-y-6 page-enter">
      <PageHeader eyebrow="Customer" title="My Profile" subtitle="Manage your personal details and registered vehicles." />

      {/* Profile card */}
      <div className="dash-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-foreground">Personal Details</p>
              <p className="text-xs text-muted-foreground">Your name, phone and license information</p>
            </div>
          </div>
          {!editing && (
            <button onClick={startEdit} className="btn-secondary gap-1.5">
              <Edit2 size={13} /> Edit
            </button>
          )}
        </div>

        {profileMsg && (
          <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-2.5 mb-4 border ${
            profileMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400'
          }`}>
            {profileMsg.type === 'success' ? <Check size={14} /> : <X size={14} />}
            {profileMsg.text}
          </div>
        )}

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">License ID</label>
                <input
                  type="text"
                  value={profileForm.licenseId}
                  onChange={e => setProfileForm(f => ({ ...f, licenseId: e.target.value }))}
                  placeholder="L-1234-XXXX"
                  className="form-input"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2 border-t border-border">
              <button onClick={cancelEdit} className="btn-secondary flex-1">Cancel</button>
              <button onClick={saveProfile} disabled={savingProfile} className="btn-primary flex-1 justify-center disabled:opacity-50">
                {savingProfile
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Check size={14} />}
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {[
              ['Full Name',  customer.name],
              ['Phone',      customer.phone],
              ['License ID', customer.licenseId || '—'],
              ['Tier',       customer.tier],
              ['Total Spent', `NPR ${Number(customer.totalSpent).toLocaleString()}`],
              ['Member Since', customer.joinDate || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-xs text-muted-foreground w-24 flex-shrink-0 pt-0.5">{label}</span>
                <span className="text-sm font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vehicles card */}
      <div className="dash-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Car size={18} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-foreground">My Vehicles</p>
              <p className="text-xs text-muted-foreground">{customer.vehicles?.length || 0} vehicle{(customer.vehicles?.length || 0) !== 1 ? 's' : ''} registered</p>
            </div>
          </div>
          <button onClick={() => { setVehicleError(null); setVehicleForm(EMPTY_VEHICLE); setShowAddVehicle(v => !v); }} className="btn-secondary gap-1.5">
            <Plus size={13} /> Add Vehicle
          </button>
        </div>

        {showAddVehicle && (
          <div className="bg-muted/30 border border-border rounded-xl p-4 mb-4 space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Vehicle</p>
            {vehicleError && (
              <p className="text-xs text-red-600 dark:text-red-400">{vehicleError}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="form-label">Vehicle Type / Model <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={vehicleForm.vehicleType}
                  onChange={e => setVehicleForm(f => ({ ...f, vehicleType: e.target.value }))}
                  placeholder="Toyota Corolla 2020"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Plate Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={vehicleForm.plateNo}
                  onChange={e => setVehicleForm(f => ({ ...f, plateNo: e.target.value }))}
                  placeholder="BA 1 PA 1234"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Registration Date</label>
                <input
                  type="date"
                  value={vehicleForm.registrationDate}
                  onChange={e => setVehicleForm(f => ({ ...f, registrationDate: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddVehicle(false)} className="btn-secondary">Cancel</button>
              <button onClick={saveVehicle} disabled={savingVehicle} className="btn-primary disabled:opacity-50">
                {savingVehicle
                  ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Plus size={13} />}
                {savingVehicle ? 'Adding…' : 'Add Vehicle'}
              </button>
            </div>
          </div>
        )}

        {!customer.vehicles?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Car size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No vehicles registered yet.</p>
            <p className="text-xs mt-1">Click "Add Vehicle" to register your first vehicle.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {customer.vehicles.map(v => (
              <div key={v.id} className="flex items-center gap-4 bg-muted/20 border border-border rounded-xl px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Car size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{v.vehicleType}</p>
                  <p className="text-xs text-muted-foreground font-mono">{v.plateNo}</p>
                </div>
                <button
                  onClick={() => deleteVehicle(v.id)}
                  disabled={removingId === v.id}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-300 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Remove vehicle"
                >
                  {removingId === v.id
                    ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    : <Trash2 size={13} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
