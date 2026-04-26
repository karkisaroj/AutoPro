import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wrench, Check, Shield, Zap } from 'lucide-react';
import nepaliGarage from '../assets/nepali-garage.png';

export default function Home() {
  return (
    <>
      {/* ── Hero Section ── */}
      <main className="flex items-center justify-between mt-20 gap-16 pb-[120px] animate-[fadeIn_0.8s_ease-out] max-md:flex-col max-md:text-center max-md:gap-16 relative">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-60 dark:opacity-20 animate-[float_8s_ease-in-out_infinite]"></div>
        
        <div className="flex-1 max-w-[650px] relative z-10">
          <div className="inline-flex items-center gap-3 bg-card/60 backdrop-blur-md px-6 py-2.5 rounded-full text-[0.8rem] font-black tracking-widest text-primary mb-10 border border-primary/20 shadow-[0_0_20px_rgba(37,99,235,0.15)] transition-all">
            <span className="relative flex w-2.5 h-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-primary"></span>
            </span>
            PROFESSIONAL AUTO GARAGE
          </div>

          <h1 className="text-7xl lg:text-[5.5rem] leading-[1.05] font-black tracking-tighter mb-8 text-foreground font-display transition-colors">
            Your Trusted<br/>
            <span className="bg-linear-to-r from-primary via-blue-400 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">Auto Repair</span><br/>
            Partner.
          </h1>

          <p className="text-xl leading-relaxed text-muted mb-12 max-w-[540px] max-md:mx-auto transition-colors font-medium">
            We provide expert vehicle repairs, genuine auto parts, and transparent service. Manage your vehicle&apos;s health and view our available inventory right from your dashboard.
          </p>

          <div className="flex flex-wrap gap-5 mb-14 max-md:justify-center">
            <button className="group relative inline-flex items-center gap-3 bg-primary text-white border-2 border-primary px-10 py-5 text-lg font-black rounded-2xl cursor-pointer transition-all duration-300 shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] hover:-translate-y-1 overflow-hidden">
              <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></span>
              <span className="relative z-10 flex items-center gap-3">
                Access Dashboard
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button className="group inline-flex items-center gap-3 bg-card/80 backdrop-blur-sm text-foreground border border-border px-10 py-5 text-lg font-black rounded-2xl cursor-pointer transition-all duration-300 hover:bg-foreground hover:text-background hover:border-transparent hover:-translate-y-1 shadow-lg hover:shadow-2xl">
              View Inventory
            </button>
          </div>

          <div className="flex items-center gap-6 bg-card/50 backdrop-blur-2xl px-8 py-5 rounded-[2rem] shadow-xl border border-white/10 dark:border-white/5 inline-flex transition-all hover:scale-105 relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent w-0 group-hover:w-full transition-all duration-700"></div>
            <div className="flex relative z-10">
              {[11, 12, 68].map((img, i) => (
                <div key={i} className={`w-12 h-12 rounded-full border-4 border-card overflow-hidden shadow-md transition-transform hover:-translate-y-1 hover:z-20 ${i !== 0 ? '-ml-4' : ''} relative z-10`}>
                  <img src={`https://i.pravatar.cc/100?img=${img}`} alt="driver" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-xs font-black uppercase tracking-widest text-primary mb-0.5">Trusted By</span>
              <span className="text-sm font-medium text-muted">Over <strong className="text-foreground font-black">5,000+</strong> drivers</span>
            </div>
          </div>
        </div>

        <div className="flex-1 relative flex justify-end group mt-10 lg:mt-0">
          <div className="absolute inset-0 bg-linear-to-tr from-primary/30 to-indigo-600/20 blur-[80px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
          
          <div className="relative z-10 w-full max-w-[600px] aspect-[4/5] lg:aspect-[3/4] rounded-[3rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10">
            <img
              src={nepaliGarage}
              alt="Modern high-end garage in Nepal"
              className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[1.5s] ease-out brightness-90 group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-1000"></div>
          </div>

          {/* Floating UI Card */}
          <div className="absolute bottom-[10%] left-[-8%] bg-card/70 backdrop-blur-2xl border border-white/20 p-6 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] flex gap-5 items-center min-w-[360px] animate-[float_6s_ease-in-out_infinite] z-20 max-md:left-4 max-md:right-4 max-md:bottom-[-20px] max-md:min-w-0 transition-all duration-500 hover:scale-[1.02] hover:bg-card/90 cursor-default">
            <div className="w-16 h-16 bg-linear-to-br from-primary to-indigo-600 text-white rounded-[1.25rem] flex justify-center items-center shadow-[0_10px_20px_rgba(37,99,235,0.4)] border border-white/20">
              <Shield size={28} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold font-display text-lg text-foreground tracking-tight">Premium Service</span>
                <span className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <Check size={12} strokeWidth={4} /> Completed
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black font-display text-foreground tracking-tighter shadow-sm">NPR 12,500</span>
                <span className="text-xs text-muted font-semibold">Today, 2:30 PM</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Services Summary ── */}
      <section className="py-24 transition-colors relative">
        <div className="absolute top-[20%] right-[-5%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] -z-10"></div>
        <div className="flex justify-between items-end mb-16 max-md:flex-col max-md:items-center max-md:text-center max-md:gap-8 relative z-10">
          <div className="max-w-[600px]">
            <div className="inline-flex items-center gap-2 mb-4 text-primary font-bold uppercase tracking-widest text-sm">
              <span className="w-8 h-[2px] bg-primary"></span>
              Our Expertise
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-foreground mb-6 tracking-tighter font-display leading-[1.05]">Elite services for your machine</h2>
            <p className="text-muted text-xl font-medium leading-relaxed">Professional grade maintenance, digital diagnostics, and authentic components engineered for performance.</p>
          </div>
          <Link to="/services" className="group flex items-center gap-3 bg-card border border-border px-8 py-4 rounded-full text-foreground font-bold hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300 shadow-sm hover:shadow-md">
            Explore All Services 
            <span className="bg-primary/10 p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <ArrowRight size={18} />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {[
            { icon: <Zap size={28} />, title: 'Diagnostics', desc: 'Precision digital scanning for all modern vehicle systems utilizing state-of-the-art OBD tools.' },
            { icon: <Wrench size={28} />, title: 'Repair', desc: 'Certified mechanical repair using industrial-grade equipment and factory-approved techniques.' },
            { icon: <Shield size={28} />, title: 'Warranty', desc: '12-month absolute peace of mind on all genuine parts and expert labor performed at our garage.' }
          ].map((item, i) => (
            <div key={i} className="group relative bg-card p-10 rounded-[2.5rem] border border-border transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 w-20 h-20 bg-background border border-border text-primary rounded-[1.5rem] flex items-center justify-center mb-10 shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500 group-hover:shadow-[0_10px_20px_rgba(37,99,235,0.3)]">
                {item.icon}
              </div>
              <h3 className="relative z-10 text-3xl font-black mb-4 text-foreground font-display tracking-tight group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="relative z-10 text-muted text-lg font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Performance Banner ── */}
      <section className="relative bg-card border border-border/50 rounded-[4rem] py-24 px-12 flex flex-col justify-center items-center my-24 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_80px_-15px_rgba(37,99,235,0.2)] overflow-hidden group transition-all duration-700 animate-[float_6s_ease-in-out_infinite]">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-10 hidden dark:block"></div>
        <div className="absolute top-0 right-[20%] w-[600px] h-[600px] bg-primary/20 blur-[130px] rounded-full mix-blend-screen opacity-60 group-hover:scale-110 transition-transform duration-[3s] ease-out"></div>
        <div className="absolute bottom-0 left-[20%] w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen opacity-60 group-hover:scale-110 transition-transform duration-[3s] ease-out delay-150"></div>
        
        <div className="w-full flex justify-around max-md:flex-col max-md:gap-16 relative z-10">
          {[
            { label: 'Years Experience', val: '20+' },
            { label: 'Parts in Inventory', val: '15k' },
            { label: 'Satisfied Drivers', val: '12k' }
          ].map((stat, i) => (
            <div key={i} className="text-center relative">
              <div className="text-7xl lg:text-[6rem] font-black font-display mb-4 tracking-tighter text-foreground drop-shadow-sm group-hover:-translate-y-2 transition-transform duration-500">
                {stat.val}
              </div>
              <div className="text-sm border border-primary/20 bg-primary/5 px-5 py-2.5 rounded-full inline-block font-bold uppercase tracking-widest text-primary backdrop-blur-md shadow-[0_10px_30px_rgba(37,99,235,0.1)]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
