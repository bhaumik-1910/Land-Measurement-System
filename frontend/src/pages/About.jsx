import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Shield, Zap, Award, Globe, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const About = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  
  const [stats, setStats] = useState({
    precision: 99.9,
    totalRecords: 0,
    areaMeasured: 0,
    surveyors: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/land/public-stats');
        setStats({
          precision: data.precision || 99.9,
          totalRecords: data.totalRecords || 1250,
          areaMeasured: data.areaMeasured,
          surveyors: data.surveyors
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      {/* Hero Section */}
      <section className={`relative py-32 overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-primary'}`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-secondary-light rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8 text-white"
          >
            <Shield className="w-4 h-4 text-secondary-light" />
            <span className="text-xs font-bold uppercase tracking-widest">{t('about_us')}</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-black text-white mb-8 leading-[1.1]"
          >
            {i18n.language === 'gu' ? 'જમીન માપણીમાં' : 'Revolutionizing Land'} <br />
            <span className="text-secondary-light">{i18n.language === 'gu' ? 'ડિજિટલ ક્રાંતિ' : 'Measurement & Surveying'}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            {i18n.language === 'gu' 
              ? 'અમે ગુજરાતમાં જમીન માપણી માટે સૌથી સચોટ, પારદર્શક અને ડિજિટલ પ્લેટફોર્મ પ્રદાન કરવા માટે સમર્પિત છીએ.'
              : 'We are dedicated to providing the most accurate, transparent, and accessible digital platform for land survey management in Gujarat.'}
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-black text-xs uppercase tracking-widest border border-primary/10">
              <Target className="w-4 h-4" />
              <span>{t('our_mission')}</span>
            </div>
            <h2 className={`text-4xl md:text-5xl font-black leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {i18n.language === 'gu' ? 'ભારતના જમીન રેકોર્ડ્સનું' : "Digitizing India's Land Records with"} <span className="text-primary">{i18n.language === 'gu' ? 'ડિજિટાઈઝેશન' : 'Precision'}</span>
            </h2>
            <p className={`text-lg leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {i18n.language === 'gu' 
                ? 'અમારું લક્ષ્ય અદ્યતન સેટેલાઇટ ટેકનોલોજી અને AI-આધારિત સર્વેક્ષણ સાધનોનો ઉપયોગ કરીને જમીન માપણીમાં થતી ભૂલો અને વિવાદોને દૂર કરવાનો છે.'
                : 'Our mission is to eliminate manual errors and disputes in land measurement by leveraging cutting-edge satellite technology and AI-driven surveying tools.'}
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className={`p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
                <div className="text-4xl font-black text-primary mb-1">{stats.precision}%</div>
                <div className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{t('accuracy')}</div>
              </div>
              <div className={`p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
                <div className="text-4xl font-black text-primary mb-1">{stats.totalRecords}+</div>
                <div className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{t('verified_records')}</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className={`aspect-square rounded-[3rem] flex items-center justify-center p-8 border-2 border-dashed transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-primary/5 border-primary/20'}`}>
              <div className="grid grid-cols-2 gap-6 md:gap-10">
                <FeatureCard icon={<Zap />} title="Real-time" isDarkMode={isDarkMode} />
                <FeatureCard icon={<Shield />} title="Secure" isDarkMode={isDarkMode} />
                <FeatureCard icon={<Globe />} title="Accessible" isDarkMode={isDarkMode} />
                <FeatureCard icon={<Award />} title="Certified" isDarkMode={isDarkMode} />
              </div>
            </div>
            <Sparkles className="absolute -top-6 -right-6 w-20 h-20 text-secondary opacity-50" />
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className={`py-32 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t('core_values')}</h2>
            <p className={`text-lg max-w-2xl mx-auto font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Everything we do is guided by a set of principles that ensure we deliver the 
              best possible experience for our users.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard 
              icon={<Shield className="w-8 h-8 text-white" />}
              title={i18n.language === 'gu' ? 'પારદર્શિતા' : 'Integrity First'}
              desc="We believe in absolute transparency and honesty in every land record we verify."
              color="bg-primary"
              isDarkMode={isDarkMode}
            />
            <ValueCard 
              icon={<Zap className="w-8 h-8 text-white" />}
              title={i18n.language === 'gu' ? 'નવીનતા' : 'Innovation'}
              desc="Constantly evolving our technology to provide faster and more accurate survey results."
              color="bg-secondary"
              isDarkMode={isDarkMode}
            />
            <ValueCard 
              icon={<Users className="w-8 h-8 text-white" />}
              title={i18n.language === 'gu' ? 'સમુદાય' : 'Community'}
              desc="Building a platform that serves the needs of every citizen and administrative body."
              color="bg-emerald-500"
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 text-center px-6">
        <h2 className={`text-3xl md:text-5xl font-black mb-10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {i18n.language === 'gu' ? 'તમારા પ્રથમ સર્વે માટે તૈયાર છો?' : 'Ready to start your first survey?'}
        </h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <Link 
            to="/measure" 
            className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-3xl font-black text-lg shadow-2xl shadow-primary/30 hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            {t('get_started')} <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            to="/about"
            className={`w-full sm:w-auto px-10 py-5 rounded-3xl font-black text-lg border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
          >
            {t('contact_support')}
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, isDarkMode }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`p-6 md:p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center space-y-4 transition-all duration-300 border ${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-black/20' : 'bg-white border-slate-100 shadow-slate-200/50'}`}
  >
    <div className="text-primary">
      {React.cloneElement(icon, { size: 40 })}
    </div>
    <span className={`font-black text-sm uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{title}</span>
  </motion.div>
);

const ValueCard = ({ icon, title, desc, color, isDarkMode }) => (
  <div className={`p-10 rounded-[3rem] border transition-all hover:shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-primary/50' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
    <div className={`${color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg transform -rotate-3`}>
      {icon}
    </div>
    <h3 className={`text-2xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
    <p className={`leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
  </div>
);

const Sparkles = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
  </svg>
);

export default About;
