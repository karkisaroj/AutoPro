import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Car, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';

const perks = [
  'Real-time service tracking & live status',
  '12-month warranty on all work',
  'Digital service history & receipts',
  'Exclusive member discounts on parts',
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });
      login(data);
      navigate('/customer');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const strength = form.password.length >= 8
    ? form.password.match(/[A-Z]/) && form.password.match(/[0-9]/)
      ? 'strong'
      : 'medium'
    : form.password.length > 0
    ? 'weak'
    : '';

  const strengthColor = { strong: 'bg-emerald-500', medium: 'bg-yellow-400', weak: 'bg-red-500' };
  const strengthWidth = { strong: 'w-full', medium: 'w-2/3', weak: 'w-1/3' };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 animate-[fadeIn_0.5s_ease-out] relative">
      <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-[900px] flex gap-10 max-md:flex-col">

        {/* Left panel */}
        <div className="flex-1 flex flex-col justify-center max-md:text-center">
          <Link to="/" className="flex items-center gap-3 group mb-10 max-md:justify-center">
            <div className="bg-linear-to-br from-primary to-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(37,99,235,0.35)] group-hover:scale-110 transition-transform">
              <Car size={28} />
            </div>
            <span className="font-display text-3xl font-black tracking-tighter text-foreground">AutoPro<span className="text-primary">.</span></span>
          </Link>

          <h1 className="text-4xl font-black font-display text-foreground mb-4 tracking-tight leading-tight">
            Join 5,000+<br />satisfied drivers
          </h1>
          <p className="text-muted font-medium leading-relaxed mb-10">
            Create your free account and get access to real-time service tracking, digital receipts, and exclusive member benefits.
          </p>

          <ul className="space-y-4">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-4 text-sm font-semibold text-muted max-md:justify-center">
                <span className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                  <Check size={14} strokeWidth={3} />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* Right panel — Form */}
        <div className="flex-1">
          <div className="bg-card border border-border rounded-[3rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-2xl font-black font-display text-foreground mb-2">Create your account</h2>
              <p className="text-muted font-medium text-sm mb-8">Free forever. No credit card required.</p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-5 py-4 rounded-2xl mb-6 text-sm font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="group">
                  <label className="block text-xs font-black uppercase tracking-widest text-muted mb-2.5 group-focus-within:text-primary transition-colors">Full Name *</label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange} required
                    placeholder="Roshan Sthapit"
                    className="w-full bg-background border border-border px-5 py-4 rounded-2xl text-foreground transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-medium placeholder:text-muted/40 text-sm"
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-black uppercase tracking-widest text-muted mb-2.5 group-focus-within:text-primary transition-colors">Email Address *</label>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange} required
                    placeholder="you@example.com"
                    className="w-full bg-background border border-border px-5 py-4 rounded-2xl text-foreground transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-medium placeholder:text-muted/40 text-sm"
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-black uppercase tracking-widest text-muted mb-2.5 group-focus-within:text-primary transition-colors">Phone Number</label>
                  <input
                    type="tel" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="+977 98XXXXXXXX"
                    className="w-full bg-background border border-border px-5 py-4 rounded-2xl text-foreground transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-medium placeholder:text-muted/40 text-sm"
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-black uppercase tracking-widest text-muted mb-2.5 group-focus-within:text-primary transition-colors">Password *</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required
                      placeholder="Min. 8 chars, uppercase & number"
                      className="w-full bg-background border border-border px-5 py-4 pr-14 rounded-2xl text-foreground transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-medium placeholder:text-muted/40 text-sm"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary p-1">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {strength && (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${strengthColor[strength]} ${strengthWidth[strength]}`} />
                      </div>
                      <span className={`text-xs font-black capitalize ${strength === 'strong' ? 'text-emerald-500' : strength === 'medium' ? 'text-yellow-500' : 'text-red-500'}`}>{strength}</span>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="block text-xs font-black uppercase tracking-widest text-muted mb-2.5 group-focus-within:text-primary transition-colors">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handleChange} required
                      placeholder="••••••••"
                      className={`w-full bg-background border px-5 py-4 pr-14 rounded-2xl text-foreground transition-all focus:ring-4 outline-none font-medium placeholder:text-muted/40 text-sm ${form.confirm && form.confirm !== form.password ? 'border-red-400 focus:ring-red-400/10 focus:border-red-400' : 'border-border focus:border-primary focus:ring-primary/10'}`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary p-1">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit" disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-3 bg-primary text-white py-4.5 rounded-2xl font-black text-base shadow-xl hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-700" />
                  {submitting ? 'Creating account…' : 'Create Account'}
                  <UserPlus size={18} />
                </button>

                <p className="text-center text-sm text-muted font-medium pt-2">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary font-black hover:underline inline-flex items-center gap-1">
                    Sign in <ArrowRight size={14} />
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
