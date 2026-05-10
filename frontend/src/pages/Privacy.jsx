import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Database, Bell, Mail, Phone } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const Privacy = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();

  return (
    <div className={`min-h-screen py-32 px-6 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="bg-primary/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-primary shadow-xl border border-primary/10">
            <Shield size={48} />
          </div>
          <h1 className={`text-4xl md:text-6xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t('privacy_policy')}</h1>
          <p className={`text-lg font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
            {i18n.language === 'gu' ? 'છેલ્લું અપડેટ: ૧૦ મે, ૨૦૨૬' : 'Last updated: May 10, 2026'}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`rounded-[3rem] p-10 md:p-20 shadow-2xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-black/20' : 'bg-white border-slate-100 shadow-slate-200/50'}`}
        >
          <section className="space-y-16">
            <PrivacySection 
              icon={<Lock className="text-indigo-500" />}
              title={i18n.language === 'gu' ? '૧. માહિતી જે અમે એકત્રિત કરીએ છીએ' : '1. Information We Collect'}
              content="We collect personal information that you provide to us such as name, address, contact information, and specific land details required for measurement. This includes GPS coordinates and property documentation uploaded by users."
              isDarkMode={isDarkMode}
            />

            <PrivacySection 
              icon={<Eye className="text-emerald-500" />}
              title={i18n.language === 'gu' ? '૨. અમે તમારી માહિતીનો ઉપયોગ કેવી રીતે કરીએ છીએ' : '2. How We Use Your Information'}
              content="Your data is used solely for the purpose of land measurement, verification, and administrative record-keeping. We use advanced algorithms to process spatial data to ensure the highest degree of accuracy in our survey results."
              isDarkMode={isDarkMode}
            />

            <PrivacySection 
              icon={<FileText className="text-amber-500" />}
              title={i18n.language === 'gu' ? '૩. માહિતી શેરિંગ' : '3. Information Sharing'}
              content="We do not sell your personal data. Information is shared only with authorized government bodies and officials involved in the land verification process as required by the law of Gujarat."
              isDarkMode={isDarkMode}
            />

            <PrivacySection 
              icon={<Database className="text-rose-500" />}
              title={i18n.language === 'gu' ? '૪. ડેટા સુરક્ષા' : '4. Data Security'}
              content="We implement robust security measures to protect your data. All sensitive information is encrypted both at rest and in transit using industry-standard protocols."
              isDarkMode={isDarkMode}
            />
          </section>

          <div className={`mt-24 p-10 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <h3 className={`text-2xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{i18n.language === 'gu' ? 'અમારી પ્રાઇવસી ટીમનો સંપર્ક કરો' : 'Contact Our Privacy Team'}</h3>
            <p className={`text-lg mb-8 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              If you have any questions or concerns about our Privacy Policy or data processing practices, 
              please reach out to us.
            </p>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <a href="mailto:privacy@smartsurvey.gujarat.gov.in" className="flex items-center gap-3 text-primary font-black text-lg hover:underline group">
                <div className="bg-primary/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
                  <Mail size={20} />
                </div>
                privacy@smartsurvey.gujarat.gov.in
              </a>
              <div className="hidden md:block w-px h-8 bg-slate-300 dark:bg-slate-700"></div>
              <div className="flex items-center gap-3 font-black text-lg text-slate-600 dark:text-slate-400">
                <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-xl">
                  <Phone size={20} />
                </div>
                +91 93136 29723
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const PrivacySection = ({ icon, title, content, isDarkMode }) => (
  <div className="flex flex-col md:flex-row gap-8 items-start">
    <div className={`p-5 rounded-2xl shrink-0 transition-colors ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
      {React.cloneElement(icon, { size: 32 })}
    </div>
    <div className="space-y-4">
      <h2 className={`text-2xl md:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      <p className={`leading-relaxed text-lg font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        {content}
      </p>
    </div>
  </div>
);

export default Privacy;
