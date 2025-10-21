import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaComments, 
  FaCog, 
  FaUser,
  FaRegLightbulb,
  FaCrown,
  FaBell
} from 'react-icons/fa';

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationHandlers = {
    home: () => navigate('/home'),
    chat: () => navigate('/chat'),
    profile: () => navigate('/profile')
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { 
      key: 'home', 
      icon: FaHome, 
      label: 'Home',
      active: isActiveRoute('/home')
    },
    { 
      key: 'chat', 
      icon: FaComments, 
      label: 'Concierge',
      active: isActiveRoute('/chat')
    },
    { 
      key: 'profile', 
      icon: FaUser, 
      label: 'Profile',
      active: isActiveRoute('/profile')
    }
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-black/80 backdrop-blur-2xl border-b border-gold/20' 
          : 'bg-gradient-to-b from-black/95 to-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            
            {/* Luxury Brand Minimal */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-200 rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
                  <FaRegLightbulb className="text-black text-lg" />
                </div>
                {isAdmin && (
                  <FaCrown className="absolute -top-1 -right-1 text-yellow-400 text-xs" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-light text-white tracking-widest">SolveSmart</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notification */}
              <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10">
                <FaBell className="text-white/80 text-md" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Avatar */}
              <div 
                onClick={navigationHandlers.profile}
                className="w-9 h-9 rounded-xl overflow-hidden border border-gold/50 cursor-pointer hover:border-gold transition-all duration-300"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gold to-yellow-200 flex items-center justify-center">
                    <FaUser className="text-black text-sm" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gold/20 blur-xl rounded-3xl"></div>
          
          {/* Main Navigation Container */}
          <div className="relative bg-black/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gold/20 px-6 py-3">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <button 
                  key={item.key}
                  onClick={navigationHandlers[item.key]}
                  className="flex flex-col items-center group relative min-w-16"
                >
                  {/* Luxury Icon Container */}
                  <div className={`relative p-3 rounded-xl transition-all duration-500 group-hover:scale-110 ${
                    item.active 
                      ? 'bg-gradient-to-br from-gold to-yellow-200 shadow-lg shadow-gold/30' 
                      : 'bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-gold/30'
                  }`}>
                    <item.icon className={`text-lg transition-colors duration-300 ${
                      item.active ? 'text-black' : 'text-white/70 group-hover:text-gold'
                    }`} />
                    
                    {/* Active Glow */}
                    {item.active && (
                      <div className="absolute inset-0 bg-gold/20 rounded-xl animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={`text-xs font-light tracking-wider mt-1 transition-all duration-300 ${
                    item.active 
                      ? 'text-gold' 
                      : 'text-white/60 group-hover:text-gold'
                  }`}>
                    {item.label}
                  </span>

                  {/* Active Indicator */}
                  {item.active && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gold rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-16"></div>
      <div className="h-24"></div>

    </>
  );
};

export default Navbar;