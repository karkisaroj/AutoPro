import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LogIn, Sun, Moon, Menu, X, Zap } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Services', to: '/services' },
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <header className={`sticky top-3 z-50 mx-auto transition-all duration-300 ${scrolled
        ? 'bg-card/80 backdrop-blur-xl border border-border shadow-xl shadow-black/5'
        : 'bg-card/60 backdrop-blur-md border border-border/60'
      } rounded-2xl px-5 py-3`}
    >
      <div className="flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/30 transition-transform duration-200 group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
              <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H9.3a2 2 0 0 0-1.6.8L5 11l-5.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 0 4 0a2 2 0 0 0-4 0Zm-14 0a2 2 0 1 0 4 0a2 2 0 0 0-4 0Z" />
            </svg>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="font-display text-xl font-black tracking-tight text-foreground">AutoPro</span>
            <span className="text-primary font-black">.</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${isActive
                  ? 'text-primary bg-primary/8'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card-hover'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer
              ${isDark
                ? 'border-border bg-card text-amber-400 hover:bg-card-hover hover:border-amber-400/40'
                : 'border-border bg-card text-slate-600 hover:bg-card-hover hover:border-primary/30 hover:text-primary'
              }
            `}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark
              ? <Sun size={17} />
              : <Moon size={17} />
            }
          </button>

          <Link
            to="/login"
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
              text-foreground hover:bg-card-hover border border-border transition-all duration-200"
          >
            <LogIn size={15} className="text-primary" />
            Log in
          </Link>

          <Link
            to="/register"
            className="hidden md:flex items-center gap-2 btn-primary"
          >
            <Zap size={14} />
            Get Started
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-card-hover transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-border flex flex-col gap-1 animate-[fadeScale_0.2s_ease-out]">
          {navLinks.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors
                ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-card-hover'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="flex gap-2 pt-2 border-t border-border mt-1">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold border border-border text-foreground hover:bg-card-hover transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
