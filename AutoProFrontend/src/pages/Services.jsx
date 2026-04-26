import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench, ShieldCheck, Settings, BatteryCharging, Droplet,
  CarFront, Sparkles, ArrowRight, CheckCircle2, Clock, Star,
  ChevronDown, ChevronUp, Phone
} from 'lucide-react';

const services = [
  {
    title: 'Engine Diagnostics',
    desc: 'State-of-the-art OBD-II computer diagnostics to identify and resolve complex engine issues with pinpoint accuracy. Our certified technicians use factory-level tools.',
    icon: <Settings size={36} strokeWidth={1.5} />,
    price: 'NPR 1,500',
    duration: '1–2 hrs',
    features: ['Full ECU scan', 'Error code analysis', 'Sensor calibration', 'Written report'],
    badge: 'Most Popular',
  },
  {
    title: 'Brake Replacement',
    desc: 'Premium OEM brake pads, calipers, and rotors to ensure maximum stopping power. We source directly from certified manufacturers.',
    icon: <ShieldCheck size={36} strokeWidth={1.5} />,
    price: 'NPR 3,500',
    duration: '2–3 hrs',
    features: ['OEM pads & rotors', 'Caliper inspection', 'Brake fluid check', '12-month warranty'],
    badge: null,
  },
  {
    title: 'Suspension Tuning',
    desc: 'Expert strut, shock, and alignment service to restore your vehicle\'s factory-smooth ride and handling dynamics.',
    icon: <Wrench size={36} strokeWidth={1.5} />,
    price: 'NPR 4,200',
    duration: '3–4 hrs',
    features: ['4-wheel alignment', 'Strut inspection', 'Bushing check', 'Steering calibration'],
    badge: null,
  },
  {
    title: 'EV Battery Service',
    desc: 'Specialized maintenance, health checks, and cell balancing for modern electric vehicle battery arrays and charging systems.',
    icon: <BatteryCharging size={36} strokeWidth={1.5} />,
    price: 'NPR 5,000',
    duration: '2–4 hrs',
    features: ['Cell health scan', 'Thermal management', 'Charge optimization', 'Range analysis'],
    badge: 'New',
  },
  {
    title: 'Fluid Exchange',
    desc: 'Comprehensive transmission, coolant, power steering, and brake fluid exchanges using manufacturer-spec fluids.',
    icon: <Droplet size={36} strokeWidth={1.5} />,
    price: 'NPR 800',
    duration: '45 mins',
    features: ['OEM-spec fluids', 'System flush', 'Leak inspection', 'Top-up service'],
    badge: null,
  },
  {
    title: 'Full Detailing',
    desc: 'Professional interior and exterior detailing using premium ceramic sealants, paint correction, and steam cleaning.',
    icon: <CarFront size={36} strokeWidth={1.5} />,
    price: 'NPR 6,500',
    duration: '4–6 hrs',
    features: ['Ceramic coating', 'Paint correction', 'Interior steam clean', 'Tyre dressing'],
    badge: null,
  },
];

const processSteps = [
  { step: '01', title: 'Book Online', desc: 'Schedule your appointment through our dashboard in under 2 minutes.' },
  { step: '02', title: 'Drop Your Vehicle', desc: 'Bring your car to our Ring Road facility. Free parking available.' },
  { step: '03', title: 'Live Diagnostics', desc: 'Watch our technicians work live via our garage CCTV feed on your phone.' },
  { step: '04', title: 'Drive Away Happy', desc: 'Receive a full digital service report and 12-month warranty on all work.' },
];

const faqs = [
  { q: 'Do you use genuine OEM parts?', a: 'Yes, 100%. We source directly from certified distributors and every part comes with a manufacturer certificate of authenticity.' },
  { q: 'How do I track my vehicle\'s service status?', a: 'Once registered, your Dashboard shows real-time status updates, technician notes, and estimated completion time.' },
  { q: 'Is there a warranty on work done?', a: 'All labor and parts carry a minimum 12-month / 15,000 km warranty, whichever comes first.' },
  { q: 'What vehicles do you service?', a: 'We service all makes and models — Japanese, European, American, and EVs. We have specialist technicians for each category.' },
];

