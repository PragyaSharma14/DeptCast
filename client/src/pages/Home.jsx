import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
    getDashboardStats, 
    getDashboardSchedules,
} from '../services/api';
import { 
    MessageSquare, Users, TrendingUp, Bell,
    ArrowRight, Video, Sparkles, FileText, CheckCircle2,
    Calendar, Clock, LayoutGrid, PenTool
} from 'lucide-react';
import { CreateScheduleModal } from '../components/features/CreateScheduleModal';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';

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
                <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Workspace...</p>
            </div>
        );
    }

    const quickSpecs = [
        { title: 'Human Resources', icon: Users, color: 'text-brand', bg: 'bg-blue-50', desc: 'HR videos covering policies, events, leave, benefits, and...' },
        { title: 'Finance & Accounts', icon: LayoutGrid, color: 'text-brand', bg: 'bg-blue-50', desc: 'Finance videos on budgets, tax, expense policies, and financial...' },
        { title: 'Administration', icon: LayoutGrid, color: 'text-brand', bg: 'bg-blue-50', desc: 'Admin videos on facilities, travel, housekeeping, and office...' },
        { title: 'Legal & Compliance', icon: LayoutGrid, color: 'text-brand', bg: 'bg-blue-50', desc: 'Legal and compliance videos on regulations, contracts, and ethi...' }
    ];

    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="pb-20 w-full"
        >
            {/* Dark Hero Section */}
            <div className="relative bg-[#0a0a0d] rounded-2xl p-12 overflow-hidden shadow-2xl pb-32">
                <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent pointer-events-none" />
                
                <div className="relative z-10 max-w-3xl space-y-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 w-fit">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Enterprise Communication Platform</span>
                    </div>
                    
                    <h1 className="text-5xl font-heading font-bold text-white leading-tight">
                        Smarter Communication<br/>
                        for <span className="text-cyan-400">Modern Enterprises</span>
                    </h1>
                    
                    <p className="text-lg text-slate-300 font-medium">
                        Communicate Faster. Engage Better. Scale Everywhere.
                    </p>
                </div>
            </div>

            {/* Floating AI Insights Card */}
            <motion.div variants={item} className="relative z-20 -mt-20 mx-4 lg:mx-12">
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-purple p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-white" size={20} />
                            <div>
                                <h3 className="text-white font-bold text-sm">AI Communication Insights</h3>
                                <p className="text-white/70 text-[11px] font-medium">Powered by DeptCast AI Advisor</p>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-white/20 rounded-full border border-white/20 backdrop-blur-md text-white text-[10px] font-bold tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            LIVE
                        </div>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Communication Advisor</p>
                            <div className="space-y-3">
                                {[
                                    { text: "HR messages perform 35% better as videos than plain emails." },
                                    { text: "Monday mornings have the highest employee engagement across all departments." },
                                    { text: "Your CEO messages get 2.3x higher watch rate than any other sender." }
                                ].map((bullet, i) => (
                                    <div key={i} className="flex gap-3">
                                        <CheckCircle2 className="text-brand shrink-0 mt-0.5" size={16} />
                                        <p className="text-sm font-medium text-slate-700">{bullet.text}</p>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="pt-4 border-t border-slate-100 mt-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Company Avatar</p>
                                <div className="flex flex-col sm:flex-row items-center gap-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                    <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                                        <Users className="text-emerald-600" size={20} />
                                    </div>
                                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                        Create an <span className="font-bold text-emerald-700">AI avatar</span> for your company to deliver messages and announcements with a consistent on-brand presence.
                                    </p>
                                </div>
                                <Button className="w-full sm:w-auto mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm">
                                    <Users className="mr-2" size={16} /> Create Avatar
                                </Button>
                            </div>
                        </div>
                        
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 w-full flex flex-col justify-between h-auto lg:h-[160px]">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Suggestion</p>
                                    <p className="text-sm text-slate-700 font-medium">
                                        <Sparkles className="inline text-purple-500 mb-1 mr-1" size={14} /> 
                                        Convert your latest <span className="font-bold text-purple-600">HR email</span> into a short video for better engagement with your employees.
                                    </p>
                                </div>
                                <Button 
                                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 text-sm shadow-md transition-all active:scale-[0.98] btn-primary" 
                                    onClick={() => setLocation('/videos/new')}
                                >
                                    <Video className="mr-2" size={16} /> Generate Video
                                </Button>
                            </div>
                            
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 w-full flex flex-col justify-between h-auto lg:h-[160px]">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Presentations → Video</p>
                                    <p className="text-sm text-slate-700 font-medium">
                                        <FileText className="inline text-orange-500 mb-1 mr-1" size={14} /> 
                                        Convert your <span className="font-bold text-orange-600">presentations (PDF / PPT / Slides)</span> into a short video for better engagement with your employees.
                                    </p>
                                </div>
                                <Button 
                                    className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3 text-sm shadow-md transition-all active:scale-[0.98] btn-primary" 
                                    onClick={() => setLocation('/videos/new')}
                                >
                                    <Video className="mr-2" size={16} /> Create Video
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Content Container Below Hero */}
            <div className="mt-12 space-y-12">
                
                {/* Communication Performance Snapshot */}
                <div className="space-y-4">
                    <h2 className="text-xl font-heading font-bold text-slate-900 flex justify-between items-center px-1">
                        <span className="flex items-center gap-2">
                            <Sparkles className="text-brand" size={20} /> Communication Performance Snapshot
                        </span>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Last 30 days</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand/5 rounded-full" />
                            <MessageSquare className="text-brand mb-4" size={24} />
                            <p className="text-3xl font-heading font-bold text-slate-900">{stats?.totalReach || '128'}</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Total Messages Sent</p>
                        </div>
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500/5 rounded-full" />
                            <Users className="text-emerald-500 mb-4" size={24} />
                            <p className="text-3xl font-heading font-bold text-slate-900">8,420</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Employees Reached</p>
                        </div>
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/5 rounded-full" />
                            <TrendingUp className="text-purple-500 mb-4" size={24} />
                            <p className="text-3xl font-heading font-bold text-slate-900 flex items-end gap-1">72<span className="text-xl text-slate-400">%</span></p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 mb-3">Average Engagement</p>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-gradient-purple h-full w-[72%]" />
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-500/5 rounded-full" />
                            <Bell className="text-orange-500 mb-4" size={24} />
                            <p className="text-3xl font-heading font-bold text-slate-900">356</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 mb-3">Unread Communications</p>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                <span className="text-xs font-bold text-orange-600">Action required</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Scheduled Communications */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-2">
                            <Calendar className="text-brand" size={20} /> Upcoming Scheduled Communications
                        </h2>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-500">{schedules.length} scheduled</span>
                            <Button variant="ghost" size="sm" className="text-brand hover:bg-brand/10" onClick={() => setIsModalOpen(true)}>
                                Schedule New
                            </Button>
                        </div>
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm">
                        {schedules.length > 0 ? schedules.map((job, idx) => (
                            <div key={job.id} className={cn("p-5 flex items-center justify-between group transition-colors hover:bg-slate-50", idx !== schedules.length - 1 ? "border-b border-slate-100" : "")}>
                                <div className="flex items-center gap-4">
                                    <div className="mt-0.5 w-4 h-4 rounded-full border-2 border-brand relative flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{job.title}</h4>
                                        <div className="flex items-center gap-2 mt-1 text-xs font-medium text-slate-500">
                                            <Calendar size={12} />
                                            <span>
                                                {new Date(job.scheduledAt).toLocaleDateString(undefined, { weekday: 'long' })} • {new Date(job.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold text-brand uppercase tracking-widest px-2.5 py-1 bg-brand/5 rounded border border-brand/20">
                                        {job.department || 'General'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={() => setLocation(`/videos/produce/${job.projectId}`)}>
                                            <PenTool size={14} className="mr-1.5" /> Edit
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="p-10 flex flex-col items-center justify-center text-center">
                                <Calendar className="text-slate-300 mb-3" size={32} />
                                <p className="text-slate-500 font-semibold">No upcoming broadcasts.</p>
                                <p className="text-sm text-slate-400 mt-1">Schedule a video broadcast to keep your team aligned.</p>
                                <Button variant="secondary" size="sm" className="mt-4" onClick={() => setIsModalOpen(true)}>Create Schedule</Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Create Panel */}
                <div className="space-y-4">
                    <h2 className="text-xl font-heading font-bold text-slate-900 px-1">Quick Create Panel</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {quickSpecs.map((q, i) => (
                            <motion.div 
                                key={i}
                                variants={item}
                                className="group relative p-6 rounded-2xl bg-white border border-slate-200 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5 transition-all w-full flex flex-col overflow-hidden cursor-pointer"
                                onClick={() => setLocation('/videos/new')}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                                <div className="relative z-10">
                                    <div className={cn("inline-flex p-3 rounded-xl mb-4", q.bg)}>
                                        <q.icon className={q.color} size={20} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">{q.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed mb-6">
                                        {q.desc}
                                    </p>
                                </div>
                                <div className="mt-auto relative z-10 flex items-center font-bold text-brand text-[13px] group-hover:text-brand-700">
                                    View blueprints <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.div>
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

