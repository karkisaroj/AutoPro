import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, MessageCircle, Globe, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border border-border/50 text-foreground py-24 pb-12 mt-24 rounded-[4rem] mb-6 mx-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_80px_-15px_rgba(37,99,235,0.15)] transition-all duration-700 relative overflow-hidden group animate-[float_8s_ease-in-out_infinite]">
      {/* Dynamic Background Glow */}
      <div className="absolute top-[-20%] right-[10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen -z-10 group-hover:bg-primary/20 transition-colors duration-1000"></div>
      <div className="absolute bottom-[-10%] left-[5%] w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen -z-10"></div>

      <div className="max-w-7xl mx-auto px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-20">
          <div className="flex flex-col gap-8">
            <Link to="/" className="flex items-center gap-3 group/brand">
              <div className="bg-primary text-white w-12 h-12 rounded-2xl flex justify-center items-center shadow-[0_10px_20px_rgba(37,99,235,0.3)] group-hover/brand:rotate-12 group-hover/brand:scale-110 transition-all duration-300">
                <Car size={24} />
              </div>
              <span className="font-display text-2xl font-black tracking-tighter text-foreground">AutoPro<span className="text-primary">.</span></span>
            </Link>
            <p className="text-muted leading-relaxed font-medium">
              Your trusted partner for professional auto repair and high-quality genuine parts in Nepal. Since 2010.
            </p>
            <div className="flex gap-4">
              {[Globe, MessageCircle, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-background border border-border/50 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] text-muted">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col">
            <h4 className="text-sm font-black uppercase tracking-widest mb-10 text-muted">Services</h4>
            <ul className="list-none p-0 flex flex-col gap-5">
              {['Engine Tuneup', 'Brake Service', 'Oil Exchange', 'Full Detailing'].map((link) => (
                <li key={link}>
                  <Link to="/services" className="text-foreground font-bold hover:text-primary flex items-center gap-2 transition-colors group/link">
                    {link}
                    <ArrowUpRight size={14} className="opacity-0 group-hover/link:opacity-100 -translate-x-2 group-hover/link:translate-x-0 transition-all text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="text-sm font-black uppercase tracking-widest mb-10 text-muted">Company</h4>
            <ul className="list-none p-0 flex flex-col gap-5">
              {['About Us', 'Our Team', 'Inventory', 'Contact'].map((link) => (
                <li key={link}>
                  <Link to={`/${link.toLowerCase().replace(' ', '')}`} className="text-foreground font-bold hover:text-primary transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="text-sm font-black uppercase tracking-widest mb-10 text-muted">Newsletter</h4>
            <p className="text-muted mb-6 font-medium">Subscribe for service updates and performance tips.</p>
            <div className="flex gap-2">
              <input type="text" placeholder="Email" className="bg-background border border-border/50 rounded-xl px-4 py-3 flex-1 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground" />
              <button className="bg-primary text-white p-3 rounded-xl hover:scale-105 transition-transform shadow-[0_5px_15px_rgba(37,99,235,0.3)]"><ArrowUpRight size={20} /></button>
            </div>
          </div>
        </div>
        
        <div className="mt-24 pt-10 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted text-sm font-bold uppercase tracking-widest leading-loose">
            &copy; {new Date().getFullYear()} AutoPro Garage Hub. Crafting excellence on the road.
          </p>
          <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-muted">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
