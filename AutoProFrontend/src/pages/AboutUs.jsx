import React from 'react';
import { Link } from 'react-router-dom';
import {
  Target, History, Users, Shield, Award, Clock,
  Wrench, HeartHandshake, ArrowRight, MapPin, Phone
} from 'lucide-react';

const team = [
  { name: 'Rajan Shrestha', role: 'Master Technician', exp: '18 yrs', avatar: 'https://i.pravatar.cc/150?img=52', cert: 'ASE Master Certified' },
  { name: 'Sushila Tamang', role: 'EV Specialist', exp: '7 yrs', avatar: 'https://i.pravatar.cc/150?img=47', cert: 'Tesla & Hyundai EV Cert.' },
  { name: 'Bikash Karki', role: 'Diagnostic Expert', exp: '12 yrs', avatar: 'https://i.pravatar.cc/150?img=59', cert: 'Bosch Diagnostics Cert.' },
  { name: 'Priya Adhikari', role: 'Service Advisor', exp: '9 yrs', avatar: 'https://i.pravatar.cc/150?img=44', cert: 'Customer Relations Pro' },
];

const values = [
  { icon: <Shield size={28} />, title: 'Integrity First', desc: 'We give honest assessments, fair quotes, and never recommend work that isn\'t needed.' },
  { icon: <Award size={28} />, title: 'Certified Excellence', desc: 'Every technician holds internationally recognized certifications and undergoes annual re-training.' },
  { icon: <HeartHandshake size={28} />, title: 'Community Driven', desc: 'Born and grown in Nepal, we\'re invested in building long-lasting relationships with our customers.' },
  { icon: <Clock size={28} />, title: 'On-Time Promise', desc: 'If we estimate 2 hours, we deliver in 2 hours. Your time is as valuable as your vehicle.' },
];

const milestones = [
  { year: '2010', event: 'AutoPro founded in a 3-bay garage in Pulchowk, Lalitpur.' },
  { year: '2014', event: 'Expanded to 12-bay facility. Crossed 1,000 satisfied customers.' },
  { year: '2017', event: 'Launched online parts inventory and booking platform.' },
  { year: '2020', event: 'Opened EV Service Wing — first in the Kathmandu Valley.' },
  { year: '2024', event: '5,000+ customers milestone. New Ring Road flagship location opened.' },
];

const stats = [
  { val: '20+', label: 'Years Experience' },
  { val: '5k+', label: 'Cars Serviced' },
  { val: '10k+', label: 'Parts in Stock' },
  { val: '100%', label: 'OEM Guarantee' },
];

