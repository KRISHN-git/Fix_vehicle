import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle }) => {
    const location = useLocation();
    const isLogin = location.pathname === '/login';

    return (
        <div className="min-h-screen w-full flex bg-[#F8FAFC]"> 
            {/* Left Side - Dark Panel */}
            <div className="hidden lg:flex w-1/2 bg-[#0F172A] relative flex-col items-center justify-center p-12 overflow-hidden">
                {/* Subtle gradient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center max-w-md">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-8"
                    >
                        <Car className="w-12 h-12 text-white" />
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-[3.25rem] font-extrabold text-white mb-6 leading-[1.1]"
                    >
                        Detect your <br/> <span className="text-blue-500">damage</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-slate-400 text-[1.05rem] px-4 leading-relaxed font-medium max-w-md mx-auto"
                    >
                        Effortlessly analyze your vehicle's damage and find the price, summary, guidance all in one place.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-8 text-[10px] font-bold tracking-[0.2em] text-slate-500/60 uppercase"
                    >
                        Smart Damage Assessment
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Light Panel */}
            <div className="flex-1 flex flex-col relative w-full lg:w-1/2 items-center min-h-screen overflow-y-auto">
                {/* Header */}
                <div className="w-full max-w-3xl px-8 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md z-20">
                    <div className="w-10"></div>
                    
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[0.5rem] bg-blue-600 flex items-center justify-center">
                            <Car className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight">DamageDetector</span>
                    </Link>

                    <div className="w-10"></div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex items-center justify-center w-full px-4 sm:px-6 lg:px-8 py-10">
                    <div className="w-full max-w-[440px]">
                        {/* The White Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10 p-6 w-full relative z-10"
                        >
                            
                            {/* Tab Toggle */}
                            <div className="bg-slate-50/80 p-1.5 rounded-xl flex mb-10 border border-slate-100/50">
                                <Link 
                                    to="/login"
                                    className={`flex-1 text-center py-2.5 rounded-[0.6rem] text-[13px] font-bold transition-all ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Sign In
                                </Link>
                                <Link 
                                    to="/register"
                                    className={`flex-1 text-center py-2.5 rounded-[0.6rem] text-[13px] font-bold transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Sign Up
                                </Link>
                            </div>

                            <div className="text-center mb-8">
                                <h2 className="text-[1.7rem] font-bold text-slate-900 mb-2">{title}</h2>
                                <p className="text-[13px] text-slate-500 font-medium">{subtitle}</p>
                            </div>

                            {children}
                            
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
