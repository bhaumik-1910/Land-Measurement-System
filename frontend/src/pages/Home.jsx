import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Ruler, Shield, BarChart3, Smartphone, FileText, Sparkles, Languages, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState({
    areaMeasured: '0',
    surveyors: '0',
    approvalRate: '0',
    precision: '99.9'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/land/public-stats`);
        setStats({
          areaMeasured: res.data.areaMeasured > 1000 ? `${(res.data.areaMeasured / 1000).toFixed(1)}k+` : res.data.areaMeasured,
          surveyors: res.data.surveyors,
          approvalRate: `${res.data.approvalRate}%`,
          precision: `${res.data.precision}%`
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className={`transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] lg:h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 z-10 ${isDarkMode ? 'bg-gradient-to-r from-slate-950 via-slate-950/80 to-primary/40' : 'bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40'}`} />
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover"
            alt="Agriculture Land"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-20 text-white min-h-[70vh] flex flex-col py-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-secondary-light" />
              <span className="text-xs font-bold uppercase tracking-widest">{i18n.language === 'gu' ? 'ગુજરાતનું પ્રથમ સ્માર્ટ સર્વે પ્લેટફોર્મ' : 'Gujarat\'s #1 Smart Survey Platform'}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1]">
              {i18n.language === 'gu' ? 'સ્માર્ટ જમીન' : 'Smart Land'} <span className="text-secondary-light">{i18n.language === 'gu' ? 'માપણી' : 'Survey'}</span> {i18n.language === 'gu' ? 'સિસ્ટમ' : '& Measurement'}
            </h1>
            <p className="text-lg sm:text-xl mb-10 text-gray-100 leading-relaxed max-w-2xl font-medium">
              {i18n.language === 'gu' 
                ? 'ચોકસાઈપૂર્વક જમીન માપો, GPS દ્વારા સીમાઓ નક્કી કરો અને સરકારી ધોરણો મુજબ વેરિફાઈડ રિપોર્ટ્સ મેળવો.' 
                : 'Precision mapping for the modern world. Measure land area, track boundaries via GPS, and manage survey records with government-grade accuracy and official verification.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-16 lg:mb-20">
              <Link 
                to="/measure" 
                className="bg-secondary hover:bg-secondary-dark text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Ruler className="w-5 h-5" /> {i18n.language === 'gu' ? 'માપણી શરૂ કરો' : 'Start Measuring'}
              </Link>
              <Link 
                to="/register" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-lg transition-all text-center w-full sm:w-auto"
              >
                {i18n.language === 'gu' ? 'સર્વેયર તરીકે જોડાવો' : 'Join as Surveyor'}
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 bg-white/10 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-2xl">
            {[
              { label: i18n.language === 'gu' ? 'કુલ વિસ્તાર' : 'Area Measured', value: stats.areaMeasured },
              { label: i18n.language === 'gu' ? 'સર્વેયર' : 'Surveyors', value: stats.surveyors },
              { label: i18n.language === 'gu' ? 'મંજૂર' : 'Approved', value: stats.approvalRate },
              { label: i18n.language === 'gu' ? 'ચોકસાઈ' : 'Precision', value: stats.precision },
            ].map((stat, i) => (
              <div key={i} className="text-center md:border-r border-white/20 last:border-0 py-2">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary-light">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-gray-300 uppercase tracking-widest mt-1 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Features Section */}
      <section className={`py-20 ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <div className="text-secondary font-black uppercase tracking-[0.3em] text-xs mb-4">Unique & Powerful</div>
          <h2 className={`text-4xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-primary'}`}>
            {i18n.language === 'gu' ? 'અમારા ખાસ ફીચર્સ' : 'What Makes Us Unique'}
          </h2>
          <div className="w-24 h-1 bg-secondary mx-auto rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Sparkles className="text-secondary w-8 h-8" />}
            title={i18n.language === 'gu' ? 'AI પાક સૂચન' : 'AI Crop Advisor'}
            desc={i18n.language === 'gu' ? 'તમારી જમીન અને લોકેશન મુજબ કયો પાક લેવો જોઈએ તેની AI સલાહ મેળવો.' : 'Get intelligent suggestions on which crops are best suited for your land based on soil data and location.'}
            isDarkMode={isDarkMode}
          />
          <FeatureCard 
            icon={<Languages className="text-secondary w-8 h-8" />}
            title={i18n.language === 'gu' ? 'ગુજરાતી ભાષા સપોર્ટ' : 'Gujarati Support'}
            desc={i18n.language === 'gu' ? 'ખેડૂતો માટે ખાસ ગુજરાતી ભાષામાં આખું પ્લેટફોર્મ ઉપલબ્ધ છે.' : 'Designed for Gujarat\'s farmers with full support for Gujarati language for easy navigation.'}
            isDarkMode={isDarkMode}
          />
          <FeatureCard 
            icon={<QrCode className="text-secondary w-8 h-8" />}
            title={i18n.language === 'gu' ? 'વેરિફાઈડ QR કોડ' : 'Smart Verification'}
            desc={i18n.language === 'gu' ? 'દરેક રિપોર્ટમાં QR કોડ હશે, જે સ્કેન કરવાથી ઓનલાઈન રેકોર્ડ વેરિફાઈ થઈ શકશે.' : 'Every report includes a secure QR code that can be scanned to verify authenticity online.'}
            isDarkMode={isDarkMode}
          />
        </div>
      </section>

      {/* Standard Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<MapPin className="text-primary w-8 h-8" />}
            title={t('feat_polygon')}
            desc={t('feat_polygon_desc')}
            isDarkMode={isDarkMode}
          />
          <FeatureCard 
            icon={<Smartphone className="text-primary w-8 h-8" />}
            title={t('feat_gps')}
            desc={t('feat_gps_desc')}
            isDarkMode={isDarkMode}
          />
          <FeatureCard 
            icon={<BarChart3 className="text-primary w-8 h-8" />}
            title={t('feat_unit')}
            desc={t('feat_unit_desc')}
            isDarkMode={isDarkMode}
          />
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, isDarkMode }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className={`p-10 rounded-[2.5rem] shadow-lg border transition-all group ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-primary/50' : 'bg-white border-slate-100 hover:shadow-2xl'}`}
  >
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isDarkMode ? 'bg-slate-800 group-hover:bg-primary/20' : 'bg-slate-50 group-hover:bg-primary/10'}`}>
      {icon}
    </div>
    <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-primary'}`}>{title}</h3>
    <p className={`leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{desc}</p>
  </motion.div>
);

export default Home;
