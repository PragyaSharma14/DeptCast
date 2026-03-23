import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { getProjectDetails, generateVideo } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { ArrowLeft, Play, Loader2, Clock, FileText, CheckCircle } from 'lucide-react';

export const Review = () => {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const details = await getProjectDetails(projectId);
        setData(details); // Expected { project, scenes }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchProject();
  }, [projectId]);

  const handleStartRender = async () => {
    setStarting(true);
    try {
      await generateVideo(projectId);
      setLocation(`/videos/${projectId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start final render.");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin text-brand h-12 w-12" />
      </div>
    );
  }

  if (!data?.project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
        <Button onClick={() => setLocation('/')} variant="secondary">Back to Dashboard</Button>
      </div>
    );
  }

  const { project, scenes } = data;

  // Metadata calculations
  const totalWords = scenes.reduce((acc, s) => acc + (s.description?.split(' ').length || 0), 0);
  const estSeconds = Math.round(totalWords / 2.5); // avg 150 words per minute ~ 2.5 words per sec
  const formatTime = (sec) => `${Math.floor(sec / 60)}m ${sec % 60}s`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLocation('/')}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Review Script</h1>
            <p className="text-gray-400">Review AI-generated layout before final rendering.</p>
          </div>
        </div>
        
        <div className="hidden md:flex gap-4">
          <Button variant="outline" onClick={() => setLocation('/videos/new')}>Regenerate</Button>
          <Button onClick={handleStartRender} disabled={starting}>
            {starting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            Compile Video
          </Button>
        </div>
      </div>

      {/* Script Metadata Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-black/40">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
             <FileText className="h-6 w-6 text-brand mb-2" />
             <div className="text-2xl font-bold text-white">{totalWords}</div>
             <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Words</div>
          </CardContent>
        </Card>
        <Card className="bg-black/40">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
             <Clock className="h-6 w-6 text-blue-400 mb-2" />
             <div className="text-2xl font-bold text-white">{formatTime(estSeconds)}</div>
             <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Est. Duration</div>
          </CardContent>
        </Card>
        <Card className="bg-black/40 md:col-span-2">
          <CardContent className="p-4 flex items-center justify-between h-full group">
             <div>
               <div className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                 <CheckCircle className="h-4 w-4 text-green-400" />
                 Ready for Render
               </div>
               <div className="text-xs text-gray-500 uppercase tracking-widest line-clamp-1">{project.style} - {project.domain}</div>
             </div>
             <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
               <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Original Prompt Highlight */}
      <Card>
        <CardContent className="p-6 bg-brand/5 border-l-4 border-l-brand">
          <p className="text-sm font-medium text-brand mb-2 uppercase tracking-widest">Source Instruction</p>
          <p className="text-gray-300 italic text-sm">{project.prompt || project.intent}</p>
        </CardContent>
      </Card>

      {/* Scene Breakdown List */}
      <div className="space-y-4">
        <h3 className="text-xl font-heading font-semibold text-white mb-4">Scene Sequence</h3>
        {scenes.map((scene, i) => (
          <Card key={scene._id || i} className="group hover:border-white/20 transition-colors">
            <CardContent className="p-5 flex gap-6 items-center">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg text-gray-400 group-hover:bg-brand/10 group-hover:text-brand group-hover:border-brand/30 transition-all">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-gray-200 text-[15px] leading-relaxed select-text">{scene.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile Action Bar */}
      <div className="md:hidden flex flex-col gap-3 sticky bottom-6 z-40 bg-darker/80 backdrop-blur-xl p-4 rounded-xl border border-white/10">
        <Button onClick={handleStartRender} disabled={starting} className="w-full">
          {starting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          Compile Video
        </Button>
        <Button variant="outline" className="w-full">Regenerate AI</Button>
      </div>

    </div>
  );
};
