import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Car, ArrowRight } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    // Simulate auth — replace with real API call
    if (form.email && form.password) {
      navigate('/dashboard');
    } else {
      setError('Please fill in all fields.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 animate-[fadeIn_0.5s_ease-out] relative">
      {/* Background orbs */}
      <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-linear-to-br from-primary to-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(37,99,235,0.35)] group-hover:scale-110 transition-transform">
              <Car size={28} />
            </div>
            <span className="font-display text-3xl font-black tracking-tighter text-foreground">AutoPro<span className="text-primary">.</span></span>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-[3rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h1 className="text-3xl font-black font-display text-foreground mb-2 tracking-tight">Welcome back</h1>
            <p className="text-muted font-medium mb-10">Sign in to access your AutoPro dashboard.</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-5 py-4 rounded-2xl mb-8 text-sm font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label className="block text-xs font-black uppercase tracking-widest text-muted mb-3 group-focus-within:text-primary transition-colors">Email Address</label>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange} required
                  placeholder="you@example.com"
                  className="w-full bg-background border border-border px-6 py-4 rounded-2xl text-foreground transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-medium placeholder:text-muted/40"
                />
              </div>

              <div className="group">
                <div className="flex justify-between mb-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted group-focus-within:text-primary transition-colors">Password</label>
                  <a href="#" className="text-xs font-bold text-primary hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required
                    placeholder="••••••••"
                    className="w-full bg-background border border-border px-6 py-4 pr-14 rounded-2xl text-foreground transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-medium placeholder:text-muted/40"
                  />
                  <button
                    type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors p-1"
                  >
                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-3 bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-700" />
                {submitting ? 'Signing in…' : 'Sign In'}
                <LogIn size={20} />
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-4 text-muted font-bold uppercase tracking-widest">or</span>
              </div>
            </div>

            <p className="text-center text-muted font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-black hover:underline inline-flex items-center gap-1">
                Register free <ArrowRight size={14} />
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted font-medium mt-8">
          By signing in, you agree to our{' '}
          <a href="#" className="text-primary hover:underline font-bold">Terms of Service</a>
          {' & '}
          <a href="#" className="text-primary hover:underline font-bold">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
