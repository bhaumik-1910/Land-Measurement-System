import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Users, Map, CheckCircle, Clock, AlertTriangle,
  BarChart, ArrowUpRight, TrendingUp, Search,
  Check, X, Eye, FileText, LayoutGrid, List,
  Trash2, Lock, Unlock
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Tooltip from '@mui/material/Tooltip';
import { 
  Dialog, DialogTitle, DialogContent, DialogContentText, 
  DialogActions, Button 
} from '@mui/material';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [lands, setLands] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lands');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/admin/analytics');
      const landsRes = await api.get('/admin/lands');
      const usersRes = await api.get('/admin/users');
      setStats(statsRes.data);
      setLands(landsRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/lands/${id}/status`, { status });
      setLands(lands.map(l => l._id === id ? { ...l, status } : l));
      toast.success(`Record ${status} successfully`);
      // Refresh stats
      const statsRes = await api.get('/admin/analytics');
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/admin/users/${userToDelete._id}`);
      setUsers(users.filter(u => u._id !== userToDelete._id));
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const toggleLock = async (id, currentStatus) => {
    try {
      const res = await api.patch(`/admin/users/${id}/lock`);
      setUsers(users.map(u => u._id === id ? { ...u, isLocked: res.data.isLocked } : u));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
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

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Top Banner */}
      <div className="bg-primary text-white py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-extrabold mb-2">Administrator Panel</h1>
            <p className="text-blue-100 text-lg opacity-80">Government Land Verification & Survey Management System</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex gap-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-blue-200">System Status</div>
              <div className="flex items-center gap-2 text-green-400 font-bold">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> Online
              </div>
            </div>
            <div className="border-l border-white/10 pl-8">
              <div className="text-xs font-bold uppercase tracking-widest text-blue-200">Last Sync</div>
              <div className="font-bold">Just Now</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-10 pb-20">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatBox icon={<Users className="w-6 h-6" />} label="Total Users" value={stats?.totalUsers} trend="+12%" color="blue" />
          <StatBox icon={<Map className="w-6 h-6" />} label="Measurements" value={stats?.totalLands} trend="+5%" color="purple" />
          <StatBox icon={<CheckCircle className="w-6 h-6" />} label="Approved" value={stats?.approvedLands} trend="+8%" color="green" />
          <StatBox icon={<Clock className="w-6 h-6" />} label="Pending" value={stats?.pendingLands} trend="-2%" color="amber" />
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab('lands')}
              className={`px-8 py-5 font-bold transition-all border-b-2 ${activeTab === 'lands' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Land Verifications
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-8 py-5 font-bold transition-all border-b-2 ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              User Management
            </button>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary transition-all outline-none text-black placeholder:text-slate-400 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {activeTab === 'lands' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 font-bold text-sm uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-4 pl-4">Title / Owner</th>
                      <th className="pb-4">Area</th>
                      <th className="pb-4">Date Submitted</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {lands.filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase())).map(land => (
                      <tr key={land._id} className="hover:bg-slate-50 transition-colors group">
                        <td className="py-5 pl-4">
                          <div className="font-bold text-primary">{land.title}</div>
                          <div className="text-xs text-gray-500">{land.user?.name} ({land.user?.email})</div>
                        </td>
                        <td className="py-5 font-medium text-slate-700">
                          {convertAreaForDisplay(land.area.value, land.area.unit)} {land.area.unit}
                        </td>
                        <td className="py-5 text-gray-500 text-sm">
                          {new Date(land.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-5">
                          {getStatusBadge(land.status)}
                        </td>
                        <td className="py-5">
                          <div className="flex justify-center gap-2">
                            {land.status === 'pending' && (
                              <>
                                <Tooltip title="Approve">
                                  <button
                                    onClick={() => updateStatus(land._id, 'approved')}
                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <button
                                    onClick={() => updateStatus(land._id, 'rejected')}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </Tooltip>
                              </>
                            )}
                            <Tooltip title="View Details">
                              <button
                                onClick={() => window.location.href = `/land/${land._id}`}
                                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-primary hover:text-white transition-all"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                  <div key={u._id} className={`p-6 rounded-3xl border transition-all ${u.isLocked ? 'bg-red-50/50 border-red-100 shadow-inner' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${u.isLocked ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                          {u.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-primary flex items-center gap-2">
                            {u.name}
                            {u.isLocked && <Lock className="w-3 h-3 text-red-500" />}
                          </div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Tooltip title={u.isLocked ? "Unlock User" : "Lock User"}>
                          <button
                            onClick={() => toggleLock(u._id, u.isLocked)}
                            className={`p-2 rounded-xl transition-all ${u.isLocked ? 'bg-red-100 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-amber-500 hover:text-white'}`}
                          >
                            {u.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <button 
                            onClick={() => handleDeleteClick(u)}
                            className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] mt-6 pt-4 border-t border-slate-100">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${u.isLocked ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        {u.isLocked ? 'Locked' : 'Surveyor'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '32px',
            textAlign: 'center',
            overflow: 'visible'
          }
        }}
      >
        <div className="flex flex-col items-center px-8 py-10">
          {/* Warning Icon Container */}
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-8 shadow-inner">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <div className="space-y-3 mb-10 text-center">
            <h3 className="text-3xl font-black text-primary tracking-tight">Delete Record?</h3>
            <p className="text-gray-500 leading-relaxed text-sm max-w-[280px] mx-auto">
              Are you sure you want to delete <span className="font-bold text-primary">"{userToDelete?.name}"</span>? 
              This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 h-[56px] rounded-2xl border border-slate-200 text-gray-500 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-sm whitespace-nowrap"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 h-[56px] rounded-2xl bg-red-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-200 text-sm whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              Delete Permanently
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

const StatBox = ({ icon, label, value, trend, color }) => {
  const bgColors = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500'
  };
  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center gap-6">
      <div className={`${bgColors[color]} p-4 rounded-2xl text-white shadow-lg`}>
        {icon}
      </div>
      <div>
        <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">{label}</div>
        <div className="text-2xl font-extrabold text-primary">{value}</div>
        <div className="text-[10px] font-bold text-green-500 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {trend} <span className="text-gray-300">from last month</span>
        </div>
      </div>
    </div>
  );
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'approved':
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold"><CheckCircle className="w-3 h-3" /> Approved</span>;
    case 'rejected':
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold"><AlertTriangle className="w-3 h-3" /> Rejected</span>;
    default:
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold"><Clock className="w-3 h-3" /> Pending</span>;
  }
};

export default AdminDashboard;
