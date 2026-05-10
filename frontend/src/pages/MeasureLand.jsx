import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, useMap, Polygon } from 'react-leaflet';
import { getAreaOfPolygon, getDistance } from 'geolib';
import { Ruler, Save, Trash2, Map as MapIcon, Crosshair, Navigation, Layers, CheckCircle, ArrowRightLeft, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

// Geoman Drawing Control Component
const GeomanControl = ({ onCreated, onEdited }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

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
  const [mapType, setMapType] = useState('normal');
  const [showMapDropdown, setShowMapDropdown] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const watchId = useRef(null);

  // Map Tile Layers
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
      'vigha': 0.00061776, // 1 sq.m = 0.00061776 vigha
      'guntha': 0.009884, // 1 sq.m = 0.009884 guntha
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
      alert("Geolocation not supported");
      return;
    }
    setIsTracking(true);
    setSurveyMode('gps');
    setCoordinates([]);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newCoord = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoordinates(prev => {
          const updated = [...prev, newCoord];
          if (updated.length >= 3) setArea(calculateArea(updated));
          return updated;
        });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, distanceFilter: 1 }
    );
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
      
      // Append each document
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

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden relative">
      {/* Mobile Header Overlay (Floating) */}
      <div className="absolute top-4 left-4 right-4 z-[1000] md:hidden pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20 pointer-events-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <Ruler className="text-white w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Area</div>
                <div className="flex items-center gap-1">
                  <div className="text-lg font-black text-secondary leading-none">
                    {convertArea(area, unit)}
                  </div>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="bg-slate-100 text-[10px] font-bold text-gray-500 rounded-md border-none px-1 py-0.5 focus:ring-1 focus:ring-secondary outline-none cursor-pointer"
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
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
          
          {/* Mobile Quick Toggles */}
          <div className="flex gap-2">
            <button 
              onClick={() => setSurveyMode(surveyMode === 'manual' ? 'gps' : 'manual')}
              className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-xl pointer-events-auto flex items-center gap-2 border border-white/10"
            >
              {surveyMode === 'manual' ? <Crosshair className="w-3 h-3" /> : <MapIcon className="w-3 h-3" />}
              {surveyMode === 'manual' ? 'GPS Mode' : 'Manual Mode'}
            </button>
            <button 
              onClick={() => setMapType(mapType === 'normal' ? 'satellite' : 'normal')}
              className="bg-white/80 backdrop-blur-md text-primary px-4 py-2 rounded-xl text-[10px] font-bold shadow-xl pointer-events-auto flex items-center gap-2 border border-black/5"
            >
              <Layers className="w-3 h-3" />
              {mapType === 'normal' ? 'Satellite' : 'Normal'}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Controls (Desktop) */}
      <div className="hidden md:flex w-96 bg-white border-r border-slate-200 flex-col overflow-hidden shadow-2xl z-20">
        <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
          <div className="flex items-center space-x-2 mb-8">
            <div className="bg-primary p-2 rounded-lg">
              <Ruler className="text-white w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-primary tracking-tight">Measurement Tool</h2>
          </div>

          {/* Info Card */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-100">
            <div className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-2">Calculated Area</div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-secondary">
                {convertArea(area, unit)}
              </span>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="bg-black text-white px-3 py-1 rounded-lg font-bold text-xs border-none focus:ring-2 focus:ring-secondary cursor-pointer outline-none shadow-md"
              >
                <option value="sq.meter">Sq. Meter</option>
                <option value="sq.ft">Sq. Ft</option>
                <option value="acre">Acre</option>
                <option value="hectare">Hectare</option>
                <option value="vigha">Vigha</option>
                <option value="guntha">Guntha</option>
              </select>
            </div>
          </div>

          {/* Perimeter Card */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Perimeter</div>
            </div>
            <div className="text-lg font-bold text-primary">{perimeter.toFixed(2)} m</div>
          </div>

          {/* Survey Mode Switch */}
          <div className="space-y-4 mb-6">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Survey Mode</div>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => { setSurveyMode('manual'); stopTracking(); }}
                className={`py-2 rounded-lg font-medium transition-all ${surveyMode === 'manual' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
              >
                Manual Draw
              </button>
              <button
                onClick={() => setSurveyMode('gps')}
                className={`py-2 rounded-lg font-medium transition-all ${surveyMode === 'gps' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
              >
                GPS Tracking
              </button>
            </div>
          </div>

          {/* GPS Controls */}
          {surveyMode === 'gps' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Navigation className="w-4 h-4" /> GPS Live Tracking
              </h4>
              <p className="text-sm text-blue-700 mb-4">Walk along the perimeter of your land to map it automatically.</p>
              {!isTracking ? (
                <button
                  onClick={startTracking}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Crosshair className="w-5 h-5" /> Start Capture
                </button>
              ) : (
                <button
                  onClick={stopTracking}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 animate-pulse transition-all shadow-md"
                >
                  <Trash2 className="w-5 h-5" /> Stop Capture
                </button>
              )}
              <div className="mt-4 text-xs font-mono text-blue-800">
                Captured Points: {coordinates.length}
              </div>
            </div>
          )}

          {/* Map Layers Custom Dropdown */}
          <div className="space-y-4 mb-6">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <MapIcon className="w-4 h-4" /> Map View
            </div>
            <div className="relative group">
              <button
                onClick={() => setShowMapDropdown(!showMapDropdown)}
                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-black text-white font-bold transition-all shadow-2xl hover:bg-slate-900 border-none outline-none"
              >
                <div className="flex items-center gap-3 text-sm">
                  {mapType === 'satellite' ? '🛰️ Satellite Map' : '🗺️ Normal Map'}
                </div>
                <Layers className={`w-5 h-5 transition-transform ${showMapDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showMapDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 right-0 mb-3 bg-black rounded-2xl overflow-hidden shadow-2xl border-none z-50"
                  >
                    <button
                      onClick={() => { setMapType('normal'); setShowMapDropdown(false); }}
                      className={`w-full text-left px-5 py-4 hover:bg-slate-800 transition-colors flex items-center gap-3 font-bold ${mapType === 'normal' ? 'text-secondary' : 'text-white'}`}
                    >
                      🗺️ Normal Map
                    </button>
                    <button
                      onClick={() => { setMapType('satellite'); setShowMapDropdown(false); }}
                      className={`w-full text-left px-5 py-4 hover:bg-slate-800 transition-colors flex items-center gap-3 font-bold ${mapType === 'satellite' ? 'text-secondary' : 'text-white'}`}
                    >
                      🛰️ Satellite Map
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Save Button (Desktop) */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={coordinates.length < 3}
            className="w-full bg-secondary hover:bg-secondary-dark disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" /> Save Measurement
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
          zoomControl={false} // Disable default to reposition or use custom
        >
          <TileLayer key={mapType} url={tileLayers[mapType]} />
          <LocateControl />

          {surveyMode === 'manual' && (
            <GeomanControl onCreated={handleCreated} onEdited={handleEdited} />
          )}

          {surveyMode === 'gps' && coordinates.length > 0 && (
            <>
              <Polygon
                positions={coordinates.map(c => [c.lat, c.lng])}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.3 }}
              />
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
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-[2001]"
            >
              <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                <CheckCircle className="text-secondary" /> Finalize Measurement
              </h3>
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}
              <form onSubmit={handleSave} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Survey Title</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all text-black placeholder:text-slate-400 shadow-sm"
                    placeholder="e.g. West Farm Boundary"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description / Notes</label>
                  <textarea 
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all h-24 text-black placeholder:text-slate-400 shadow-sm resize-none"
                    placeholder="Add any specific details about this measurement..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
                
                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Upload Documents (7/12, Photos, etc.)</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-primary transition-colors cursor-pointer relative bg-slate-50 group">
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
                      <div className="text-sm font-bold text-gray-600">Click to upload or drag & drop</div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">PDF, JPG, PNG allowed</p>
                    </div>
                  </div>
                  
                  {/* Selected Files Preview */}
                  {documents.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {documents.map((file, i) => (
                        <div key={i} className="bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-lg text-[11px] font-bold text-primary flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1">
                          <span className="truncate max-w-[120px]">{file.name}</span>
                          <button 
                            type="button"
                            onClick={() => {
                              setDocuments(prev => prev.filter((_, idx) => idx !== i));
                            }}
                            className="hover:text-red-500 transition-colors text-lg"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 px-6 py-3 border border-slate-200 text-gray-500 rounded-xl font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-secondary hover:bg-secondary-dark text-white rounded-xl font-bold shadow-lg shadow-secondary/20 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Confirm & Save'}
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
      map.setView([last.lat, last.lng], 18);
    }
  }, [coords, map]);
  return null;
};

export default MeasureLand;