export default function AboutUs() {
  return (
    <div className="py-16 animate-[fadeIn_0.5s_ease-out] transition-colors">

      {/* ─── Hero ─── */}
      <div className="text-center mb-24 relative">
        <div className="absolute top-[-60%] left-[50%] -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full -z-10" />
        <div className="inline-flex items-center gap-2.5 bg-primary/10 px-5 py-2 rounded-full text-sm font-bold text-primary mb-8 border border-primary/20">
          <History size={16} /> About AutoPro
        </div>
        <h1 className="text-6xl lg:text-7xl font-black text-foreground mb-6 tracking-tighter font-display leading-[1.05]">
          Driven by Quality<br />
          <span className="bg-linear-to-r from-primary via-blue-400 to-indigo-600 bg-clip-text text-transparent">& Unwavering Trust</span>
        </h1>
        <p className="text-muted text-xl max-w-[680px] mx-auto font-medium leading-relaxed">
          Since 2010, AutoPro has been the Kathmandu Valley's most trusted auto repair and genuine parts destination — built on transparency and performance.
        </p>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-32">
        {stats.map((s, i) => (
          <div key={i} className="group bg-card border border-border rounded-[2rem] p-8 text-center transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.1)]">
            <div className="text-5xl font-black font-display text-foreground mb-2 group-hover:text-primary transition-colors">{s.val}</div>
            <div className="text-xs font-black uppercase tracking-widest text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Story ─── */}
      <div className="flex gap-16 items-center mb-32 max-md:flex-col group">
        <div className="flex-1 text-lg text-muted leading-relaxed transition-colors">
          <div className="inline-flex items-center gap-2 mb-6 text-primary font-bold uppercase tracking-widest text-sm">
            <span className="w-8 h-[2px] bg-primary" /> Our Story
          </div>
          <h2 className="text-4xl font-black font-display text-foreground tracking-tight mb-6">
            Started with a mission to fix what was broken — in cars and in the industry.
          </h2>
          <p className="mb-6">
            <strong className="text-foreground font-black">AutoPro Garage</strong> was founded with a single mission: to bring transparency and premium quality to the auto repair industry in Nepal. We noticed customers struggled to find verified, authentic vehicle parts and reliable mechanical services under one roof.
          </p>
          <p className="mb-6 font-medium">
            Today, with an inventory of over 10,000 distinct OEM parts and a team of globally certified mechanics, AutoPro proudly serves over 5,000 drivers. Whether it's an emergency brake pad replacement or a full engine rebuild, we treat every vehicle as if it were our own.
          </p>
          <p className="font-medium italic border-l-4 border-primary pl-6 py-2 text-foreground/80 rounded-r-xl bg-primary/5">
            "Our state-of-the-art facility is equipped with the latest diagnostic tools, ensuring your vehicle receives the exact care it needs. We believe in getting it right the first time, every time."
          </p>
        </div>
        <div className="flex-1 relative">
          <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-30 group-hover:opacity-50 transition-opacity" />
          <div className="relative rounded-[3rem] shadow-2xl overflow-hidden border-8 border-card">
            <img
              src="https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&q=80&w=1000"
              alt="AutoPro Premium Garage Interior"
              className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </div>

      {/* ─── Values ─── */}
      <section className="mb-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 text-primary font-bold uppercase tracking-widest text-sm">
            <span className="w-8 h-[2px] bg-primary" /> Our Values
          </div>
          <h2 className="text-5xl font-black text-foreground tracking-tight font-display">What we stand for</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <div key={i} className="group bg-card border border-border rounded-[2.5rem] p-8 transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-indigo-500 scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100" />
              <div className="w-16 h-16 bg-background text-primary border border-border rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-500">
                {v.icon}
              </div>
              <h3 className="text-xl font-black text-foreground font-display mb-3 group-hover:text-primary transition-colors">{v.title}</h3>
              <p className="text-muted font-medium leading-relaxed text-sm">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Timeline ─── */}
      <section className="mb-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 text-primary font-bold uppercase tracking-widest text-sm">
            <span className="w-8 h-[2px] bg-primary" /> Our Journey
          </div>
          <h2 className="text-5xl font-black text-foreground tracking-tight font-display">Milestones</h2>
        </div>
        <div className="relative max-w-[700px] mx-auto">
          <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-linear-to-b from-primary to-indigo-500 opacity-20" />
          {milestones.map((m, i) => (
            <div key={i} className="relative flex gap-10 mb-12 group">
              <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-card border-2 border-border group-hover:border-primary group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center font-black text-xs font-display transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_10px_20px_rgba(37,99,235,0.3)]">
                {m.year}
              </div>
              <div className="flex-1 bg-card border border-border rounded-3xl px-8 py-6 group-hover:border-primary/30 transition-all">
                <p className="text-foreground font-medium leading-relaxed">{m.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Team ─── */}
      <section className="mb-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 text-primary font-bold uppercase tracking-widest text-sm">
            <span className="w-8 h-[2px] bg-primary" /> The Team
          </div>
          <h2 className="text-5xl font-black text-foreground tracking-tight font-display">The experts behind your car</h2>
          <p className="text-muted text-lg font-medium mt-4 max-w-[500px] mx-auto">Certified, passionate, and 100% committed to your vehicle's performance.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <div key={i} className="group bg-card border border-border rounded-[2.5rem] p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-indigo-500 scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100" />
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-5 ring-4 ring-border group-hover:ring-primary/40 transition-all shadow-xl">
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-black text-foreground font-display mb-1 group-hover:text-primary transition-colors">{member.name}</h3>
              <p className="text-primary text-xs font-black uppercase tracking-widest mb-3">{member.role}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted font-semibold mb-4">
                <Wrench size={14} /> {member.exp} experience
              </div>
              <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full">
                {member.cert}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative bg-card border border-border rounded-[4rem] py-24 px-12 text-center overflow-hidden group">
        <div className="absolute top-0 right-[20%] w-[600px] h-[600px] bg-primary/10 blur-[130px] rounded-full group-hover:scale-110 transition-transform duration-[3s]" />
        <div className="relative z-10 max-w-[600px] mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2 rounded-full text-sm font-bold mb-8 border border-primary/20">
            <Target size={16} /> Get In Touch
          </div>
          <h2 className="text-5xl font-black text-foreground font-display tracking-tight mb-6">
            Join 5,000+ satisfied drivers
          </h2>
          <p className="text-muted text-xl font-medium leading-relaxed mb-12">
            Experience the AutoPro difference. Book your first service today and receive a free full vehicle health check.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="inline-flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-2xl font-black text-lg shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] hover:-translate-y-1 transition-all">
              Get Started Free <ArrowRight size={20} />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-3 bg-background border border-border text-foreground px-10 py-5 rounded-2xl font-black text-lg hover:-translate-y-1 hover:border-primary/40 transition-all">
              <MapPin size={20} className="text-primary" /> Visit Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
