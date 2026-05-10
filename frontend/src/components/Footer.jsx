import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Map, Mail, Phone, MapPin, Globe, ExternalLink, Info, Shield } from 'lucide-react';

const Footer = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();

  return (
    <footer className={`pt-16 pb-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-t border-slate-800' : 'bg-primary border-t border-primary-dark'} text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-white p-1.5 rounded-lg shadow-md">
                <Map className={`w-6 h-6 ${isDarkMode ? 'text-slate-900' : 'text-primary'}`} />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">
                Smart<span className={isDarkMode ? 'text-secondary' : 'text-secondary-light'}>Survey</span>
              </span>
            </Link>
            <p className={`${isDarkMode ? 'text-slate-400' : 'text-blue-100/70'} leading-relaxed font-medium`}>
              {i18n.language === 'gu' 
                ? 'જમીન માપણી અને વેરિફિકેશન માટેનું સત્તાવાર પ્લેટફોર્મ. ભવિષ્યના પ્લાનિંગ માટે સચોટતા અને પારદર્શિતા.' 
                : 'Official Digital Platform for Land Measurement, Surveying, and Verification. Ensuring precision and transparency for the future.'}
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<Globe className="w-5 h-5" />} href="https://www.gujarat.gov.in" title="Gujarat Gov" />
              <SocialIcon icon={<Mail className="w-5 h-5" />} href="mailto:info@smartsurvey.gujarat.gov.in" title="Email Us" />
              <SocialIcon icon={<Phone className="w-5 h-5" />} href="tel:+919313629723" title="Call Us" />
              {/* Added Icons for About and Privacy */}
              <SocialIcon icon={<Info className="w-5 h-5" />} href="/about" title={t('about_us')} isInternal />
              <SocialIcon icon={<Shield className="w-5 h-5" />} href="/privacy" title={t('privacy_policy')} isInternal />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-white/10 pb-2 inline-block">{i18n.language === 'gu' ? 'ઝડપી લિંક્સ' : 'Quick Links'}</h3>
            <ul className="space-y-4">
              <FooterLink to="/" label={t('home')} />
              <FooterLink to="/measure" label={t('measure_land')} />
              <FooterLink to="/dashboard" label={t('dashboard')} />
              <FooterLink to="/login" label={t('login')} />
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-white/10 pb-2 inline-block">{i18n.language === 'gu' ? 'રિસોર્સિસ' : 'Resources'}</h3>
            <ul className={`space-y-4 ${isDarkMode ? 'text-slate-400' : 'text-blue-100/70'}`}>
              <li className="flex items-center gap-2 hover:text-secondary-light cursor-pointer transition-colors font-medium">
                <ExternalLink className="w-4 h-4" /> {i18n.language === 'gu' ? 'વપરાશકર્તા માર્ગદર્શિકા' : 'User Manual (PDF)'}
              </li>
              <li className="flex items-center gap-2 hover:text-secondary-light cursor-pointer transition-colors font-medium">
                <ExternalLink className="w-4 h-4" /> {i18n.language === 'gu' ? 'સર્વેક્ષણ માર્ગદર્શિકા' : 'Surveying Guidelines'}
              </li>
              <li className="flex items-center gap-2 hover:text-secondary-light cursor-pointer transition-colors font-medium">
                <ExternalLink className="w-4 h-4" /> {i18n.language === 'gu' ? 'સરકારી નીતિઓ' : 'Government Policies'}
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-white/10 pb-2 inline-block">{i18n.language === 'gu' ? 'સંપર્ક કરો' : 'Contact Us'}</h3>
            <ul className="space-y-4">
              <li className={`flex items-start space-x-3 ${isDarkMode ? 'text-slate-400' : 'text-blue-100/70'}`}>
                <MapPin className="w-5 h-5 text-secondary-light shrink-0" />
                <span className="font-medium">{t('address')}</span>
              </li>
              <li className={`flex items-center space-x-3 ${isDarkMode ? 'text-slate-400' : 'text-blue-100/70'}`}>
                <Phone className="w-5 h-5 text-secondary-light shrink-0" />
                <span className="font-medium">+91 93136 29723</span>
              </li>
              <li className={`flex items-center space-x-3 ${isDarkMode ? 'text-slate-400' : 'text-blue-100/70'}`}>
                <Mail className="w-5 h-5 text-secondary-light shrink-0" />
                <span className="font-medium">info@smartsurvey.gujarat.gov.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-blue-100/50 font-bold">
          <p>© {new Date().getFullYear()} Smart Land Survey System. {i18n.language === 'gu' ? 'તમામ હકો સુરક્ષિત.' : 'All Rights Reserved.'}</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-white transition-colors">{i18n.language === 'gu' ? 'પ્રાઇવસી પોલિસી' : 'Privacy Policy'}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, label }) => (
  <li>
    <Link to={to} className="text-blue-100/70 hover:text-secondary-light transition-colors flex items-center group font-medium">
      <span className="w-0 group-hover:w-4 h-[1px] bg-secondary-light transition-all duration-300 mr-0 group-hover:mr-2"></span>
      {label}
    </Link>
  </li>
);

const SocialIcon = ({ icon, href, title, isInternal }) => {
  const commonClasses = "bg-white/5 hover:bg-secondary transition-all p-2.5 rounded-xl cursor-pointer border border-white/10 hover:border-transparent text-white shadow-lg flex items-center justify-center";
  
  if (isInternal) {
    return (
      <Link to={href} className={commonClasses} title={title}>
        {icon}
      </Link>
    );
  }

  return (
    <a 
      href={href} 
      target={href.startsWith('http') ? "_blank" : undefined}
      rel={href.startsWith('http') ? "noopener noreferrer" : undefined}
      className={commonClasses}
      title={title}
    >
      {icon}
    </a>
  );
};

export default Footer;
