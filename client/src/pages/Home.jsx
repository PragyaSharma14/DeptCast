import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    getDashboardStats, 
    getDashboardSchedules,
} from '../services/api';
import { 
    Zap, TrendingUp, Users, MessageSquare, 
    Calendar, Clock, ChevronRight, Video,
    Sparkles, ArrowUpRight, Plus, Bell,
    Target, Activity, Banknote, Briefcase, Shield
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Home = () => {
    const [, setLocation] = useLocation();
    const [stats, setStats] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        loadData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10 pb-20"
        >
            {/* 1. Hero Section */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand/20 via-black to-black border border-white/5 p-12 lg:p-16">
                <div className="absolute top-0 right-0 p-8 opacity-20 hidden lg:block">
                     <div className="relative w-64 h-64 border-2 border-brand/30 rounded-full animate-spin-slow flex items-center justify-center">
                        <div className="w-48 h-48 border border-white/10 rounded-full" />
                        <Sparkles className="absolute top-0 text-brand w-8 h-8" />
                     </div>
                </div>
                
                <div className="relative z-10 max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/30 px-4 py-1.5 rounded-full text-xs font-black text-brand uppercase tracking-widest">
                        <Activity size={14} />
                        Enterprise Communication Platform
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-heading font-black text-white leading-[1.1] tracking-tight">
                        Smarter Communication <br />
                        <span className="text-gradient-brand">for Modern Enterprises</span>
                    </h1>
                    <p className="text-lg text-gray-400 font-medium max-w-xl leading-relaxed">
                        Transform your corporate broadcasts into high-engagement cinematic narratives. Communicate faster, engage better, and scale everywhere.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Button size="lg" className="rounded-2xl px-8 py-6 h-auto" onClick={() => setLocation('/videos/new')}>
                            <Plus className="mr-2" size={20} />
                            Create New Video
                        </Button>
                        <Button variant="secondary" size="lg" className="rounded-2xl px-8 py-6 h-auto">
                            View Analytics
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* 2. AI Advisor Insight Panel */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-white/10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 bg-brand/20 px-3 py-1 text-[10px] font-black text-white rounded-bl-xl tracking-widest uppercase flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Live Optimization
                    </div>
                    <CardContent className="p-8">
                        <div className="flex items-start gap-6">
                            <div className="p-4 bg-brand rounded-2xl shadow-xl shadow-brand/30">
                                <Zap className="text-white fill-current" size={32} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    AI Communication Insights
                                    <span className="text-xs font-normal text-gray-500">Powered by DeptCast Advisor</span>
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                                        HR messages perform <span className="text-white font-bold text-base mx-1">35% better</span> as videos than plain emails.
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                                        Monday mornings have the highest employee engagement across all departments.
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                                        Your CEO messages get <span className="text-white font-bold text-base mx-1">2.3x higher</span> watch rate than any other sender.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-white/5 border-white/5 relative group cursor-pointer hover:border-brand/30 transition-all overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-8 flex flex-col h-full justify-between">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em]">Quick Action</p>
                            <h3 className="text-xl font-bold leading-tight">Create Company Avatar</h3>
                        </div>
                        <p className="text-sm text-gray-400">Deploy a consistent on-brand presence for all CEO announcements.</p>
                        <Button className="w-full bg-white/10 hover:bg-white/20 border-white/10 h-14 rounded-2xl group">
                            Configure Now
                            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 3. Performance Snapshot */}
            <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-heading font-black flex items-center gap-3">
                        <Target className="text-brand" size={24} />
                        Performance Snapshot
                    </h2>
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Last 30 Days</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Messages', value: stats?.stats?.totalVideos || 0, icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                        { label: 'Employees Reached', value: (stats?.stats?.totalVideos || 0) * 124, icon: Users, color: 'text-green-400', bg: 'bg-green-400/10' },
                        { label: 'Avg Engagement', value: '72%', icon: TrendingUp, color: 'text-brand', bg: 'bg-brand/10' },
                        { label: 'Unread Comms', value: '356', icon: Bell, color: 'text-orange-400', bg: 'bg-orange-400/10' }
                    ].map((stat, i) => (
                        <Card key={i} className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-colors">
                            <CardContent className="p-6 space-y-4">
                                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={stat.color} size={24} />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-white tabular-nums">{stat.value}</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </motion.div>

            {/* 4. Upcoming Schedules */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-heading font-black flex items-center gap-3">
                            <Calendar className="text-brand" size={24} />
                            Upcoming Communications
                        </h2>
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{schedules.length} Scheduled</span>
                    </div>

                    <div className="space-y-4">
                        {schedules.length > 0 ? schedules.map((job) => (
                            <div key={job.id} className="group bg-white/5 border border-white/5 rounded-3xl p-6 flex items-center justify-between hover:bg-white/[0.07] transition-all cursor-pointer">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center border border-white/10 group-hover:border-brand/40 transition-colors">
                                        <div className="text-center">
                                            <p className="text-[10px] text-brand font-black uppercase leading-none">{new Date(job.scheduledAt).toLocaleString('default', { month: 'short' })}</p>
                                            <p className="text-xl font-black text-white">{new Date(job.scheduledAt).getDate()}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-white group-hover:text-brand transition-colors">{job.title}</h4>
                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 lowercase">
                                            <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(job.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="px-2 py-0.5 bg-white/5 rounded-full uppercase text-[9px] tracking-tighter">Production</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="secondary" size="sm" className="bg-white/5 border-white/10 text-[10px] font-black h-9 px-4 rounded-xl">Edit</Button>
                                    <Button variant="secondary" size="sm" className="bg-white/5 border-white/10 text-[10px] font-black h-9 px-4 rounded-xl">Reschedule</Button>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-[2rem] space-y-4">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-gray-400 font-bold">No upcoming broadcasts scheduled.</p>
                                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">Plan your next production to see it here</p>
                                </div>
                                <Button variant="secondary" className="rounded-xl mt-4" onClick={() => setLocation('/videos/new')}>Create Schedule</Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-heading font-black px-2">Quick Create</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { name: 'Human Resources', id: 'hr', icon: Users, color: 'text-pink-400', bg: 'bg-pink-400/10' },
                            { name: 'Finance & Accounts', id: 'finance', icon: Banknote, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                            { name: 'Administration', id: 'admin', icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                            { name: 'Legal & Compliance', id: 'legal', icon: Shield, color: 'text-teal-400', bg: 'bg-teal-400/10' }
                        ].map((dept) => (
                            <button 
                                key={dept.id} 
                                onClick={() => {
                                    localStorage.setItem('deptcast_current_dept', dept.id);
                                    setLocation('/videos/new');
                                }}
                                className="group flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-brand/40 hover:bg-white/5 transition-all text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${dept.bg} group-hover:scale-110 transition-transform`}>
                                        <dept.icon className={dept.color} size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white group-hover:text-brand transition-colors">{dept.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Video Production</p>
                                    </div>
                                </div>
                                <Plus size={16} className="text-gray-600 group-hover:text-brand" />
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

