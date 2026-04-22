import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useStore } from '../store/useStore';
import { login as loginApi, register as registerApi, getOrgDetails } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Loader2, Video as VideoIcon, Sparkles, Zap, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [infoMessage, setInfoMessage] = useState('');
    
    const [, setLocation] = useLocation();
    const { setUser, setToken, setActiveOrg } = useStore();

    const features = [
        { icon: Sparkles, title: "AI Production Blueprints", desc: "Draft complex production scripts with one click." },
        { icon: Zap, title: "Instant Turbo Rendering", desc: "Our bootstrap technology eliminates API wait times." },
        { icon: ShieldCheck, title: "Enterprise-Grade Security", desc: "Seamless workspace isolation and tenant security." }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setInfoMessage('');
        setLoading(true);

        try {
            const data = isLogin 
                ? await loginApi({ email, password })
                : await registerApi({ name, email, password });
            
            setToken(data.token);
            
            // Set basic user info
            const userData = {
                _id: data._id,
                name: data.name,
                email: data.email,
                currentOrganizationId: data.currentOrganizationId
            };
            setUser(userData);

            // Immediately attempt to sync the active organization details
            if (data.currentOrganizationId) {
                try {
                    const orgDetails = await getOrgDetails(data.currentOrganizationId);
                    if (orgDetails && orgDetails.organization) {
                        setActiveOrg(orgDetails.organization);
                    }
                } catch (orgErr) {
                    console.warn("Auth: Failed to fetch initial organization details", orgErr);
                    // Minimal fallback if direct fetch fails
                    setActiveOrg({ _id: data.currentOrganizationId, name: 'My Workspace' });
                }
            }
            
            setLocation('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 font-sans selection:bg-indigo-100">
            
            {/* Left Pane - Strategy & Value (Executive Side) */}
            <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 text-white relative overflow-hidden">
                {/* Background Atmosphere */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20">
                            <VideoIcon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter font-heading text-white">
                            Dept<span className="text-indigo-400">Cast</span>
                        </span>
                    </div>

                    <div className="max-w-md space-y-12 mt-20">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-5xl font-heading font-black leading-tight mb-6 text-white">
                                Powering the next gen of <span className="text-indigo-300">Video Content.</span>
                            </h2>
                            <p className="text-slate-300 text-lg leading-relaxed font-medium">
                                Join hundreds of IT firms and enterprise departments using DeptCast to automate their high-fidelity production pipelines.
                            </p>
                        </motion.div>

                        <div className="space-y-8 mt-12">
                            {features.map((feature, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 + (idx * 0.1) }}
                                    className="flex items-start gap-5 group"
                                >
                                    <div className="mt-1 p-2.5 rounded-lg bg-white/10 border border-white/20 group-hover:bg-indigo-600/30 group-hover:border-indigo-600/50 transition-all">
                                        <feature.icon className="h-5 w-5 text-indigo-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-white mb-1">{feature.title}</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 border-t border-white/10 pt-10 mt-20">
                   <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-9 h-9 rounded-full border-2 border-slate-900 bg-slate-700 shadow-xl" />
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Trusted by 2k+ Teams</p>
                   </div>
                </div>
            </div>

            {/* Right Pane - Interaction & Form (Precision Side) */}
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 relative overflow-hidden bg-white sm:bg-slate-50">
                {/* Mobile Tablet Branding */}
                <div className="lg:hidden flex items-center gap-3 mb-10">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <VideoIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tighter font-heading">DeptCast</span>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={isLogin ? 'login' : 'register'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-md"
                    >
                        <div className="text-center sm:text-left mb-10">
                            <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight mb-3">
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </h1>
                            <p className="text-slate-500 font-medium">
                                {isLogin ? 'Access your enterprise dashboard and production studio.' : 'Register to start your first visual blueprint today.'}
                            </p>
                        </div>

                        <Card className="bg-white border-none sm:border sm:border-slate-200 sm:shadow-[0_20px_60px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden">
                            <CardContent className="p-8 sm:p-10">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-4 bg-slate-50 border border-red-200 rounded-2xl text-red-600 text-[11px] font-bold flex items-start gap-3 shadow-sm shadow-red-500/5"
                                        >
                                            <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                                            <span>{error}</span>
                                        </motion.div>
                                    )}

                                    {infoMessage && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-700 text-[11px] font-bold flex items-start gap-3 shadow-sm shadow-indigo-500/5"
                                        >
                                            <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-indigo-500" />
                                            <span>{infoMessage}</span>
                                        </motion.div>
                                    )}

                                    {!isLogin && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Full Name</label>
                                            <Input 
                                                type="text" 
                                                placeholder="John Doe" 
                                                value={name} 
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                className="bg-slate-50 border-slate-200 h-14 rounded-2xl focus:ring-indigo-600 focus:border-indigo-600 font-bold px-5 text-slate-900"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Email Address</label>
                                        <Input 
                                            type="email" 
                                            placeholder="name@company.com" 
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="bg-slate-50 border-slate-200 h-14 rounded-2xl focus:ring-indigo-600 focus:border-indigo-600 font-bold px-5 text-slate-900"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">Password</label>
                                            {isLogin && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => setInfoMessage("Password recovery is managed by your organization's IT department. Please coordinate with your system administrator for access recovery.")}
                                                    className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                                                >
                                                    Forgot Password?
                                                </button>
                                            )}
                                        </div>
                                        <Input 
                                            type="password" 
                                            placeholder="••••••••" 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-slate-50 border-slate-200 h-14 rounded-2xl focus:ring-indigo-600 focus:border-indigo-600 font-bold px-5 text-slate-900"
                                        />
                                    </div>

                                    <Button 
                                        type="submit" 
                                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-indigo-600/20"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                                    </Button>
                                </form>

                                <div className="mt-10 flex flex-col items-center gap-4">
                                    <div className="w-full flex items-center gap-4 text-slate-200">
                                        <div className="flex-1 h-px bg-slate-100" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Account Actions</span>
                                        <div className="flex-1 h-px bg-slate-100" />
                                    </div>

                                    <button 
                                        type="button" 
                                        onClick={() => { setIsLogin(!isLogin); setError(''); setInfoMessage(''); }}
                                        className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-all uppercase tracking-widest"
                                    >
                                        {isLogin ? (
                                            <>Don't have an account? <span className="text-indigo-600">Sign up</span></>
                                        ) : (
                                            <>Already have an account? <span className="text-indigo-600">Log In</span></>
                                        )}
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Footer Notes */}
                <div className="mt-12 text-[10px] text-slate-300 font-bold uppercase tracking-widest flex items-center gap-6">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-slate-200" /> Secure Encryption</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-slate-200" /> SOC2 Compliant</span>
                </div>
            </div>
        </div>
    );
};
