import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
    getDashboardStats, 
    getDashboardSchedules,
} from '../services/api';
import { 
    Zap, TrendingUp, Users, 
    Calendar, Clock, ChevronRight,
    Sparkles, ArrowUpRight, Plus, Bell,
    Target, Activity, Banknote, Briefcase, Shield
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CreateScheduleModal } from '../components/features/CreateScheduleModal';
import { cn } from '../lib/utils';

export const Home = () => {
    const [, setLocation] = useLocation();
    const [stats, setStats] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadData = async () => {
        try {
            const [statData, scheduleData] = await Promise.all([
                getDashboardStats(),
                getDashboardSchedules()
            ]);
            setStats(statData);
            setSchedules(scheduleData);
        } catch (err) {
            console.error("Dashboard Load Error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Assembling Dashboard...</p>
            </div>
        );
    }

    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-10 pb-20"
        >
            {/* 1. Hero Content - Executive Command */}
            <motion.div variants={item} className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-12 text-white shadow-2xl shadow-indigo-600/20">
                <div className="relative z-10 max-w-2xl space-y-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 w-fit backdrop-blur-md">
                        <Sparkles size={14} className="text-white" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Enterprise AI Broadcast</span>
                    </div>
                    <h1 className="text-5xl font-heading font-black leading-[1.1] tracking-tight text-white">
                        Corporate Production <span className="text-white/60">Stage.</span>
                    </h1>
                    <p className="text-lg text-indigo-50 leading-relaxed font-medium">
                        Deploy executive vision across every department with precision. 
                        AI-powered video orchestration for the modern workforce.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Button variant="secondary" size="lg" className="rounded-2xl px-8 py-6 h-auto bg-white text-indigo-600 hover:bg-white/90 border-none shadow-xl" onClick={() => setLocation('/videos/new')}>
                            <Plus className="mr-2" size={20} />
                            Initiate Broadcast
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-2xl px-8 py-6 h-auto border-white/30 text-white hover:bg-white/10">
                            Enterprise Insights
                        </Button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                        <circle cx="80" cy="20" r="40" />
                        <circle cx="100" cy="80" r="30" />
                    </svg>
                </div>
            </motion.div>

            {/* 2. Strategic Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 overflow-hidden group border-slate-200">
                    <CardContent className="p-8 flex gap-8">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-50 rounded-2xl">
                                    <Target className="text-indigo-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-heading font-black text-slate-900">Reach Optimization</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">AI INSIGHT • CURRENT CYCLE</p>
                                </div>
                            </div>
                            <p className="text-slate-600 font-medium leading-relaxed">
                                Your current video consistency is at <span className="text-indigo-600 font-bold">84%</span>. 
                                We've identified an engagement gap in <span className="underline decoration-indigo-200 underline-offset-4 font-bold text-slate-900">Technical Operations</span>. 
                                Broadcast a status update to drive alignment.
                            </p>
                            <Button variant="default" size="sm" className="rounded-xl px-6 py-5 h-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all font-bold">
                                Deploy Broadcast <ArrowUpRight className="ml-2" size={14} />
                            </Button>
                        </div>
                        <div className="hidden sm:flex items-center justify-center p-8 bg-slate-50 rounded-[2rem] border border-slate-100 group-hover:scale-105 transition-transform">
                            <Activity className="text-indigo-400 animate-pulse" size={48} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 text-white overflow-hidden relative border-none shadow-xl shadow-slate-900/20">
                    <CardContent className="p-8 h-full flex flex-col justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Total Reach</h3>
                            <div className="text-5xl font-heading font-black tracking-tight">{stats?.totalReach || '12.8K'}</div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs font-bold py-3 border-b border-white/10">
                                <span className="text-white/50 uppercase tracking-widest">Active Rate</span>
                                <span className="text-emerald-400 flex items-center gap-1">
                                    +12.4% <TrendingUp size={12} />
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold py-3">
                                <span className="text-white/50 uppercase tracking-widest">Live Broadcasts</span>
                                <span>{stats?.totalVideos || 24}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Production Inventory */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Calendar className="text-indigo-600" size={24} />
                            <h2 className="text-2xl font-heading font-black text-slate-900">Upcoming Broadcasts</h2>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-indigo-600 font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(true)}>
                            New Schedule <Plus className="ml-1" size={14} />
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {schedules.length > 0 ? schedules.map((job) => (
                            <motion.div 
                                key={job.id}
                                variants={item}
                                whileHover={{ x: 10 }}
                                className="group p-6 bg-white border border-slate-200 rounded-[2rem] flex items-center justify-between transition-all hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 shadow-sm"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                                        <Clock className="text-slate-400 group-hover:text-indigo-600" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">{job.title}</h4>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded-md text-slate-500">
                                                {new Date(job.scheduledAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded-md text-indigo-600">
                                                {new Date(job.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mr-2">
                                    <Button variant="outline" size="sm" className="rounded-xl opacity-0 group-hover:opacity-100 transition-all border-slate-200 text-slate-600" onClick={() => setLocation(`/videos/produce/${job.projectId}`)}>
                                        Stage View
                                    </Button>
                                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="py-20 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] space-y-4">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                    <Calendar className="text-slate-200" size={32} />
                                </div>
                                <div>
                                    <p className="text-slate-500 font-bold text-lg">Inventory Clear.</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1 font-black">Plan your next executive update</p>
                                </div>
                                <Button variant="secondary" className="rounded-2xl mt-4 px-8" onClick={() => setIsModalOpen(true)}>Create Broadcast Schedule</Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Deploy Departments */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-heading font-black px-2 text-slate-900">Quick Deploy</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { name: 'Human Resources', id: 'hr', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            { name: 'Finance & Growth', id: 'finance', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { name: 'Operations', id: 'ops', icon: Briefcase, color: 'text-slate-600', bg: 'bg-slate-100' },
                            { name: 'Legal & Risk', id: 'legal', icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50' }
                        ].map((q, i) => (
                            <motion.button 
                                key={i}
                                variants={item}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="group flex items-center justify-between p-5 rounded-[2rem] bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all text-left shadow-sm"
                                onClick={() => setLocation('/videos/new')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", q.bg)}>
                                        <q.icon className={q.color} size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{q.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Ready for Production</p>
                                    </div>
                                </div>
                                <Plus size={16} className="text-slate-300 group-hover:text-indigo-600 mr-2" />
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            <CreateScheduleModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadData}
            />
        </motion.div>
    );
};

