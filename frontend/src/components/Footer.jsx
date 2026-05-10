import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Mail, Phone, MapPin, Globe, ExternalLink, Info, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-white p-1.5 rounded-lg">
                <Map className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                SmartLand <span className="text-secondary-light">Survey</span>
              </span>
            </Link>
            <p className="text-blue-100/70 leading-relaxed">
              Official Digital Platform for Land Measurement, Surveying, and Verification.
              Ensuring precision and transparency for the future of urban and rural planning.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<Globe className="w-5 h-5" />} href="https://www.gujarat.gov.in" />
              <SocialIcon icon={<Mail className="w-5 h-5" />} href="mailto:info@smartsurvey.gujarat.gov.in" />
              <SocialIcon icon={<Phone className="w-5 h-5" />} href="tel:+919313629723" />
              <SocialIcon icon={<Info className="w-5 h-5" />} href="/about" />
              <SocialIcon icon={<Shield className="w-5 h-5" />} href="/privacy" />
            </div>

          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-white/10 pb-2 inline-block">Quick Links</h3>
            <ul className="space-y-4">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/measure" label="Measure Land" />
              <FooterLink to="/dashboard" label="My Dashboard" />
              <FooterLink to="/login" label="Officer Login" />
              <FooterLink to="/register" label="Surveyor Registration" />
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-white/10 pb-2 inline-block">Resources</h3>
            <ul className="space-y-4 text-blue-100/70">
              <li className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                <ExternalLink className="w-4 h-4" /> User Manual (PDF)
              </li>
              <li className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                <ExternalLink className="w-4 h-4" /> Surveying Guidelines
              </li>
              <li className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                <ExternalLink className="w-4 h-4" /> Government Policies
              </li>
              <li className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                <ExternalLink className="w-4 h-4" /> Privacy Policy
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-white/10 pb-2 inline-block">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-blue-100/70">
                <MapPin className="w-5 h-5 text-secondary-light shrink-0" />
                <span>Ahmedabad, Gujarat 380058</span>
              </li>
              <li className="flex items-center space-x-3 text-blue-100/70">
                <Phone className="w-5 h-5 text-secondary-light shrink-0" />
                <span>+91 93136 29723</span>
              </li>
              <li className="flex items-center space-x-3 text-blue-100/70">
                <Mail className="w-5 h-5 text-secondary-light shrink-0" />
                <span>info@smartsurvey.gujarat.gov.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-blue-100/50 font-medium">
          <p>© {new Date().getFullYear()} Smart Land Measurement & Survey System. All Rights Reserved.</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-white cursor-pointer transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white cursor-pointer transition-colors">Terms of Service</Link>
            <Link to="/sitemap" className="hover:text-white cursor-pointer transition-colors">Sitemap</Link>
          </div>

        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, label }) => (
  <li>
    <Link to={to} className="text-blue-100/70 hover:text-secondary-light transition-colors flex items-center group">
      <span className="w-0 group-hover:w-4 h-[1px] bg-secondary-light transition-all duration-300 mr-0 group-hover:mr-2"></span>
      {label}
    </Link>
  </li>
);

const SocialIcon = ({ icon, href }) => {
  const isExternal = href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel');
  
  if (isExternal) {
    return (
      <a 
        href={href} 
        target={href.startsWith('http') ? "_blank" : undefined}
        rel={href.startsWith('http') ? "noopener noreferrer" : undefined}
        className="bg-white/5 hover:bg-secondary transition-all p-2 rounded-lg cursor-pointer border border-white/10 hover:border-transparent text-white"
      >
        {icon}
      </a>
    );
  }

  return (
    <Link 
      to={href} 
      className="bg-white/5 hover:bg-secondary transition-all p-2 rounded-lg cursor-pointer border border-white/10 hover:border-transparent text-white"
    >
      {icon}
    </Link>
  );
};


export default Footer;
