import React, { useState, useEffect, useRef, useContext } from 'react';
import { MapContainer, TileLayer, FeatureGroup, useMap, Polygon, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { getAreaOfPolygon, getDistance } from 'geolib';
import { Ruler, Save, Trash2, Map as MapIcon, Crosshair, Navigation, Layers, CheckCircle, ArrowRightLeft, Eye, EyeOff, Sparkles, MapPin, FileText } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

// Geoman Drawing Control Component
const GeomanControl = ({ onCreated, onEdited }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    map.pm.setGlobalOptions({ 
      snappingDistance: 20,
      allowSelfIntersection: false,
      templineStyle: { color: '#3b82f6', dashArray: '5, 5' },
      hintlineStyle: { color: '#3b82f6', dashArray: '5, 5' },
    });

    map.pm.addControls({
      position: 'topright',
      drawPolygon: true,
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawCircle: false,
      drawText: false,
      editMode: true,
      dragMode: true,
      cutPolygon: false,
      removalMode: true,
    });

    map.pm.setPathOptions({
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.4,
    });

    map.on('pm:create', (e) => {
      const { layer } = e;
      if (e.shape === 'Polygon') {
        const latlngs = layer.getLatLngs()[0].map(latlng => ({
          lat: latlng.lat,
          lng: latlng.lng
        }));
        onCreated(latlngs);

        // Listen for edits on the newly created layer
        layer.on('pm:edit', () => {
          const updatedLatlngs = layer.getLatLngs()[0].map(latlng => ({
            lat: latlng.lat,
            lng: latlng.lng
          }));
          onEdited(updatedLatlngs);
        });
      }
    });

    // Auto-enable polygon tool on mount for manual mode
    map.pm.enableDraw('Polygon');

    return () => {
      if (map.pm) {
        map.pm.removeControls();
        map.pm.disableDraw();
        map.off('pm:create');
      }
    };
  }, [map, onCreated, onEdited]);

  return null;
};

