import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { API_BASE_URL } from '../utils/constants';
import { motion } from 'framer-motion';
import axios from 'axios';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/register`, {
                name,
                email,
                password
            });
            login(res.data.user, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });
            const data = await res.json();
            if (res.ok) {
                login(data.user, data.token);
                navigate('/dashboard');
            } else {
                setError(data.error || data.message || 'Google login failed');
            }
        } catch (err) {
            setError('Google login failed');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    return (
        <AuthLayout title="Create Account" subtitle="Start your financial journey">
            
            <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: error ? 1 : 0, height: error ? 'auto' : 0, marginBottom: error ? 16 : 0 }}
                className="overflow-hidden"
            >
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        {error}
                    </div>
                )}
            </motion.div>

            <motion.form
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <motion.div variants={itemVariants}>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" strokeWidth={2.5} />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 bg-[#F8FAFC] border-none rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold text-[13px]"
                            placeholder="Full Name"
                            required
                        />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" strokeWidth={2.5}/>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 bg-[#F8FAFC] border-none rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold text-[13px]"
                            placeholder="Email Address"
                            required
                        />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" strokeWidth={2.5}/>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-11 pr-12 py-3.5 bg-[#F8FAFC] border-none rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold text-[13px]"
                            placeholder="Password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-full transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={2.5}/> : <Eye className="w-4 h-4" strokeWidth={2.5}/>}
                        </button>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="text-[11px] font-semibold text-slate-500 mt-2 mb-6 px-1">
                    By signing up, you agree to our <a href="#" className="underline hover:text-blue-600">Terms</a>.
                </motion.div>

                <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3.5 px-6 border border-transparent rounded-xl shadow-md shadow-blue-600/20 text-[14px] font-bold text-white bg-[#3B82F6] hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                </motion.button>
            </motion.form>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-8 relative mb-8"
            >
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-white text-slate-400 font-semibold">Or continue with</span>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex justify-center"
            >
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google Login Failed')}
                    shape="pill"
                    size="large"
                    text="continue_with"
                    width="280"
                />
            </motion.div>
        </AuthLayout>
    );
};

export default Register;
