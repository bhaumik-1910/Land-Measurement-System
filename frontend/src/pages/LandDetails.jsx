import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import { FileText, Download, Map as MapIcon, Calendar, Ruler, User, Clock, CheckCircle, XCircle, ArrowLeft, Save, Eye } from 'lucide-react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { motion } from 'framer-motion';
import { suggestCrops } from '../utils/cropAI';

const LandDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const downloadFile = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  const exportPDF = async () => {
    // Force scroll to top and ensure all elements are visible
    window.scrollTo(0, 0);

    const element = document.getElementById("report-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1280, // Force desktop width for capture
        windowWidth: 1280, // Ensure layout engine sees desktop width
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("report-content");
          if (clonedElement) {
            // Force desktop-like styles for the PDF capture
            clonedElement.style.width = "1280px";
            clonedElement.style.borderRadius = "0px";
            clonedElement.style.border = "none";
            clonedElement.style.padding = "40px";
            
            // Fix any mobile-specific layout changes
            const gridContainers = clonedElement.querySelectorAll('.grid');
            gridContainers.forEach(grid => {
              // Force 2 columns for specs if it was stacked on mobile
              if (grid.classList.contains('sm:grid-cols-2')) {
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
                grid.style.gap = '24px';
              }
              // Force 3 columns for documents
              if (grid.classList.contains('lg:grid-cols-3')) {
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
                grid.style.gap = '24px';
              }
            });

            // Ensure text isn't truncated
            const truncates = clonedElement.querySelectorAll('.truncate');
            truncates.forEach(el => {
              el.classList.remove('truncate');
              el.style.whiteSpace = 'normal';
              el.style.overflow = 'visible';
              el.style.wordBreak = 'break-all';
              el.style.lineHeight = '1.4';
            });

            // Make table visible without scroll
            const tableContainer = clonedElement.querySelector('.overflow-x-auto');
            if (tableContainer) {
              tableContainer.style.overflow = 'visible';
              tableContainer.classList.remove('overflow-x-auto');
            }
          }
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      // If content is longer than A4, we might need multiple pages or scale down
      // For now, let's fit it within margins
      pdf.addImage(imgData, "JPEG", 10, 10, imgWidth, imgHeight);
      pdf.save(`${land.title}_Official_Report.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
    }
  };

  const tileLayers = {
    normal: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    satellite: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold animate-pulse">Loading Report...</p>
      </div>
    </div>
  );

  if (!land) return <div className="text-center py-20 font-bold text-red-500">Land record not found</div>;

  const center = land.coordinates[0] ? [land.coordinates[0].lat, land.coordinates[0].lng] : [20.5937, 78.9629];

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 lg:mb-8 gap-4 bg-white p-3 sm:p-4 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 text-gray-500 hover:text-primary font-bold transition-all px-4 py-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 sm:border-none flex-grow sm:flex-grow-0"
            >
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 flex-grow sm:flex-grow-0">
              <button
                onClick={() => setMapType('normal')}
                className={`flex-1 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${mapType === 'normal' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-white'}`}
              >
                Normal
              </button>
              <button
                onClick={() => setMapType('satellite')}
                className={`flex-1 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${mapType === 'satellite' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-white'}`}
              >
                Satellite
              </button>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-gray-600 hover:text-primary font-bold transition-colors px-4 py-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 sm:border-none"
            >
              Dashboard
            </button>
            <button
              onClick={exportPDF}
              className="flex-1 sm:flex-none bg-primary hover:bg-primary-dark text-white px-6 sm:px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" /> <span className="hidden sm:inline">Export PDF</span><span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>

        <div id="report-content" className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-white p-6 sm:p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl">
                <MapIcon className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-primary tracking-tighter uppercase">SMART SURVEY SYSTEM</h2>
                <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Digital Land Records & Analytics</p>
              </div>
            </div>
            <div className="sm:text-right">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Report ID</div>
              <div className="text-xs font-mono font-bold text-primary">SLS-{land._id.substring(18).toUpperCase()}</div>
            </div>
          </div>

          <div className="bg-primary p-6 sm:p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="text-secondary-light font-bold uppercase tracking-widest text-[10px] sm:text-sm mb-2">Official Survey Report</div>
              <h1 className="text-2xl sm:text-4xl font-extrabold">{land.title}</h1>
              <div className="flex items-center gap-2 text-blue-200 mt-4 opacity-80">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-medium">Measured on {new Date(land.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-5 sm:px-6 py-3 sm:py-4 rounded-2xl border border-white/20 text-center w-full md:w-auto">
              <div className="text-[10px] uppercase font-bold text-blue-200 mb-1">Status</div>
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
                  <h3 className="text-base sm:text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <FileText className="w-5 h-5" /> Property Specifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Ruler className="text-secondary w-4 h-4" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Area</span>
                        </div>
                        <select
                          value={displayUnit || ''}
                          onChange={(e) => handleUnitChange(e.target.value)}
                          className="text-[9px] sm:text-[10px] bg-slate-100 border-none rounded px-1.5 py-0.5 font-bold text-primary focus:ring-0 outline-none cursor-pointer"
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
                    <DetailBox icon={<MapIcon className="text-secondary w-4 h-4" />} label="Points" value={`${land.coordinates.length} Markers`} />
                    <DetailBox icon={<User className="text-secondary w-4 h-4" />} label="Surveyor" value={land.user?.name || 'Authorized User'} />
                    <DetailBox icon={<Clock className="text-secondary w-4 h-4" />} label="Method" value={land.surveyMode === 'gps' ? 'GPS Capture' : 'Manual Map'} />
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-primary mb-2">Description</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed bg-slate-50 p-4 sm:p-6 rounded-2xl italic border border-slate-100">
                    "{land.description || 'No additional notes provided for this survey.'}"
                  </p>
                </div>

                {land.documents && land.documents.length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <FileText className="w-5 h-5" /> Related Documents
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                      {land.documents.map((doc, i) => {
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.url);
                        const fileUrl = `${import.meta.env.VITE_API_URL}${doc.url}`;
                        return (
                          <div key={i} className="group relative bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:border-primary transition-all duration-300">
                            {isImage ? (
                              <div className="h-40 w-full bg-slate-100 overflow-hidden">
                                <img src={fileUrl} alt={doc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                  <button onClick={() => downloadFile(fileUrl, doc.name)} className="bg-white p-3 rounded-full text-primary hover:bg-primary hover:text-white transition-all transform hover:scale-110" title="Download">
                                    <Save className="w-5 h-5" />
                                  </button>
                                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full text-secondary hover:bg-secondary hover:text-white transition-all transform hover:scale-110" title="View Fullscreen">
                                    <Eye className="w-5 h-5" />
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <div className="h-40 w-full bg-slate-50 flex items-center justify-center border-b border-slate-100">
                                <FileText className="w-12 h-12 text-primary opacity-20" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button onClick={() => downloadFile(fileUrl, doc.name)} className="bg-white px-6 py-3 rounded-xl text-primary font-bold shadow-xl hover:bg-primary hover:text-white transition-all">
                                    Download File
                                  </button>
                                </div>
                              </div>
                            )}
                            <div className="p-4">
                              <div className="text-sm font-bold text-gray-800 truncate" title={doc.name}>{doc.name}</div>
                              <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{isImage ? 'Image Document' : 'Official Document'}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-4 sm:border-8 border-slate-50 shadow-inner h-[300px] sm:h-[400px] relative">
                <MapContainer key={mapType} center={center} zoom={18} className="h-full w-full" preferCanvas={true}>
                  <TileLayer url={tileLayers[mapType]} crossOrigin="anonymous" />
                  <Polygon positions={land.coordinates.map(c => [c.lat, c.lng])} pathOptions={{ color: '#1e3a8a', fillColor: '#3b82f6', fillOpacity: 0.4, weight: 3 }} />
                </MapContainer>
              </div>
            </div>

            <div className="mt-8 sm:mt-12">
              <h3 className="text-base sm:text-lg font-bold text-primary mb-4">Boundary GPS Coordinates</h3>
              <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[500px]">
                  <thead className="bg-slate-100 text-slate-500 text-[10px] sm:text-xs font-bold uppercase">
                    <tr>
                      <th className="p-3 sm:p-4">Marker</th>
                      <th className="p-3 sm:p-4">Latitude</th>
                      <th className="p-3 sm:p-4">Longitude</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {land.coordinates.map((coord, i) => (
                      <tr key={i} className="text-xs sm:text-sm font-mono text-slate-700">
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

          <div className="bg-slate-50 border-t border-slate-200 p-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div>
              <div className="text-xs font-bold text-primary mb-1">SMART LAND SURVEY SYSTEM OFFICE</div>
              <p className="text-[10px] text-gray-500 max-w-xs leading-relaxed">Ahmedabad, Gujarat 380058</p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Details</div>
              <div className="text-xs font-bold text-primary">+91 93136 29723</div>
              <div className="text-xs text-secondary font-medium">info@smartsurvey.gujarat.gov.in</div>
            </div>
          </div>
        </div>

        <div data-html2canvas-ignore="true" className="mt-12 p-8 bg-gradient-to-br from-secondary/5 to-primary/5 rounded-[2rem] border border-secondary/20 shadow-inner">
          <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
            <span className="bg-secondary text-white p-1.5 rounded-lg text-xs">AI</span> Smart Agriculture Insights
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggestCrops(land.area.value).map((crop, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="text-secondary font-bold mb-1">{crop.name}</div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mb-3">
                  <div className="bg-secondary h-full rounded-full" style={{ width: `${crop.suitability}%` }}></div>
                </div>
                <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Suitability: {crop.suitability}%</div>
                <p className="text-[11px] text-gray-500 leading-tight">{crop.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailBox = ({ icon, label, value }) => (
  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-lg font-extrabold text-primary">{value}</div>
  </div>
);

export default LandDetails;