// Locate Me Control
const LocateControl = () => {
  const map = useMap();
  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 18 });
  };
  return (
    <div className="leaflet-top leaflet-left !mt-20">
      <div className="leaflet-control leaflet-bar border-none shadow-2xl">
        <button
          onClick={handleLocate}
          className="bg-black p-3 hover:bg-slate-900 transition-all flex items-center justify-center rounded-xl border-none outline-none"
          title="Locate Me"
        >
          <Crosshair className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

const MeasureLand = () => {
  const [coordinates, setCoordinates] = useState([]);
  const [area, setArea] = useState(0);
  const [perimeter, setPerimeter] = useState(0);
  const [unit, setUnit] = useState('sq.meter');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [documents, setDocuments] = useState([]);
  const [surveyMode, setSurveyMode] = useState('manual');
  const [isTracking, setIsTracking] = useState(false);
  const [mapType, setMapType] = useState('satellite');
  const [showMapDropdown, setShowMapDropdown] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);

  const { isDarkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const watchId = useRef(null);

  // Map Tile Layers
  const tileLayers = {
    normal: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', // Google Normal
    satellite: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', // Google Hybrid
  };

  const calculateArea = (coords) => {
    if (coords.length < 3) return 0;
    try {
      const areaInSqM = getAreaOfPolygon(coords);

      // Calculate perimeter
      let dist = 0;
      for (let i = 0; i < coords.length; i++) {
        const next = coords[(i + 1) % coords.length];
        dist += getDistance(coords[i], next);
      }
      setPerimeter(dist);

      return areaInSqM;
    } catch (e) {
      console.error(e);
      return 0;
    }
  };

  const convertArea = (value, targetUnit) => {
    const conversions = {
      'sq.meter': 1,
      'sq.ft': 10.7639,
      'acre': 0.000247105,
      'hectare': 0.0001,
      'vigha': 0.00061776,
      'guntha': 0.009884,
    };
    return (value * conversions[targetUnit]).toFixed(2);
  };

  const handleCreated = (latlngs) => {
    setCoordinates(latlngs);
    setArea(calculateArea(latlngs));
  };

  const handleEdited = (latlngs) => {
    setCoordinates(latlngs);
    setArea(calculateArea(latlngs));
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setIsTracking(true);
    setSurveyMode('gps');
    setCoordinates([]);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newCoord = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentLocation(newCoord);
        // We no longer automatically push to coordinates to ensure accuracy
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, distanceFilter: 0 }
    );
  };

  const dropGPSMarker = () => {
    if (!currentLocation) {
      toast.error("Waiting for GPS signal...");
      return;
    }
    setCoordinates(prev => {
      const updated = [...prev, currentLocation];
      if (updated.length >= 3) setArea(calculateArea(updated));
      return updated;
    });
    toast.success(i18n.language === 'gu' ? 'પોઈન્ટ ઉમેર્યો' : 'Point added');
  };

  const stopTracking = () => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
  };

  useEffect(() => {
    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (coordinates.length < 3) {
      toast.error('Please draw a valid polygon first.');
      return;
    }
    setLoading(true);
    const loadingToast = toast.loading('Saving your measurement...');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('coordinates', JSON.stringify(coordinates));
      formData.append('surveyMode', surveyMode);
      formData.append('area', area);
      formData.append('unit', unit);
      
      documents.forEach(doc => {
        formData.append('documents', doc);
      });

      await api.post('/land', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Record saved successfully!', { id: loadingToast });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save record', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // If the user is in manual mode and still drawing, the coordinates state might be empty
    // since we finalise it on pm:create.
    if (surveyMode === 'manual' && coordinates.length === 0) {
      toast.error(i18n.language === 'gu' ? 'મહેરબાની કરીને પહેલા માપણી પૂરી કરો (પહેલા પોઈન્ટ પર ક્લિક કરીને)' : "Please finish the measurement first (by clicking the first point)");
      return;
    }

    if (coordinates.length === 0) {
      toast.error("No coordinates found to export");
      return;
    }

    try {
      const headers = ["Marker ID", "Latitude", "Longitude"];
      const csvRows = [
        headers.join(","),
        ...coordinates.map((c, i) => `${i + 1},${c.lat},${c.lng}`)
      ];
      
      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Survey_${title.replace(/\s+/g, '_') || 'Data'}_${new Date().toLocaleDateString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(i18n.language === 'gu' ? 'CSV ફાઈલ ડાઉનલોડ થઈ ગઈ' : "CSV Exported successfully!");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to generate CSV");
    }
  };

  const getCentroid = (coords) => {
    if (coords.length === 0) return [0, 0];
    const lat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
    const lng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;
    return [lat, lng];
  };

  return (
    <div className={`h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden relative transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Mobile Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] md:hidden pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className={`backdrop-blur-md rounded-2xl p-4 shadow-2xl border pointer-events-auto flex justify-between items-center ${isDarkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-white/20'}`}>
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <Ruler className="text-white w-4 h-4" />
              </div>
              <div>
                <div className={`text-[10px] uppercase tracking-widest font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{t('area')}</div>
                <div className="flex items-center gap-1">
                  <div className="text-lg font-black text-secondary leading-none">
                    {convertArea(area, unit)}
                  </div>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className={`text-[10px] font-bold rounded-md border-none px-1 py-0.5 focus:ring-1 focus:ring-secondary outline-none cursor-pointer ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-gray-500'}`}
                  >
                    <option value="sq.meter">m²</option>
                    <option value="sq.ft">ft²</option>
                    <option value="acre">Acre</option>
                    <option value="hectare">Hect</option>
                    <option value="vigha">Vigha</option>
                    <option value="guntha">Gunt</option>
                  </select>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowSaveModal(true)}
              disabled={coordinates.length < 3}
              className="bg-secondary hover:bg-secondary-dark disabled:bg-gray-300 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {i18n.language === 'gu' ? 'સેવ' : 'Save'}
            </button>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setSurveyMode(surveyMode === 'manual' ? 'gps' : 'manual')}
              className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-xl pointer-events-auto flex items-center gap-2 border border-white/10"
            >
              {surveyMode === 'manual' ? <Crosshair className="w-3 h-3" /> : <MapIcon className="w-3 h-3" />}
              {surveyMode === 'manual' ? (i18n.language === 'gu' ? 'GPS મોડ' : 'GPS Mode') : (i18n.language === 'gu' ? 'મેન્યુઅલ મોડ' : 'Manual Mode')}
            </button>
            {surveyMode === 'gps' && isTracking && (
              <button 
                onClick={dropGPSMarker}
                className="bg-secondary text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-xl pointer-events-auto flex items-center gap-2 border border-white/20 animate-pulse"
              >
                <MapPin className="w-3 h-3" />
                {i18n.language === 'gu' ? 'પોઈન્ટ મૂકો' : 'Drop Point'}
              </button>
            )}
            <button 
              onClick={() => setMapType(mapType === 'normal' ? 'satellite' : 'normal')}
              className={`backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold shadow-xl pointer-events-auto flex items-center gap-2 border ${isDarkMode ? 'bg-slate-800/80 text-white border-slate-700' : 'bg-white/80 text-primary border-black/5'}`}
            >
              <Layers className="w-3 h-3" />
              {mapType === 'normal' ? 'Satellite' : 'Normal'}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Controls (Desktop) */}
      <div className={`hidden md:flex w-[420px] border-r flex-col overflow-hidden shadow-2xl z-20 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="p-8 overflow-y-auto flex-grow no-scrollbar space-y-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Ruler className="text-primary w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary tracking-tight leading-none">{i18n.language === 'gu' ? 'માપણી ટૂલ' : 'Measurement Tool'}</h2>
              <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Precision Mapping Engine</p>
            </div>
          </div>

          {/* Area Card - Premium Glass Design */}
          <div className={`rounded-[2rem] p-8 border transition-all relative overflow-hidden group ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-2xl' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-xl'}`}>
            <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-primary/5 rotate-12 group-hover:scale-110 transition-transform" />
            <div className={`text-[10px] uppercase tracking-[0.2em] font-black mb-4 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{i18n.language === 'gu' ? 'ગણતરી કરેલ વિસ્તાર' : 'Calculated Area'}</div>
            <div className="flex flex-col gap-6">
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black text-secondary tracking-tighter drop-shadow-sm">
                  {convertArea(area, unit)}
                </span>
                <span className="text-xs font-bold text-gray-500 uppercase">{unit.replace('sq.', '')}</span>
              </div>
              <div className="relative group/select">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className={`w-full appearance-none px-5 py-4 rounded-2xl font-bold text-sm border outline-none cursor-pointer shadow-lg transition-all pr-12 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:border-secondary focus:ring-2 focus:ring-secondary/20' : 'bg-white border-slate-200 text-slate-900 hover:border-secondary focus:ring-4 focus:ring-secondary/10'}`}
                >
                  <option value="sq.meter">Square Meter (m²)</option>
                  <option value="sq.ft">Square Feet (ft²)</option>
                  <option value="acre">Acre (એકર)</option>
                  <option value="hectare">Hectare (હેક્ટર)</option>
                  <option value="vigha">Vigha (વિઘા - Gujarat)</option>
                  <option value="guntha">Guntha (ગુંઠા)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                  <ArrowRightLeft className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Perimeter Card */}
            <div className={`rounded-3xl p-5 border transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{i18n.language === 'gu' ? 'પરિમિતિ' : 'Perimeter'}</span>
              </div>
              <div className="text-xl font-black text-primary tracking-tight">{perimeter.toFixed(2)}<span className="text-[10px] ml-1 text-gray-500">m</span></div>
            </div>

            {/* Points Card */}
            <div className={`rounded-3xl p-5 border transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Crosshair className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{i18n.language === 'gu' ? 'માર્કર્સ' : 'Markers'}</span>
              </div>
              <div className="text-xl font-black text-primary tracking-tight">{coordinates.length}<span className="text-[10px] ml-1 text-gray-500">Pts</span></div>
            </div>
          </div>

          {/* Survey Mode Switch - Professional Toggle */}
          <div className="space-y-4">
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{i18n.language === 'gu' ? 'સર્વે મોડ પસંદ કરો' : 'Select Survey Mode'}</div>
            <div className={`flex p-1.5 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100/50 border-slate-200'}`}>
              <button
                onClick={() => { setSurveyMode('manual'); stopTracking(); }}
                className={`flex-1 py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 ${surveyMode === 'manual' ? 'bg-primary text-white shadow-lg scale-[1.02]' : 'text-gray-500 hover:text-primary'}`}
              >
                <MapIcon className="w-4 h-4" /> {i18n.language === 'gu' ? 'મેન્યુઅલ' : 'Manual'}
              </button>
              <button
                onClick={() => setSurveyMode('gps')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 ${surveyMode === 'gps' ? 'bg-primary text-white shadow-lg scale-[1.02]' : 'text-gray-500 hover:text-primary'}`}
              >
                <Navigation className="w-4 h-4" /> {i18n.language === 'gu' ? 'GPS' : 'GPS Live'}
              </button>
            </div>
          </div>

          {/* GPS Content (Same as before but polished) */}
          {surveyMode === 'gps' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-blue-900/10 border-blue-800' : 'bg-blue-50/50 border-blue-100 shadow-inner'}`}
            >
              <h4 className={`font-black mb-2 flex items-center gap-2 text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                <CheckCircle className="w-4 h-4" /> {isTracking ? (currentLocation ? (i18n.language === 'gu' ? 'GPS સિગ્નલ મજબૂત છે' : 'GPS Signal Strong') : (i18n.language === 'gu' ? 'સિગ્નલ શોધી રહ્યા છીએ...' : 'Acquiring Signal...')) : (i18n.language === 'gu' ? 'GPS ટ્રેકિંગ બંધ છે' : 'GPS Tracking Ready')}
              </h4>
              <p className={`text-xs mb-5 font-medium leading-relaxed ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                {i18n.language === 'gu' ? 'જમીનના ખૂણા પર જઈને "Drop Marker" બટન દબાવો.' : 'Walk to a corner of the land and click "Drop Marker" to capture the point.'}
              </p>
              {!isTracking ? (
                <button
                  onClick={startTracking}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  <Crosshair className="w-5 h-5" /> {i18n.language === 'gu' ? 'ટ્રેકિંગ શરૂ કરો' : 'Start Capture'}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={dropGPSMarker}
                    className="w-full bg-secondary hover:bg-secondary-dark text-white py-5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-xl shadow-secondary/20 active:scale-95 border-2 border-white/20"
                  >
                    <MapPin className="w-6 h-6" /> {i18n.language === 'gu' ? 'અહીં પોઈન્ટ મૂકો' : 'Drop Marker Here'}
                  </button>
                  <button
                    onClick={stopTracking}
                    className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    <Trash2 className="w-4 h-4" /> {i18n.language === 'gu' ? 'ટ્રેકિંગ બંધ કરો' : 'Stop Capture'}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Map View Toggle - Professional Card */}
          <div className="space-y-4">
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{i18n.language === 'gu' ? 'એક્સ્પોર્ટ ઓપ્શન્સ' : 'Export Options'}</div>
            <button
              onClick={exportToCSV}
              disabled={coordinates.length === 0}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border font-bold text-xs transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-blue-600 hover:bg-slate-100'} disabled:opacity-30 disabled:grayscale shadow-sm`}
            >
              <FileText className="w-4 h-4" /> {i18n.language === 'gu' ? 'CSV માં ડાઉનલોડ કરો' : 'Export Coordinates (CSV)'}
            </button>
          </div>

          <div className="space-y-4 pt-2">
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{i18n.language === 'gu' ? 'મેપ પ્રકાર' : 'Map Type'}</div>
            <button
              onClick={() => setMapType(mapType === 'normal' ? 'satellite' : 'normal')}
              className={`w-full group flex items-center justify-between p-1.5 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 hover:border-primary shadow-sm'}`}
            >
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${mapType === 'satellite' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                <MapIcon className="w-4 h-4" />
                <span className="text-xs font-bold">{mapType === 'satellite' ? 'Satellite' : 'Normal'}</span>
              </div>
              <div className="px-4 text-xs font-bold text-primary group-hover:underline uppercase tracking-tighter">
                {i18n.language === 'gu' ? 'બદલો' : 'Switch'}
              </div>
            </button>
          </div>
        </div>

        {/* Save Button (Desktop) - Enhanced with secondary color */}
        <div className={`p-8 border-t transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={coordinates.length < 3}
            className="w-full bg-secondary hover:bg-secondary-dark disabled:bg-slate-200 disabled:text-slate-400 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-secondary/30 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
          >
            <Save className="w-6 h-6" /> {i18n.language === 'gu' ? 'માપણી સેવ કરો' : 'Export & Save'}
          </button>
        </div>
      </div>

      {/* Map View */}
      <div className="flex-grow relative z-10">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          className="h-full w-full"
          scrollWheelZoom={true}
          zoomControl={false}
        >
          <TileLayer key={mapType} url={tileLayers[mapType]} />
          <LocateControl />

          {surveyMode === 'manual' && (
            <GeomanControl onCreated={handleCreated} onEdited={handleEdited} />
          )}

          {(surveyMode === 'gps' || coordinates.length > 0) && (
            <>
              <Polygon
                positions={coordinates.map(c => [c.lat, c.lng])}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.3, weight: 3 }}
              >
                {coordinates.length >= 3 && (
                  <Tooltip permanent direction="center" className="area-tooltip">
                    <div className="flex flex-col items-center bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-xl border border-primary/20">
                      <div className="text-[8px] font-black uppercase text-primary tracking-tighter leading-none mb-1">Measured Area</div>
                      <div className="text-sm font-black text-secondary leading-none">{convertArea(area, unit)} <span className="text-[8px] font-bold text-gray-500">{unit.split('.')[1] || unit}</span></div>
                    </div>
                  </Tooltip>
                )}
              </Polygon>
              {currentLocation && (
                <CircleMarker 
                  center={[currentLocation.lat, currentLocation.lng]}
                  radius={8}
                  pathOptions={{ color: 'white', fillColor: '#3b82f6', fillOpacity: 1, weight: 3 }}
                >
                  <Popup>
                    <div className="text-xs font-bold">Your Current Location</div>
                  </Popup>
                </CircleMarker>
              )}
              <MapUpdater coords={coordinates} />
            </>
          )}
        </MapContainer>
      </div>

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveModal(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-[2001] border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
            >
              <h3 className="text-2xl font-black text-primary mb-6 flex items-center gap-3">
                <Sparkles className="text-secondary" /> {i18n.language === 'gu' ? 'માપણી પૂર્ણ કરો' : 'Finalize Measurement'}
              </h3>
              <form onSubmit={handleSave} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`}>{i18n.language === 'gu' ? 'સર્વે ટાઈટલ' : 'Survey Title'}</label>
                  <input 
                    type="text" 
                    required
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-primary' : 'bg-white border-slate-200 text-black placeholder:text-slate-400 focus:ring-primary'}`}
                    placeholder="e.g. West Farm Boundary"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`}>{t('description')}</label>
                  <textarea 
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all h-24 shadow-sm resize-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-primary' : 'bg-white border-slate-200 text-black placeholder:text-slate-400 focus:ring-primary'}`}
                    placeholder="Add any specific details about this measurement..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
                
                {/* File Upload Section */}
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`}>{i18n.language === 'gu' ? 'દસ્તાવેજો અપલોડ કરો (૭/૧૨, ફોટા, વગેરે)' : 'Upload Documents (7/12, Photos, etc.)'}</label>
                  <div className={`border-2 border-dashed rounded-2xl p-6 text-center hover:border-primary transition-colors cursor-pointer relative group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <input 
                      type="file" 
                      multiple 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setDocuments(prev => [...prev, ...files]);
                      }}
                    />
                    <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-transform">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Save className="w-6 h-6 text-primary" />
                      </div>
                      <div className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>{i18n.language === 'gu' ? 'અહીં ક્લિક કરો અથવા ફાઈલ ખેંચો' : 'Click to upload or drag & drop'}</div>
                      <p className={`text-[10px] uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>PDF, JPG, PNG allowed</p>
                    </div>
                  </div>
                  
                  {/* Selected Files Preview */}
                  {documents.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {documents.map((file, i) => (
                        <div key={i} className="bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-lg text-[11px] font-bold text-primary flex items-center gap-2">
                          <span className="truncate max-w-[120px]">{file.name}</span>
                          <button type="button" onClick={() => setDocuments(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-500 transition-colors text-lg">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(false)}
                    className={`flex-1 px-6 py-3 border rounded-xl font-bold transition-all ${isDarkMode ? 'border-slate-700 text-slate-500 hover:bg-slate-800' : 'border-slate-200 text-gray-500 hover:bg-slate-50'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-secondary hover:bg-secondary-dark text-white rounded-xl font-bold shadow-lg shadow-secondary/20 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (i18n.language === 'gu' ? 'સેવ કરો' : 'Confirm & Save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MapUpdater = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      const last = coords[coords.length - 1];
      map.setView([last.lat, last.lng], map.getZoom());
    }
  }, [coords, map]);
  return null;
};

export default MeasureLand;