export default function Services() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="py-16 animate-[fadeIn_0.5s_ease-out] transition-colors">

      {/* ─── Hero ─── */}
      <div className="text-center mb-24 relative">
        <div className="absolute top-[-60%] left-[50%] -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full -z-10" />
        <div className="inline-flex items-center gap-2.5 bg-primary/10 px-5 py-2 rounded-full text-sm font-bold text-primary mb-8 border border-primary/20">
          <Sparkles size={16} /> Our Services
        </div>
        <h1 className="text-6xl lg:text-7xl font-black text-foreground mb-6 tracking-tighter font-display leading-[1.05]">
          Elite Automotive<br />
          <span className="bg-linear-to-r from-primary via-blue-400 to-indigo-600 bg-clip-text text-transparent">Care & Repair</span>
        </h1>
        <p className="text-muted text-xl max-w-[680px] mx-auto font-medium leading-relaxed mb-12">
          Factory-trained technicians, the latest diagnostic machinery, and 100% genuine OEM parts — all under one roof in Lalitpur, Nepal.
        </p>
        <div className="flex items-center justify-center gap-10 text-sm font-bold text-muted">
          {[['★ 4.9/5', 'Google Rating'], ['5,000+', 'Cars Serviced'], ['12 mo', 'Warranty']].map(([val, label]) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-black text-foreground">{val}</span>
              <span className="uppercase tracking-widest text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Service Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
        {services.map((svc, idx) => (
          <div
            key={idx}
            className="group relative bg-card rounded-[2.5rem] p-10 border border-border transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(37,99,235,0.15)] hover:border-primary/40 overflow-hidden flex flex-col"
          >
            {/* Top bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-indigo-500 scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100" />
            {/* Glow */}
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {svc.badge && (
              <span className="absolute top-6 right-6 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full">
                {svc.badge}
              </span>
            )}

            <div className="relative z-10 w-20 h-20 bg-background text-primary rounded-3xl flex items-center justify-center mb-8 shadow-sm border border-border group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all duration-500">
              {svc.icon}
            </div>

            <h3 className="relative z-10 text-2xl font-black mb-3 text-foreground font-display tracking-tight group-hover:text-primary transition-colors">{svc.title}</h3>
            <p className="relative z-10 text-muted text-[1.05rem] leading-relaxed font-medium mb-8 flex-1">{svc.desc}</p>

            <ul className="relative z-10 space-y-2.5 mb-8">
              {svc.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm font-semibold text-muted">
                  <CheckCircle2 size={16} className="text-primary flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>

            <div className="relative z-10 flex items-center justify-between pt-6 border-t border-border/60">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-muted mb-1">Starting from</div>
                <div className="text-2xl font-black text-foreground font-display">{svc.price}</div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted font-semibold bg-background border border-border px-4 py-2 rounded-full">
                <Clock size={14} /> {svc.duration}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── How It Works ─── */}
      <section className="mb-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 text-primary font-bold uppercase tracking-widest text-sm">
            <span className="w-8 h-[2px] bg-primary" /> The Process
          </div>
          <h2 className="text-5xl font-black text-foreground tracking-tight font-display">Simple. Transparent. Fast.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-[2px] bg-linear-to-r from-primary/30 via-primary to-primary/30" />
          {processSteps.map((s, i) => (
            <div key={i} className="relative flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-card border-2 border-border group-hover:border-primary group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center text-2xl font-black font-display mb-6 shadow-xl transition-all duration-500 relative z-10 group-hover:scale-110 group-hover:shadow-[0_10px_30px_rgba(37,99,235,0.3)]">
                {s.step}
              </div>
              <h3 className="text-xl font-black text-foreground font-display mb-3 group-hover:text-primary transition-colors">{s.title}</h3>
              <p className="text-muted font-medium leading-relaxed text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="mb-32 max-w-[800px] mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 text-primary font-bold uppercase tracking-widest text-sm">
            <span className="w-8 h-[2px] bg-primary" /> FAQ
          </div>
          <h2 className="text-5xl font-black text-foreground tracking-tight font-display">Common Questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`bg-card border rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer ${openFaq === i ? 'border-primary/40 shadow-[0_10px_30px_rgba(37,99,235,0.1)]' : 'border-border hover:border-primary/20'}`}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="flex items-center justify-between px-8 py-6">
                <span className="font-black text-foreground font-display text-lg">{faq.q}</span>
                {openFaq === i ? <ChevronUp size={20} className="text-primary flex-shrink-0" /> : <ChevronDown size={20} className="text-muted flex-shrink-0" />}
              </div>
              {openFaq === i && (
                <div className="px-8 pb-6 text-muted font-medium leading-relaxed border-t border-border/50">
                  <div className="pt-4">{faq.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="relative bg-linear-to-br from-primary to-indigo-700 rounded-[4rem] py-24 px-12 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-5 py-2 rounded-full text-sm font-bold mb-8 border border-white/30">
            <Star size={16} fill="white" /> Limited slots available this week
          </div>
          <h2 className="text-5xl lg:text-6xl font-black text-white font-display mb-6 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-white/80 text-xl font-medium mb-12 max-w-[500px] mx-auto leading-relaxed">
            Book your service in minutes. No hidden fees, no surprises — just expert care.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="inline-flex items-center gap-3 bg-white text-primary px-10 py-5 rounded-2xl font-black text-lg transition-all hover:-translate-y-1 hover:shadow-2xl shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
              Book Now <ArrowRight size={20} />
            </Link>
            <a href="tel:+97714234567" className="inline-flex items-center gap-3 bg-white/10 border border-white/30 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all hover:bg-white/20 hover:-translate-y-1">
              <Phone size={20} /> Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
