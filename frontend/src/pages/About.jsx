import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Shield, Zap, Award, Globe } from 'lucide-react';
import api from '../api/axios';

const About = () => {
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
          totalRecords: data.totalRecords || 1250, // Fallback for testing
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-secondary-light rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6"
          >
            Revolutionizing Land <br />
            <span className="text-secondary-light underline decoration-secondary-light/30">Measurement & Surveying</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed"
          >
            We are dedicated to providing the most accurate, transparent, and accessible 
            digital platform for land survey management in Gujarat.
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/5 px-4 py-2 rounded-full text-primary font-bold text-sm">
              <Target className="w-4 h-4" />
              <span>Our Mission</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Digitizing India's Land Records with <span className="text-primary">Precision</span>
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Our mission is to eliminate manual errors and disputes in land measurement by leveraging 
              cutting-edge satellite technology and AI-driven surveying tools. We aim to empower 
              every landowner and government official with real-time, verified data.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-3xl font-bold text-primary mb-1">{stats.precision}%</div>
                <div className="text-sm text-slate-500 font-medium">Measurement Accuracy</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-3xl font-bold text-primary mb-1">{stats.totalRecords}+</div>
                <div className="text-sm text-slate-500 font-medium">Verified Records</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square bg-primary/5 rounded-[40px] flex items-center justify-center p-8 border-2 border-dashed border-primary/20">
              <div className="grid grid-cols-2 gap-8">
                <FeatureCard icon={<Zap />} title="Real-time" />
                <FeatureCard icon={<Shield />} title="Secure" />
                <FeatureCard icon={<Globe />} title="Accessible" />
                <FeatureCard icon={<Award />} title="Certified" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Everything we do is guided by a set of principles that ensure we deliver the 
              best possible experience for our users.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard 
              icon={<Shield className="w-8 h-8 text-white" />}
              title="Integrity First"
              desc="We believe in absolute transparency and honesty in every land record we verify."
              color="bg-primary"
            />
            <ValueCard 
              icon={<Zap className="w-8 h-8 text-white" />}
              title="Innovation"
              desc="Constantly evolving our technology to provide faster and more accurate survey results."
              color="bg-secondary"
            />
            <ValueCard 
              icon={<Users className="w-8 h-8 text-white" />}
              title="Community"
              desc="Building a platform that serves the needs of every citizen and administrative body."
              color="bg-emerald-500"
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to start your first survey?</h2>
        <div className="flex justify-center space-x-4">
          <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
            Get Started
          </button>
          <button className="bg-slate-100 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors">
            Contact Support
          </button>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title }) => (
  <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center space-y-3 hover:-translate-y-2 transition-transform duration-300">
    <div className="text-primary w-12 h-12">
      {React.cloneElement(icon, { size: 48 })}
    </div>
    <span className="font-bold text-slate-800">{title}</span>
  </div>
);

const ValueCard = ({ icon, title, desc, color }) => (
  <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-shadow">
    <div className={`${color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

export default About;
