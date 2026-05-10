import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import { FileText, Download, Map as MapIcon, Calendar, Ruler, User, Clock, CheckCircle, XCircle, ArrowLeft, Save, Eye, Sparkles } from 'lucide-react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { motion } from 'framer-motion';
import { suggestCrops } from '../utils/cropAI';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';

const LandDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  
  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayUnit, setDisplayUnit] = useState(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [mapType, setMapType] = useState('satellite');

  useEffect(() => {
    const fetchLand = async () => {
      try {
        const { data } = await api.get(`/land/${id}`);
        setLand(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLand();
  }, [id]);

  useEffect(() => {
    if (land) {
      const initialUnit = land.area.unit || 'sq.meter';
      const initialVal = convertValue(land.area.value, 'sq.meter', initialUnit);
      setDisplayUnit(initialUnit);
      setDisplayValue(initialVal);
    }
  }, [land]);

  const convertValue = (val, fromUnit, toUnit) => {
    const toSqMeter = {
      'sq.meter': 1,
      'sq.ft': 0.092903,
      'acre': 4046.86,
      'hectare': 10000,
      'vigha': 1618.74,
      'guntha': 101.17,
    };
    const fromSqMeter = {
      'sq.meter': 1,
      'sq.ft': 10.7639,
      'acre': 0.000247105,
      'hectare': 0.0001,
      'vigha': 0.00061776,
      'guntha': 0.009884,
    };
    const sqM = val * toSqMeter[fromUnit];
    return (sqM * fromSqMeter[toUnit]).toFixed(2);
  };

  const handleUnitChange = (newUnit) => {
    const newVal = convertValue(land.area.value, 'sq.meter', newUnit);
    setDisplayValue(newVal);
    setDisplayUnit(newUnit);
  };

  const exportPDF = async () => {
    window.scrollTo(0, 0);
    const element = document.getElementById("report-content");
    if (!element) return;

    const loadingToast = i18n.language === 'gu' ? 'PDF ડાઉનલોડ થઈ રહી છે...' : 'Downloading PDF Report...';
    
    try {
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: isDarkMode ? '#020617' : '#ffffff',
        width: 1200,
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("report-content");
          if (clonedElement) {
            clonedElement.style.width = "1200px";
            clonedElement.style.borderRadius = "0px";
            clonedElement.style.boxShadow = "none";
            clonedElement.style.border = "none";
          }
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      const imgWidth = pdfWidth - 20; // 10mm margins
      const imgHeight = (canvasHeight * imgWidth) / canvasWidth;
      
      let heightLeft = imgHeight;
      let position = 10; // Start with 10mm top margin

      // First Page
      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20); // Account for margins

      // Subsequent Pages if content is long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10; // 10mm top margin for new pages
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }

      pdf.save(`${land.title}_Report.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
    }
  };

  const tileLayers = {
    normal: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    satellite: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold animate-pulse">Loading Report...</p>
      </div>
    </div>
  );

  if (!land) return <div className="text-center py-20 font-bold text-red-500">Land record not found</div>;

  const center = land.coordinates[0] ? [land.coordinates[0].lat, land.coordinates[0].lng] : [20.5937, 78.9629];
  const verificationURL = `${window.location.origin}/land/${land._id}`;

  return (
    <div className={`min-h-screen pt-20 pb-12 px-4 sm:px-6 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto">
        <div className={`flex flex-col sm:flex-row justify-between items-center mb-6 lg:mb-8 gap-4 p-3 sm:p-4 rounded-3xl shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center justify-center gap-2 font-bold transition-all px-4 py-2.5 rounded-xl border ${isDarkMode ? 'text-slate-300 border-slate-700 hover:bg-slate-800' : 'text-gray-500 border-slate-100 hover:bg-slate-50'} flex-grow sm:flex-grow-0`}
            >
              <ArrowLeft className="w-5 h-5" /> {t('back')}
            </button>
            <div className={`p-1 rounded-xl flex gap-1 flex-grow sm:flex-grow-0 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <button
                onClick={() => setMapType('normal')}
                className={`flex-1 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${mapType === 'normal' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-slate-700'}`}
              >
                Normal
              </button>
              <button
                onClick={() => setMapType('satellite')}
                className={`flex-1 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${mapType === 'satellite' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-slate-700'}`}
              >
                Satellite
              </button>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 font-bold transition-colors px-4 py-2.5 rounded-xl border ${isDarkMode ? 'text-slate-300 border-slate-700 hover:bg-slate-800' : 'text-gray-600 border-slate-100 hover:bg-slate-50'}`}
            >
              {t('dashboard')}
            </button>
            <button
              onClick={exportPDF}
              className="flex-1 sm:flex-none bg-primary hover:bg-primary-dark text-white px-6 sm:px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" /> <span className="hidden sm:inline">{t('export_pdf')}</span><span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>

        <div id="report-content" className={`rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`p-6 sm:p-10 border-b flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl">
                <MapIcon className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-primary tracking-tighter uppercase">SMART SURVEY SYSTEM</h2>
                <p className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Digital Land Records & Analytics</p>
              </div>
            </div>
            <div className="sm:text-right">
              <div className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t('report_id')}</div>
              <div className="text-xs font-mono font-bold text-primary">SLS-{land._id.substring(18).toUpperCase()}</div>
            </div>
          </div>

          <div className="bg-primary p-6 sm:p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <Sparkles className="absolute -right-10 -top-10 w-64 h-64 text-white/5 rotate-12" />
            <div className="relative z-10">
              <div className="text-secondary-light font-bold uppercase tracking-widest text-[10px] sm:text-sm mb-2">{t('official_report')}</div>
              <h1 className="text-2xl sm:text-4xl font-extrabold">{land.title}</h1>
              <div className="flex items-center gap-2 text-blue-200 mt-4 opacity-80">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-medium">{t('measured_on')} {new Date(land.createdAt).toLocaleDateString(i18n.language === 'gu' ? 'gu-IN' : 'en-US')}</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-5 sm:px-6 py-3 sm:py-4 rounded-2xl border border-white/20 text-center w-full md:w-auto relative z-10">
              <div className="text-[10px] uppercase font-bold text-blue-200 mb-1">{t('status')}</div>
              <div className={`font-bold text-sm sm:text-base flex items-center justify-center gap-2 ${land.status === 'approved' ? 'text-green-400' : land.status === 'rejected' ? 'text-red-400' : 'text-amber-400'}`}>
                {land.status === 'approved' ? <CheckCircle className="w-5 h-5" /> : land.status === 'rejected' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                {land.status.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="grid md:grid-cols-2 gap-10 lg:gap-12 mb-12">
              <div className="space-y-8">
                <div>
                  <h3 className={`text-base sm:text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <FileText className="w-5 h-5" /> {t('property_specs')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Ruler className="text-secondary w-4 h-4" />
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t('area')}</span>
                        </div>
                        <select
                          value={displayUnit || ''}
                          onChange={(e) => handleUnitChange(e.target.value)}
                          className={`text-[9px] sm:text-[10px] border-none rounded px-1.5 py-0.5 font-bold text-primary focus:ring-0 outline-none cursor-pointer ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}
                        >
                          <option value="sq.meter">Sq. Meter</option>
                          <option value="sq.ft">Sq. Ft</option>
                          <option value="acre">Acre</option>
                          <option value="hectare">Hectare</option>
                          <option value="vigha">Vigha</option>
                          <option value="guntha">Guntha</option>
                        </select>
                      </div>
                      <div className="text-base sm:text-lg font-extrabold text-primary">
                        {displayValue} <span className="text-[10px] sm:text-xs font-normal text-gray-500 uppercase">{displayUnit}</span>
                      </div>
                    </div>
                    <DetailBox icon={<MapIcon className="text-secondary w-4 h-4" />} label={t('points')} value={`${land.coordinates.length} Markers`} isDarkMode={isDarkMode} />
                    <DetailBox icon={<User className="text-secondary w-4 h-4" />} label={t('surveyor')} value={land.user?.name || 'Authorized User'} isDarkMode={isDarkMode} />
                    <DetailBox icon={<Clock className="text-secondary w-4 h-4" />} label={t('method')} value={land.surveyMode === 'gps' ? 'GPS Capture' : 'Manual Map'} isDarkMode={isDarkMode} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="w-full">
                    <h3 className={`text-base sm:text-lg font-bold text-primary mb-2`}>{t('description')}</h3>
                    <p className={`text-sm sm:text-base leading-relaxed p-4 sm:p-6 rounded-2xl italic border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-gray-600'}`}>
                      "{land.description || 'No additional notes provided for this survey.'}"
                    </p>
                  </div>
                  
                  {/* QR Code Section */}
                  <div className={`p-4 rounded-3xl border flex flex-col items-center justify-center text-center ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>
                    <div className="bg-white p-2 rounded-xl mb-3">
                      <QRCodeSVG value={verificationURL} size={100} level="H" includeMargin={true} />
                    </div>
                    <div className="text-[10px] font-black text-primary uppercase tracking-wider">{t('verify_qr')}</div>
                    <div className={`text-[8px] mt-1 font-mono ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>SLS-{land._id.toUpperCase()}</div>
                  </div>
                </div>
              </div>

              <div className={`rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-4 sm:border-8 shadow-inner h-[300px] sm:h-[400px] relative ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
                <MapContainer key={mapType} center={center} zoom={18} className="h-full w-full" preferCanvas={true}>
                  <TileLayer url={tileLayers[mapType]} crossOrigin="anonymous" />
                  <Polygon positions={land.coordinates.map(c => [c.lat, c.lng])} pathOptions={{ color: '#1e3a8a', fillColor: '#3b82f6', fillOpacity: 0.4, weight: 3 }} />
                </MapContainer>
              </div>
            </div>

            {/* AI Crop Section - Enhanced */}
            <div className={`mt-12 p-8 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-primary/10 border-slate-700' : 'bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20 shadow-inner'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-primary flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-secondary" />
                    {t('ai_insights')}
                  </h3>
                  <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('ai_crop_desc')}</p>
                </div>
                <div className="bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-secondary/20">
                  AI Live Analysis
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {suggestCrops(land.area.value).map((crop, i) => (
                  <motion.div 
                    key={i} 
                    className={`p-6 rounded-3xl shadow-sm border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-secondary' : 'bg-white border-slate-100 hover:border-secondary'}`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-lg font-black text-primary">{i18n.language === 'gu' ? getGujaratiCropName(crop.name) : crop.name}</div>
                      <div className="bg-secondary/10 text-secondary p-1.5 rounded-lg">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                          <span className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}>{t('suitability')}</span>
                          <span className="text-secondary">{crop.suitability}%</span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${crop.suitability}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="bg-secondary h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                          />
                        </div>
                      </div>
                      <p className={`text-[11px] leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        {i18n.language === 'gu' ? getGujaratiReason(crop.name) : crop.reason}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-base sm:text-lg font-bold text-primary mb-4">{t('boundary_gps')}</h3>
              <div className={`rounded-2xl overflow-hidden border overflow-x-auto custom-scrollbar ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <table className="w-full text-left min-w-[500px]">
                  <thead className={`text-[10px] sm:text-xs font-bold uppercase ${isDarkMode ? 'bg-slate-900 text-slate-500' : 'bg-slate-100 text-slate-500'}`}>
                    <tr>
                      <th className="p-3 sm:p-4">{t('marker')}</th>
                      <th className="p-3 sm:p-4">{t('latitude')}</th>
                      <th className="p-3 sm:p-4">{t('longitude')}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-200'}`}>
                    {land.coordinates.map((coord, i) => (
                      <tr key={i} className={`text-xs sm:text-sm font-mono ${isDarkMode ? 'text-slate-400 hover:bg-slate-800/50' : 'text-slate-700 hover:bg-white'}`}>
                        <td className="p-3 sm:p-4 font-bold text-primary">#{i + 1}</td>
                        <td className="p-3 sm:p-4">{coord.lat.toFixed(6)}</td>
                        <td className="p-3 sm:p-4">{coord.lng.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className={`border-t p-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div>
              <div className="text-xs font-bold text-primary mb-1">SMART LAND SURVEY SYSTEM OFFICE</div>
              <p className={`text-[10px] max-w-xs leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{t('address')}</p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{t('contact_details')}</div>
              <div className="text-xs font-bold text-primary">+91 93136 29723</div>
              <div className="text-xs text-secondary font-medium">info@smartsurvey.gujarat.gov.in</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailBox = ({ icon, label, value, isDarkMode }) => (
  <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{label}</span>
    </div>
    <div className={`text-lg font-extrabold text-primary`}>{value}</div>
  </div>
);

// Helper functions for translation of dynamic content
const getGujaratiCropName = (name) => {
  const mapping = {
    'Wheat': 'ઘઉં',
    'Cotton': 'કપાસ',
    'Sugarcane': 'શેરડી',
    'Maize': 'મકાઈ'
  };
  return mapping[name] || name;
};

const getGujaratiReason = (name) => {
  const mapping = {
    'Wheat': 'આ વિસ્તારમાં જમીનનો ભેજ ઉત્તમ છે.',
    'Cotton': 'તાપમાન કપાસના પાક માટે અનુકૂળ છે.',
    'Sugarcane': 'પુષ્કળ પાણીની જરૂરિયાત પૂરી થઈ શકે તેમ છે.',
    'Maize': 'જમીનમાં પાણીનો નિકાલ સારો છે.'
  };
  return mapping[name] || name;
};

export default LandDetails;
