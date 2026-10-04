import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Mail, ArrowRight, Lock, UserCheck } from 'lucide-react';
import api from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@sara.ai');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { role: 'ADMIN', name: 'Control Room Admin', email: 'admin@sara.ai', pass: 'admin123', color: 'red' },
    { role: 'POLICE', name: 'Police Control Room', email: 'police@sara.ai', pass: 'police123', color: 'amber' },
    { role: 'HOSPITAL', name: 'SMS Hospital Desk', email: 'hospital@sara.ai', pass: 'hospital123', color: 'blue' },
    { role: 'DRIVER', name: 'Ambulance Driver', email: 'driver@sara.ai', pass: 'driver123', color: 'emerald' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user } = res.data;
      localStorage.setItem('sara_token', access_token);
      localStorage.setItem('sara_user', JSON.stringify(user));
      onLoginSuccess(user, access_token);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6 selection:bg-red-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-xl shadow-red-900/40 mx-auto">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white">S.A.R.A. System Access</h1>
          <p className="text-xs text-slate-400">Smart AI Rescue & Ambulance Routing Assistant</p>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-semibold text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium"
                  placeholder="admin@sara.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{loading ? 'AUTHENTICATING...' : 'SIGN IN TO CONTROL ROOM'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Quick Demo Login Options
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  className={`p-2 rounded-xl text-left border transition-all text-xs ${
                    email === acc.email
                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                      : 'bg-navy-900/60 border-white/5 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <div className="font-bold text-slate-200">{acc.role}</div>
                  <div className="text-[10px] text-slate-400 truncate">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500">
          JWT Authenticated Demo Session • Jaipur, RJ
        </div>
      </div>
    </div>
  );
};
