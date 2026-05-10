import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Ruler, Trash2, ExternalLink, Plus, Filter, Search, Clock, CheckCircle2, XCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [landToDelete, setLandToDelete] = useState(null);
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetchLands();
  }, []);

  const fetchLands = async () => {
    try {
      const { data } = await api.get('/land/my-lands');
      setLands(data);
    } catch (err) {
      toast.error('Failed to fetch records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (land) => {
    setLandToDelete(land);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!landToDelete) return;
    
    const loadingToast = toast.loading('Deleting record...');
    try {
      await api.delete(`/land/${landToDelete._id}`);
      setLands(lands.filter(l => l._id !== landToDelete._id));
      toast.success('Record deleted successfully', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to delete record', { id: loadingToast });
    } finally {
      setShowDeleteModal(false);
      setLandToDelete(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  const convertAreaForDisplay = (val, targetUnit) => {
    const fromSqMeter = {
      'sq.meter': 1,
      'sq.ft': 10.7639,
      'acre': 0.000247105,
      'hectare': 0.0001,
      'vigha': 0.00061776,
      'guntha': 0.009884,
    };
    return (val * fromSqMeter[targetUnit]).toFixed(2);
  };

  const filteredLands = lands.filter(land => 
    land.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen p-6 md:p-12 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 lg:mb-10 gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-2">
              {i18n.language === 'gu' ? `કેમ છો, ${user?.name?.split(' ')[0]}!` : `Welcome, ${user?.name?.split(' ')[0]}!`}
            </h1>
            <p className={`text-sm sm:text-base font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              {t('my_records')} - {i18n.language === 'gu' ? 'તમારી જમીન માપણીનો ડેટા અહીં છે.' : 'Manage and track your measured land parcels'}
            </p>
          </div>
          <Link 
            to="/measure" 
            className="bg-primary hover:bg-primary-dark text-white px-6 py-4 sm:py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" /> {t('measure_land')}
          </Link>
        </div>

        {/* Filters/Search */}
        <div className={`rounded-3xl p-4 sm:p-6 shadow-sm border mb-8 flex flex-col md:flex-row gap-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder={i18n.language === 'gu' ? 'ટાઈટલ દ્વારા શોધો...' : 'Search by title...'}
              className={`w-full pl-12 pr-4 py-3.5 sm:py-3 rounded-xl border outline-none focus:ring-2 focus:ring-primary transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-black placeholder:text-slate-400'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={`flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 border rounded-xl font-bold transition-all w-full md:w-auto ${isDarkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-gray-600 hover:bg-slate-50'}`}>
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title={i18n.language === 'gu' ? 'કુલ પ્લોટ' : 'Total Plots'} value={lands.length} isDarkMode={isDarkMode} />
          <StatCard title={i18n.language === 'gu' ? 'મંજૂર' : 'Approved'} value={lands.filter(l => l.status === 'approved').length} isDarkMode={isDarkMode} />
          <StatCard title={i18n.language === 'gu' ? 'બાકી' : 'Pending'} value={lands.filter(l => l.status === 'pending').length} isDarkMode={isDarkMode} />
        </div>

        {/* AI Banner */}
        <div className={`mb-10 p-6 rounded-3xl border transition-all relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-r from-slate-900 to-primary/20 border-slate-800' : 'bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10'}`}>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-3 rounded-2xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary">{t('ai_crop_tip')}</h3>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('ai_crop_desc')}</p>
              </div>
            </div>
            <Link to="/measure" className="bg-white dark:bg-slate-800 px-6 py-2.5 rounded-xl text-sm font-black text-primary dark:text-white shadow-md hover:shadow-xl transition-all border border-primary/10">
              {i18n.language === 'gu' ? 'હમણાં તપાસો' : 'Check Now'}
            </Link>
          </div>
          <Sparkles className="absolute -right-6 -bottom-6 w-32 h-32 text-primary/5 rotate-12" />
        </div>

        {/* Records List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredLands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLands.map((land, index) => (
              <motion.div 
                key={land._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all border group ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
              >
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <img 
                    src={`https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt="Map Preview"
                  />
                  <div className="absolute top-4 right-4 z-20">
                    {getStatusBadge(land.status)}
                  </div>
                  <div className="absolute bottom-4 left-4 z-20 text-white">
                    <h3 className="font-bold text-xl">{land.title}</h3>
                    <div className="flex items-center gap-1 text-xs opacity-90">
                      <MapPin className="w-3 h-3" /> {land.coordinates.length} {t('points')}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-secondary/10 p-2 rounded-lg">
                        <Ruler className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <div className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{t('area')}</div>
                        <div className="font-extrabold text-primary">
                          {convertAreaForDisplay(land.area.value, land.area.unit)} {land.area.unit}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{t('measured_on')}</div>
                      <div className="text-sm font-medium">{new Date(land.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link 
                      to={`/land/${land._id}`}
                      className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-50 hover:bg-slate-100 text-primary'}`}
                    >
                      <ExternalLink className="w-4 h-4 text-primary dark:text-white" /> <span className={isDarkMode ? 'text-white' : 'text-primary'}>{i18n.language === 'gu' ? 'વિગતો જુઓ' : 'View Details'}</span>
                    </Link>
                    <button 
                      onClick={() => confirmDelete(land)}
                      className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-20 rounded-3xl border border-dashed ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}>
            <div className="bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-primary">No records found</h3>
            <p className={`mt-2 mb-6 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>Start by measuring your first piece of land.</p>
            <Link to="/measure" className="text-secondary font-bold underline">Go to Measurement Tool</Link>
          </div>
        )}
      </div>

      {/* Professional Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`rounded-[1rem] p-8 sm:p-10 max-w-md w-full shadow-2xl relative z-10 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
            >
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-center text-primary mb-2">Delete Record?</h2>
              <p className={`text-center mb-8 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Are you sure you want to delete <span className="font-bold text-primary">"{landToDelete?.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all border flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base ${isDarkMode ? 'text-slate-400 border-slate-700 hover:bg-slate-800' : 'text-gray-500 border-slate-100 hover:bg-slate-50'}`}
                >
                  <XCircle className="w-5 h-5" /> Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-xl shadow-red-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base px-4"
                >
                  <Trash2 className="w-5 h-5" /> Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ title, value, isDarkMode }) => {
  return (
    <div className={`p-6 rounded-3xl border-l-4 shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-primary border-t border-r border-b border-slate-800' : 'bg-white border-primary border-t border-r border-b border-slate-100'}`}>
      <div className={`font-bold uppercase text-xs tracking-widest mb-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{title}</div>
      <div className="text-3xl font-extrabold text-primary">{value}</div>
    </div>
  );
};

export default Dashboard;
