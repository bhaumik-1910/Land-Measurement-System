import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Map, LayoutDashboard, User as UserIcon, LogOut, Menu, X, ShieldCheck, Ruler, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4" />, auth: true },
    { name: 'My Records', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, auth: true },
    { name: 'Measure Land', path: '/measure', icon: <Ruler className="w-4 h-4" />, auth: true },
  ];


  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-primary text-white shadow-lg border-b border-primary-dark sticky top-0 z-[2000]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
              <div className="bg-white p-1.5 rounded-lg shadow-inner">
                <Map className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-black tracking-tighter">
                SMART<span className="text-secondary-light">SURVEY</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              (!link.auth || (link.auth && user)) && (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 hover:text-secondary-light transition-all font-bold text-sm tracking-wide ${location.pathname === link.path ? 'text-secondary-light' : 'text-blue-100/80'}`}
                >
                  {link.name}
                </Link>
              )
            ))}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1 font-black text-sm hover:text-yellow-400 transition-all ${location.pathname === '/admin' ? 'text-yellow-400' : 'text-accent'}`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ADMIN PANEL</span>
              </Link>
            )}
          </div>

          {/* Action Buttons / User Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="hidden sm:flex items-center space-x-2 bg-primary-dark px-4 py-1.5 rounded-full border border-blue-800 shadow-inner">
                  <UserIcon className="w-4 h-4 text-secondary-light" />
                  <span className="text-xs font-bold uppercase tracking-wider">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 p-2.5 rounded-xl transition-all shadow-lg hover:rotate-12 active:scale-95"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary-dark transition-all text-blue-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-secondary hover:bg-secondary-dark px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-secondary/20 transition-all hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-primary-dark border border-blue-800 text-white transition-all active:scale-95"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[3000] lg:hidden"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" onClick={closeMenu} />

            {/* Sidebar content */}
            <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-primary shadow-2xl border-l border-white/10 p-6 pt-20 flex flex-col">
              <div className="flex flex-col space-y-4">
                {user && (
                  <div className="bg-primary-dark/50 p-4 rounded-2xl border border-white/5 mb-4 flex items-center gap-3">
                    <div className="bg-secondary p-2 rounded-lg">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Signed in as</div>
                      <div className="text-sm font-black text-white">{user.name}</div>
                    </div>
                  </div>
                )}

                {navLinks.map((link) => (
                  (!link.auth || (link.auth && user)) && (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={closeMenu}
                      className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-base transition-all ${location.pathname === link.path ? 'bg-secondary text-white shadow-xl' : 'text-blue-100/60 hover:bg-white/5 hover:text-white'}`}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  )
                ))}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-base transition-all ${location.pathname === '/admin' ? 'bg-accent text-primary shadow-xl' : 'text-accent hover:bg-accent/10'}`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    ADMIN PANEL
                  </Link>
                )}

                {!user && (
                  <div className="pt-8 flex flex-col gap-3">
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="w-full text-center py-4 rounded-2xl font-black text-blue-100 hover:bg-white/5 transition-all"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="w-full text-center py-4 rounded-2xl font-black bg-secondary text-white shadow-xl shadow-secondary/20"
                    >
                      Sign Up Free
                    </Link>
                  </div>
                )}

                {user && (
                  <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-red-400 hover:bg-red-400/10 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                )}
              </div>

              <div className="mt-auto pt-10 text-center">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Smart Survey System v2.0</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

