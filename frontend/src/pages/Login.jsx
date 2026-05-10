import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Signing in...');
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`, { id: loadingToast });
      if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const loadingToast = toast.loading('Logging in with Google...');
    try {
      const user = await googleLogin(credentialResponse.credential);
      toast.success(`Welcome back, ${user.name}!`, { id: loadingToast });
      if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google login failed', { id: loadingToast });
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-slate-100 relative"
      >
        <Link 
          to="/" 
          className="absolute top-6 left-6 p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all group"
          title="Back to Home"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </Link>

        <div className="text-center mb-10 pt-2">

          <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-primary w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-primary">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Login to manage your land records</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="email" 
                  required 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-black placeholder:text-slate-400"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-black placeholder:text-slate-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-grow h-px bg-slate-200"></div>
          <span className="text-slate-400 text-sm font-medium">OR</span>
          <div className="flex-grow h-px bg-slate-200"></div>
        </div>

        <div className="flex justify-center">
          {import.meta.env.VITE_GOOGLE_CLIENT_ID === 'your_google_client_id_here' ? (
            <div className="text-amber-600 bg-amber-50 p-4 rounded-xl text-sm border border-amber-200">
              ⚠️ Please add your <b>Google Client ID</b> in the .env file to enable Google Login.
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed')}
              theme="filled_blue"
              shape="pill"
              width="100%"
            />
          )}
        </div>


        <div className="mt-8 text-center text-gray-600">
          Don't have an account? {' '}
          <Link to="/register" className="text-primary font-bold hover:underline">Register Now</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

