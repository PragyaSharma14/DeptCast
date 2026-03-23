import React, { useEffect, useState } from 'react';
import { getProjects } from '../services/api';
import { useLocation } from 'wouter';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PlusCircle, Play, Calendar, Users, Briefcase, Shield, Palette, Video } from 'lucide-react';
import { motion } from 'framer-motion';

const DEPARTMENTS = [
  { id: 'hr', name: 'Human Resources', icon: Users, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  { id: 'it', name: 'IT Support', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'marketing', name: 'Marketing', icon: Palette, color: 'text-brand', bg: 'bg-brand/10' },
  { id: 'operations', name: 'Operations', icon: Briefcase, color: 'text-green-400', bg: 'bg-green-400/10' },
];

export const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleStartDepartment = (deptId) => {
    localStorage.setItem('deptcast_current_dept', deptId);
    setLocation('/videos/new');
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-tight">
            Welcome to <span className="text-gradient-brand">DeptCast</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Transform dry corporate text into highly engaging, AI-generated videos in minutes.
          </p>
        </div>
        <Button onClick={() => setLocation('/videos/new')} size="lg" className="w-full md:w-auto shrink-0 group">
          <PlusCircle className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
          Create New Video
        </Button>
      </div>

      {/* Departments Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-semibold text-white">Start by Department</h2>
          <span className="text-sm text-gray-500 font-medium">Select a context to begin</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEPARTMENTS.map((dept, i) => (
            <motion.div 
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card 
                animate 
                className="cursor-pointer group hover:border-brand/50 transition-colors"
                onClick={() => handleStartDepartment(dept.id)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-2xl ${dept.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <dept.icon className={`h-8 w-8 ${dept.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-brand transition-colors">
                    {dept.name}
                  </h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Videos Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-heading font-semibold text-white">Recently Created</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border border-white/10 border-dashed rounded-3xl bg-white/5 backdrop-blur-sm">
            <div className="bg-white/5 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No videos yet</h3>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">Create your first AI-generated corporate communication to see it here.</p>
            <Button onClick={() => setLocation('/videos/new')} variant="secondary">
              Get Started
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project._id} className="overflow-hidden group cursor-pointer" onClick={() => setLocation(`/videos/${project._id}`)}>
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-black relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-brand/10 group-hover:bg-brand/20 transition-colors" />
                  <Play className="h-12 w-12 text-white/50 group-hover:text-white group-hover:scale-110 transition-all z-10 drop-shadow-lg" fill="currentColor" />
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold text-white truncate mb-2 group-hover:text-brand transition-colors">
                    {project.prompt ? project.prompt.substring(0, 40) + '...' : 'Untitled Video'}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span className="capitalize bg-white/10 px-2 py-0.5 rounded-md text-xs">
                      {project.status.toLowerCase()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

