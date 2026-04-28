import React, { useState } from 'react';
import {
  Mail, MapPin, Phone, MessageSquare, Send, Clock,
  CheckCircle2, AlertCircle, Globe, MessageCircle, Video
} from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setStatus('success');
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const contactItems = [
    {
      icon: <MapPin size={22} />,
      title: 'Visit Us',
      lines: ['Ring Road, Gwarko', 'Lalitpur, Nepal'],
    },
    {
      icon: <Phone size={22} />,
      title: 'Call Us',
      lines: ['+977 1-4234567', 'Mon–Sat, 8am–7pm'],
    },
    {
      icon: <Mail size={22} />,
      title: 'Email Us',
      lines: ['support@autopro.com.np', 'Reply within 24 hrs'],
    },
    {
      icon: <Clock size={22} />,
      title: 'Working Hours',
      lines: ['Mon – Sat: 8am – 7pm', 'Sunday: 10am – 4pm'],
    },
  ];

  return (
    <div className="py-16 animate-[fadeIn_0.5s_ease-out] transition-colors">

      {/* ─── Hero ─── */}
      <div className="text-center mb-24 relative">
        <div className="absolute top-[-60%] left-[50%] -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full -z-10" />
        <div className="inline-flex items-center gap-2.5 bg-primary/10 px-5 py-2 rounded-full text-sm font-bold text-primary mb-8 border border-primary/20">
          <MessageSquare size={16} /> Contact Us
        </div>
        <h1 className="text-6xl lg:text-7xl font-black text-foreground mb-6 tracking-tighter font-display leading-[1.05]">
          Let's Talk<br />
          <span className="bg-linear-to-r from-primary via-blue-400 to-indigo-600 bg-clip-text text-transparent">Performance</span>
        </h1>
        <p className="text-muted text-xl max-w-[680px] mx-auto font-medium leading-relaxed">
          Have a question, need to book a service, or want a parts quote? Our team responds within 24 hours — often much sooner.
        </p>
      </div>

      {/* ─── Contact Info Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        {contactItems.map((item, i) => (
          <div key={i} className="group bg-card border border-border rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-indigo-500 scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100" />
            <div className="w-14 h-14 bg-background text-primary border border-border rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all duration-300">
              {item.icon}
            </div>
            <h3 className="text-base font-black text-foreground font-display mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
            {item.lines.map((line, j) => (
              <p key={j} className={`font-medium text-sm leading-relaxed ${j === 0 ? 'text-foreground' : 'text-muted'}`}>{line}</p>
            ))}
          </div>
        ))}
      </div>

      {/* ─── Main Content: Form + Map ─── */}
      <div className="flex gap-16 max-md:flex-col mb-24">

        {/* Form */}
        <div className="flex-1 bg-card border border-border rounded-[3rem] p-12 shadow-xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <h2 className="text-3xl font-black font-display text-foreground mb-2">Send us a Message</h2>
          <p className="text-muted font-medium mb-10">Fill out the form and we'll get back to you ASAP.</p>

          {status === 'success' && (
            <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-6 py-4 rounded-2xl mb-8 font-semibold">
              <CheckCircle2 size={22} className="flex-shrink-0" />
              Message sent! We'll reply within 24 hours.
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl mb-8 font-semibold">
              <AlertCircle size={22} className="flex-shrink-0" />
              Something went wrong. Please try again.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-xs font-black uppercase tracking-widest text-muted mb-3 group-focus-within:text-primary transition-colors">Full Name *</label>
                <input
                  type="text" name="name" value={form.name} onChange={handleChange} required
                  placeholder="Roshan Sthapit"
                  className="w-full bg-background border border-border px-6 py-4 rounded-2xl text-foreground transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-medium placeholder:text-muted/40"
                />
              </div>
              <div className="group">
                <label className="block text-xs font-black uppercase tracking-widest text-muted mb-3 group-focus-within:text-primary transition-colors">Email Address *</label>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange} required
                  placeholder="you@example.com"
                  className="w-full bg-background border border-border px-6 py-4 rounded-2xl text-foreground transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-medium placeholder:text-muted/40"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-xs font-black uppercase tracking-widest text-muted mb-3 group-focus-within:text-primary transition-colors">Phone Number</label>
                <input
                  type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="+977 98XXXXXXXX"
                  className="w-full bg-background border border-border px-6 py-4 rounded-2xl text-foreground transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-medium placeholder:text-muted/40"
                />
              </div>
              <div className="group">
                <label className="block text-xs font-black uppercase tracking-widest text-muted mb-3 group-focus-within:text-primary transition-colors">Subject</label>
                <select
                  name="subject" value={form.subject} onChange={handleChange}
                  className="w-full bg-background border border-border px-6 py-4 rounded-2xl text-foreground transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-medium appearance-none"
                >
                  <option value="">Select a topic…</option>
                  <option>Service Booking</option>
                  <option>Parts Inquiry</option>
                  <option>Warranty Claim</option>
                  <option>General Question</option>
                </select>
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-black uppercase tracking-widest text-muted mb-3 group-focus-within:text-primary transition-colors">Message *</label>
              <textarea
                name="message" value={form.message} onChange={handleChange} required rows="5"
                placeholder="Describe your vehicle issue, parts needed, or any questions…"
                className="w-full bg-background border border-border px-6 py-4 rounded-2xl text-foreground transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-medium resize-none placeholder:text-muted/40"
              />
            </div>
            <button
              type="submit" disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-3 bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-700" />
              {submitting ? 'Sending…' : 'Send Message'}
              <Send size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Map + Socials */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex-1 rounded-[3rem] overflow-hidden border-8 border-card shadow-2xl min-h-[350px] relative">
            <iframe
              title="AutoPro Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.0!2d85.3240!3d27.6727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDQwJzIxLjciTiA4NcKwMTknMjYuNCJF!5e0!3m2!1sen!2snp!4v1680000000000!5m2!1sen!2snp"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '350px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Social Links */}
          <div className="bg-card border border-border rounded-3xl p-8">
            <h3 className="text-xl font-black font-display text-foreground mb-6">Follow Our Journey</h3>
            <div className="flex gap-4">
              {[
                { icon: <Globe size={20} />, label: 'Website', color: 'hover:bg-blue-600' },
                { icon: <MessageCircle size={20} />, label: 'Viber', color: 'hover:bg-violet-600' },
                { icon: <Video size={20} />, label: 'YouTube', color: 'hover:bg-red-600' },
              ].map((s) => (
                <a key={s.label} href="#" className={`flex items-center gap-3 bg-background border border-border text-foreground font-bold text-sm px-5 py-3 rounded-xl transition-all ${s.color} hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:shadow-lg`}>
                  {s.icon} {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Hours */}
          <div className="bg-linear-to-br from-primary to-indigo-700 text-white rounded-3xl p-8">
            <h3 className="text-xl font-black font-display mb-6 flex items-center gap-3">
              <Clock size={22} /> Quick Info
            </h3>
            <ul className="space-y-3">
              {[
                ['Monday – Friday', '8:00 AM – 7:00 PM'],
                ['Saturday', '8:00 AM – 7:00 PM'],
                ['Sunday', '10:00 AM – 4:00 PM'],
              ].map(([day, hours]) => (
                <li key={day} className="flex justify-between text-sm font-semibold border-b border-white/10 pb-3 last:border-0 last:pb-0">
                  <span className="text-white/80">{day}</span>
                  <span className="text-white font-black">{hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
