import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Calendar, Ruler, Trash2, ExternalLink, Plus, Filter, Search, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [landToDelete, setLandToDelete] = useState(null);
  const { user } = useContext(AuthContext);

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
    <div className="bg-slate-50 min-h-screen p-6 md:p-12 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 lg:mb-10 gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-2">My Land Records</h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium">Manage and track your measured land parcels</p>
          </div>
          <Link 
            to="/measure" 
            className="bg-primary hover:bg-primary-dark text-white px-6 py-4 sm:py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" /> New Measurement
          </Link>
        </div>

        {/* Filters/Search */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by title..." 
              className="w-full pl-12 pr-4 py-3.5 sm:py-3 rounded-xl bg-slate-50 md:bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-primary transition-all text-black placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 border border-slate-200 rounded-xl font-bold text-gray-600 hover:bg-slate-50 transition-all w-full md:w-auto">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Plots" value={lands.length} color="blue" />
          <StatCard title="Approved" value={lands.filter(l => l.status === 'approved').length} color="green" />
          <StatCard title="Pending" value={lands.filter(l => l.status === 'pending').length} color="amber" />
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
                className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-slate-100 group"
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
                      <MapPin className="w-3 h-3" /> {land.coordinates.length} points
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
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Area</div>
                        <div className="font-extrabold text-primary">
                          {convertAreaForDisplay(land.area.value, land.area.unit)} {land.area.unit}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Measured On</div>
                      <div className="text-sm font-medium">{new Date(land.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link 
                      to={`/land/${land._id}`}
                      className="flex-grow flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-primary py-3 rounded-xl font-bold transition-all"
                    >
                      <ExternalLink className="w-4 h-4" /> View Details
                    </Link>
                    <button 
                      onClick={() => confirmDelete(land)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-primary">No records found</h3>
            <p className="text-gray-500 mt-2 mb-6">Start by measuring your first piece of land.</p>
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
              className="bg-white rounded-[1rem] p-8 sm:p-10 max-w-md w-full shadow-2xl relative z-10 border border-slate-100"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-center text-primary mb-2">Delete Record?</h2>
              <p className="text-center text-gray-500 mb-8 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-primary">"{landToDelete?.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-slate-50 transition-all border border-slate-100 flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
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

const StatCard = ({ title, value, color }) => {
  return (
    <div className={`p-6 rounded-3xl border-l-4 shadow-sm bg-white border-primary`}>
      <div className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-1">{title}</div>
      <div className="text-3xl font-extrabold text-primary">{value}</div>
    </div>
  );
};

export default Dashboard;

