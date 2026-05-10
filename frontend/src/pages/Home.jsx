import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Ruler, Shield, BarChart3, Smartphone, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Home = () => {
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
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] lg:h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40 z-10" />
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1]">
              Smart Land <span className="text-secondary-light">Survey</span> & Measurement
            </h1>
            <p className="text-lg sm:text-xl mb-10 text-gray-100 leading-relaxed max-w-2xl">
              Precision mapping for the modern world. Measure land area, track boundaries via GPS, 
              and manage survey records with government-grade accuracy and official verification.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-16 lg:mb-20">
              <Link 
                to="/measure" 
                className="bg-secondary hover:bg-secondary-dark text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Ruler className="w-5 h-5" /> Start Measuring
              </Link>
              <Link 
                to="/register" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-lg transition-all text-center w-full sm:w-auto"
              >
                Join as Surveyor
              </Link>
            </div>
          </motion.div>

          {/* Statistics Card inside the flex flow to prevent overlap */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 bg-white/10 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 shadow-2xl">
            {[
              { label: 'Area Measured', value: stats.areaMeasured },
              { label: 'Surveyors', value: stats.surveyors },
              { label: 'Approved', value: stats.approvalRate },
              { label: 'Precision', value: stats.precision },
            ].map((stat, i) => (
              <div key={i} className="text-center md:border-r border-white/20 last:border-0 py-2">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary-light">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-gray-300 uppercase tracking-widest mt-1 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4">Core Features</h2>
          <div className="w-24 h-1 bg-secondary mx-auto rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-4">
          <FeatureCard 
            icon={<MapPin className="text-primary w-8 h-8" />}
            title="Polygon Mapping"
            desc="Draw accurate boundaries on high-resolution satellite maps with real-time area calculation."
          />
          <FeatureCard 
            icon={<Smartphone className="text-primary w-8 h-8" />}
            title="GPS Walk-Through"
            desc="Switch to mobile mode and walk along the boundary to automatically capture coordinates via GPS."
          />
          <FeatureCard 
            icon={<BarChart3 className="text-primary w-8 h-8" />}
            title="Unit Conversion"
            desc="Seamlessly switch between Sq.Ft, Sq.Meter, Acres, and Hectares with instant conversion."
          />
          <FeatureCard 
            icon={<Shield className="text-primary w-8 h-8" />}
            title="Admin Verification"
            desc="Submit measurements for official approval. Track status from your secure dashboard."
          />
          <FeatureCard 
            icon={<FileText className="text-primary w-8 h-8" />}
            title="Export Reports"
            desc="Generate professional PDF reports with map images, coordinates, and area breakdowns."
          />
          <FeatureCard 
            icon={<Ruler className="text-primary w-8 h-8" />}
            title="Distance Calculator"
            desc="Calculate straight-line and road distances between points using advanced GIS formulas."
          />
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100 hover:shadow-2xl transition-all group">
    <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-primary mb-4">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

export default Home;
